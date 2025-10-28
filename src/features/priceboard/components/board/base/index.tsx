import { memo, useCallback, useEffect, useRef, useState } from "react";
import { List } from "react-virtualized";
import type { RenderedRows } from "react-virtualized/dist/es/List";
import { socketClient } from "../../../../../services/socket";
import { useAppSelector } from "../../../../../store/hook";
import { selectAllSymbols } from "../../../../../store/slices/stock/selector";
import BodyTable from "./BodyTable";
import HeaderColumns from "./HeaderTable";

const ROW_HEIGHT = 29;
const HEADER_HEIGHT = 58; // chiều cao header

interface RowRendererParams {
  index: number;
  key: string;
  style: React.CSSProperties;
}

function PriceBoard() {
  const symbols = useAppSelector(selectAllSymbols);
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [listHeight, setListHeight] = useState(500);

  // Resize Observer
  useEffect(() => {
    socketClient.subscribe({ groupId: "hnx30" });

    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = entry.contentRect;

        setContainerWidth(rect.width);
        setListHeight(rect.height - HEADER_HEIGHT);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      socketClient.unsubscribe({ groupId: "hnx30" });
      resizeObserver.disconnect();
    };
  }, []);

  // Render rows visible
  const updateVisibleSymbols = useCallback(
    ({ startIndex, stopIndex }: RenderedRows): void => {
      const visible = symbols.slice(startIndex, stopIndex + 1);
      socketClient.setVisibleSymbols(visible);
    },
    [symbols]
  );

  const rowRenderer = ({ index, key, style }: RowRendererParams) => {
    const symbol = symbols[index];
    if (!symbol) return null;
    return (
      <div key={key} style={style}>
        <BodyTable symbol={symbol} />
      </div>
    );
  };

  return (
    <div
      className="h-[calc(var(--app-height)-289px)] flex flex-col"
      ref={containerRef}
    >
      <div style={{ width: containerWidth, height: HEADER_HEIGHT }}>
        <HeaderColumns />
      </div>
      <div className="flex-1 overflow-hidden">
        <List
          ref={listRef}
          height={listHeight}
          rowCount={symbols.length}
          rowHeight={ROW_HEIGHT}
          rowRenderer={rowRenderer}
          width={containerWidth}
          onRowsRendered={updateVisibleSymbols}
        />
      </div>
    </div>
  );
}

export default memo(PriceBoard);
