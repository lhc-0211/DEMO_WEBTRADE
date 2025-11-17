import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { memo, useCallback, useEffect, useState } from "react";
import { List, type ListRowProps } from "react-virtualized";
import type { RenderedRows } from "react-virtualized/dist/es/List";
import {
  HEADER_HEIGHT,
  ROW_HEIGHT,
} from "../../../../../configs/headerPriceBoard.ts";
import { usePerfectScrollbar } from "../../../../../hooks/usePerfectScrollbar.ts";
import { socketClient } from "../../../../../services/socket";
import { useAppSelector } from "../../../../../store/hook";
import { selectSymbolsByBoardId } from "../../../../../store/slices/priceboard/selector.ts";
import { selectSnapshotsBySymbols } from "../../../../../store/slices/stock/selector";
import type { SnapshotDataCompact } from "../../../../../types/socketCient.ts";
import BodyTableBase from "./BodyTable";
import HeaderColumnsBase from "./HeaderTable";

// === CẤU TRÚC CACHE ===
interface CachedBoardData {
  groupId: string;
  symbols: string[];
}

// === PROPS ===
interface PriceBoardBaseProps {
  boardId: string;
}

// === SORTABLE ROW ===
interface SortableRowProps {
  symbol: string;
  snapshot: SnapshotDataCompact;
  index: number;
}

function SortableRow({ symbol, snapshot, index }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging, isOver } =
    useSortable({ id: symbol });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : "all 0.2s ease",
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 999 : 1,
    position: "relative",
    boxShadow: isDragging
      ? "0 12px 24px rgba(0,0,0,0.12), 0 6px 12px rgba(0,0,0,0.08)"
      : "none",
    transformOrigin: "center",
    scale: isDragging ? "0.98" : "1",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${index % 2 === 1 ? "bg-gray-300/30" : ""}
        ${
          isDragging
            ? "ring-2 ring-DTND-500 ring-opacity-50 border-t border-border"
            : "hover:bg-gray-300/40"
        }
      `}
    >
      {isOver && !isDragging && (
        <div
          className="absolute inset-x-0 -top-px h-0.5 bg-linear-to-r from-DTND-500 to-DTND-400 animate-pulse"
          style={{ zIndex: 100 }}
        />
      )}
      <BodyTableBase
        symbol={symbol}
        snapshot={snapshot}
        dragListeners={listeners}
        dragAttributes={attributes}
      />
    </div>
  );
}

// === MAIN COMPONENT ===
function PriceBoardBase({ boardId }: PriceBoardBaseProps) {
  const { containerRef } = usePerfectScrollbar();
  const [containerWidth, setContainerWidth] = useState(1200);
  const [listHeight, setListHeight] = useState(500);

  // Redux
  const baseSymbols = useAppSelector((state) =>
    selectSymbolsByBoardId(state, boardId)
  );
  const snapshots = useAppSelector((state) =>
    selectSnapshotsBySymbols(state, baseSymbols)
  );

  const [symbols, setSymbols] = useState<string[]>([]);

  // === KHỞI TẠO TỪ CACHE ===
  useEffect(() => {
    const cacheKey = `stocks_${boardId}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData) as unknown;
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "groupId" in parsed &&
          "symbols" in parsed &&
          Array.isArray((parsed as CachedBoardData).symbols)
        ) {
          const data = parsed as CachedBoardData;
          const ordered = data.symbols.filter((s) => baseSymbols.includes(s));
          const missing = baseSymbols.filter((s) => !ordered.includes(s));
          setSymbols([...ordered, ...missing]);
          return;
        }
      } catch (e) {
        console.warn("Failed to parse cache", e);
      }
    }
    setSymbols(baseSymbols);
  }, [baseSymbols, boardId]);

  // === ĐỒNG BỘ baseSymbols ===
  useEffect(() => {
    setSymbols((prev) => {
      const newSymbols = [...prev];
      baseSymbols.forEach((s) => !newSymbols.includes(s) && newSymbols.push(s));
      const filtered = newSymbols.filter((s) => baseSymbols.includes(s));

      const cacheKey = `stocks_${boardId}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData) as Partial<CachedBoardData>;
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              groupId: parsed.groupId || boardId,
              symbols: filtered,
            })
          );
        } catch (err) {
          console.error(err);
        }
      }
      return filtered;
    });
  }, [baseSymbols, boardId]);

  // === RESIZE ===
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setContainerWidth(rect.width);
      setListHeight(rect.height - HEADER_HEIGHT);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [containerRef]);

  // === VISIBLE SYMBOLS ===
  const updateVisibleSymbols = useCallback(
    ({ startIndex, stopIndex }: RenderedRows) => {
      const visible = symbols.slice(startIndex, stopIndex + 1);
      socketClient.setVisibleSymbols(visible);
    },
    [symbols]
  );

  // === DnD SENSORS ===
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // === DRAG END ===
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSymbols((items) => {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      const newOrder = arrayMove(items, oldIndex, newIndex);

      const cacheKey = `stocks_${boardId}`;
      const cachedData = localStorage.getItem(cacheKey);
      const updated: CachedBoardData = cachedData
        ? {
            ...(JSON.parse(cachedData) as Partial<CachedBoardData>),
            groupId: boardId,
            symbols: newOrder,
          }
        : { groupId: boardId, symbols: newOrder };

      localStorage.setItem(cacheKey, JSON.stringify(updated));
      return newOrder;
    });
  };

  // === ROW RENDERER ===
  const rowRenderer = ({ index, key, style }: ListRowProps) => {
    const symbol = symbols[index];
    if (!symbol) return null;
    const snapshot = snapshots[symbol];
    return (
      <div key={key} style={style}>
        <SortableRow
          symbol={symbol}
          snapshot={snapshot ?? { symbol }}
          index={index}
        />
      </div>
    );
  };

  // === RENDER ===
  return (
    <div
      className="h-[calc(var(--app-height)-289px)] overflow-hidden"
      ref={containerRef}
    >
      <div className="min-w-[1812px] flex flex-col">
        <div style={{ height: HEADER_HEIGHT }}>
          <HeaderColumnsBase />
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={symbols}
            strategy={verticalListSortingStrategy}
          >
            <List
              height={listHeight}
              rowCount={symbols.length}
              rowHeight={ROW_HEIGHT}
              rowRenderer={rowRenderer}
              width={Math.max(containerWidth, 1812)}
              onRowsRendered={updateVisibleSymbols}
              className="hide-scrollbar"
            />
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

export default memo(PriceBoardBase);
