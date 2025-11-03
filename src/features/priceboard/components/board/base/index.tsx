import { memo, useCallback, useEffect, useRef, useState } from "react";
import { List } from "react-virtualized";
import type { RenderedRows } from "react-virtualized/dist/es/List";
import { usePerfectScrollbar } from "../../../../../hooks/usePerfectScrollbar.ts";
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
  const { containerRef } = usePerfectScrollbar();

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
      className="h-[calc(var(--app-height)-289px)] overflow-hidden"
      ref={containerRef}
    >
      <div className="min-w-[1812px] flex flex-col">
        <div style={{ height: HEADER_HEIGHT }}>
          <HeaderColumns />
        </div>

        <List
          ref={listRef}
          height={listHeight}
          rowCount={symbols.length}
          rowHeight={ROW_HEIGHT}
          rowRenderer={rowRenderer}
          width={containerWidth < 1812 ? 1812 : containerWidth} //cố định bằng min-width để đồng bộ | containerWidth
          onRowsRendered={updateVisibleSymbols}
        />
      </div>
    </div>
  );
}

export default memo(PriceBoard);
