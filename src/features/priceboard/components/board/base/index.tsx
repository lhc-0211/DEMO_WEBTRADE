// src/components/PriceBoard.tsx
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { List } from "react-virtualized";
import type { RenderedRows } from "react-virtualized/dist/es/List";
import { socketClient } from "../../../../../services/socket";
import { useAppSelector } from "../../../../../store/hook";
import { selectAllSymbols } from "../../../../../store/slices/stock/selector";
import BodyTable from "./BodyTable";
import HeaderColumns from "./HeaderTable";

const ROW_HEIGHT = 28;

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

  useEffect(() => {
    const initSymbols = ["HPG:G1:STO", "VCB:G1:STO", "MWG:G1:STO"];
    socketClient.subscribe({ symbols: initSymbols });
    return () => {
      socketClient.unsubscribe({ symbols: initSymbols });
    };
  }, []);

  // Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // SỬA: Dùng RenderedRows
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
    <div className="h-full flex flex-col">
      <HeaderColumns />
      <div ref={containerRef} className="flex-1 overflow-hidden">
        <List
          ref={listRef}
          height={800}
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
