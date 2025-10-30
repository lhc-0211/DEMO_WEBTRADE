import { memo, useCallback, useEffect, useRef, useState } from "react";
import { List } from "react-virtualized";
import type { RenderedRows } from "react-virtualized/dist/es/List";
import { socketClient } from "../../../../../services/socket";
import { useAppDispatch, useAppSelector } from "../../../../../store/hook";
import { selectAllSymbols } from "../../../../../store/slices/stock/selector";
import { setSubscribedOrder } from "../../../../../store/slices/stock/slice";
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
  const dispatch = useAppDispatch();

  const symbols = useAppSelector(selectAllSymbols);
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [listHeight, setListHeight] = useState(500);

  // Resize Observer
  useEffect(() => {
    const list = [
      "VCB:G1:STO",
      "MWG:G1:STO",
      "HPG:G1:STO",
      "SHB:G1:STX",
      "ACB:G1:STX",
      "CEO:G1:STX",
    ];

    dispatch(setSubscribedOrder(list));
    socketClient.subscribe({
      symbols: list,
    });

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
      socketClient.unsubscribe({
        symbols: [
          "MWG:G1:STO",
          "HPG:G1:STO",
          "VCB:G1:STO",
          "SHB:G1:STX",
          "ACB:G1:STX",
          "CEO:G1:STX",
        ],
      });
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
      <div>
        <List
          ref={listRef}
          height={listHeight}
          rowCount={symbols.length}
          rowHeight={ROW_HEIGHT}
          rowRenderer={rowRenderer}
          width={containerWidth}
          onRowsRendered={updateVisibleSymbols}
          className="hide-scrollbar"
        />
      </div>
    </div>
  );
}

export default memo(PriceBoard);
