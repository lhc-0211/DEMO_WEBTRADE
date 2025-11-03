import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { memo, useEffect, useMemo, useRef } from "react";
import { ALL_COLUMNS } from "../../../../../configs/headerPriceBoard";
import type { Column, SnapshotDataCompact } from "../../../../../types";
import { getColumnValueCompact } from "../../../../../utils/priceboard";
import {
  registerVisibleCellColor,
  unregisterVisibleCellColor,
} from "../../../../../worker/colorManager";
import {
  registerVisibleCell,
  unregisterVisibleCell,
} from "../../../../../worker/flashManager";

interface PriceCellProps {
  symbol: string;
  cellKey: string;
  width?: number;
  snapshot: SnapshotDataCompact;
}

const PriceCell = memo(function PriceCell({
  symbol,
  cellKey,
  width,
  snapshot,
}: PriceCellProps) {
  const cellRef = useRef<HTMLDivElement>(null);
  const value = getColumnValueCompact(snapshot, cellKey);

  useEffect(() => {
    if (cellRef.current) {
      registerVisibleCell(symbol, cellKey, cellRef.current);
      registerVisibleCellColor(symbol, cellKey, cellRef.current);
    }
    return () => {
      unregisterVisibleCell(symbol, cellKey);
      unregisterVisibleCellColor(symbol, cellKey);
    };
  }, [symbol, cellKey]);

  const baseColorClass =
    cellKey === "ceil"
      ? "c"
      : cellKey === "floor"
      ? "f"
      : cellKey === "ref"
      ? "r"
      : "text-text-body";

  return (
    <div
      ref={cellRef}
      data-symbol={symbol}
      data-key={cellKey}
      className={`flex items-center justify-center text-xs font-medium h-7 ${baseColorClass}`}
      style={{ minWidth: width }}
    >
      {value ?? ""}
    </div>
  );
});

interface BodyTableProps {
  symbol: string;
  snapshot: SnapshotDataCompact;
  // DnD props
  dragListeners?: DraggableSyntheticListeners;
  dragAttributes?: DraggableAttributes;
}

function BodyTable({
  symbol,
  snapshot,
  dragListeners,
  dragAttributes,
}: BodyTableProps) {
  const columns = useMemo<Column[]>(() => {
    const saved = localStorage.getItem("clientConfig");
    try {
      return saved ? JSON.parse(saved) : ALL_COLUMNS;
    } catch {
      return ALL_COLUMNS;
    }
  }, []);

  useEffect(() => {
    return () => {
      unregisterVisibleCell(symbol);
      unregisterVisibleCellColor(symbol);
    };
  }, [symbol]);

  return (
    <div className="flex border-x border-b border-border divide-x divide-border w-full">
      {columns.map((col) => {
        const hasChildren = !!col.children?.length;

        if (col.key === "symbol") {
          return (
            <div
              key={col.key}
              className="h-7 grid place-items-center text-xs font-medium"
              style={{ minWidth: col.width }}
            >
              <div
                className="flex items-center justify-center h-7 cursor-grab active:cursor-grabbing"
                {...dragListeners}
                {...dragAttributes}
              >
                {getColumnValueCompact(snapshot, col.key)}
                <svg
                  className="w-4 h-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
            </div>
          );
        }
        return (
          <div key={col.key} className="flex flex-col w-full">
            {!hasChildren ? (
              <PriceCell
                symbol={symbol}
                cellKey={col.key}
                width={col.width}
                snapshot={snapshot}
              />
            ) : (
              <div className="flex divide-x divide-border text-xs font-medium">
                {col.children?.map((child) => (
                  <PriceCell
                    key={child.key}
                    cellKey={child.key}
                    symbol={symbol}
                    width={child.width}
                    snapshot={snapshot}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default memo(BodyTable);
