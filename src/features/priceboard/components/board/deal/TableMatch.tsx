import { useEffect, useState } from "react";
import { getScrollbarSize, List, type RowComponentProps } from "react-window";
import { HEADER_HEIGHT } from "../../../../../configs/headerPriceBoard.ts";
import { usePerfectScrollbar } from "../../../../../hooks/usePerfectScrollbar.ts";
import type { OrderDeal } from "../../../../../types/socketCient.ts";
import { formatPrice, formatVolPrice } from "../../../../../utils/format.ts";

function TableMatch({ data }: { data: OrderDeal[] }) {
  const [size] = useState(getScrollbarSize);
  const { containerRef } = usePerfectScrollbar();
  const [containerWidth, setContainerWidth] = useState(1200);
  const [listHeight, setListHeight] = useState(500);

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

  return (
    <div
      className="h-[calc(var(--app-height)-289px)] overflow-hidden flex flex-col"
      ref={containerRef}
    >
      <div className="flex flex-row" style={{ height: HEADER_HEIGHT }}>
        <div className="flex flex-col border border-border text-xs font-medium w-full">
          <div className="border-b border-border text-center bg-gray-300/50 text-xs font-medium h-7 grid place-items-center">
            Khớp lệnh
          </div>
          <div className="flex flex-row items-center justify-center w-full divide-x divide-border bg-gray-300/50 text-xs font-medium">
            <div className="w-1/6 grid place-items-center h-7">STT</div>
            <div className="w-1/6 grid place-items-center h-7">Mã CK</div>
            <div className="w-1/6 grid place-items-center h-7">Giá</div>
            <div className="w-1/6 grid place-items-center h-7">KL</div>
            <div className="w-1/6 grid place-items-center h-7">Giá trị</div>
            <div className="w-1/6 grid place-items-center h-7">Thời gian</div>
          </div>
        </div>
        <div className="shrink" style={{ width: size }} />
      </div>

      <div className="overflow-hidden">
        <List
          // height={listHeight}
          // width={containerWidth}
          rowComponent={RowComponent}
          rowCount={data?.length || 0}
          rowHeight={25}
          rowProps={{ datas: data || [] }}
        />
      </div>
    </div>
  );
}

function RowComponent({
  index,
  datas,
  style,
}: RowComponentProps<{
  datas: OrderDeal[];
}>) {
  const data = datas[index];

  return (
    <div
      className={`flex flex-row items-center h-7 divide-x divide-border border-b border-x border-border text-xs font-normal ${
        index % 2 === 0 ? "bg-gray-300/30" : ""
      }`}
      style={style}
    >
      <div className="w-1/6 grid place-items-center h-7">{index + 1}</div>
      <div className={`w-1/6 grid place-items-center h-7 ${data?.["13"]}`}>
        {data?.symbol?.split(":")[0]}
      </div>
      <div className={`w-1/6 grid place-items-center h-7 ${data?.["13"]}`}>
        {formatPrice(data["8"])}
      </div>
      <div className="w-1/6 grid place-items-center h-7">
        {formatVolPrice(data["9"])}
      </div>
      <div className="w-1/6 grid place-items-center h-7"></div>
      <div className="w-1/6 grid place-items-center h-7">{data["10"]}</div>
    </div>
  );
}

export default TableMatch;
