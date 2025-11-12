import { useEffect, useState } from "react";
import { getScrollbarSize, List, type RowComponentProps } from "react-window";
import { HEADER_HEIGHT } from "../../../../../configs/headerPriceBoard.ts";
import { usePerfectScrollbar } from "../../../../../hooks/usePerfectScrollbar.ts";

function TableAsk({ addresses }: { addresses?: any[] }) {
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
            Bên bán
          </div>
          <div className="flex flex-row items-center justify-center w-full divide-x divide-border bg-gray-300/50 text-xs font-medium">
            <div className="flex-1 grid place-items-center h-7">STT</div>
            <div className="flex-1 grid place-items-center min-w-10  h-7">
              Mã CK
            </div>
            <div className="flex-1 grid place-items-center h-7">Giá</div>
            <div className="flex-1 grid place-items-center h-7">KL</div>
            <div className="flex-1 grid place-items-center min-w-20 h-7">
              Thời gian
            </div>
          </div>
        </div>
        <div className="shrink" style={{ width: size }} />
      </div>

      <div className="overflow-hidden">
        <List
          height={listHeight}
          rowComponent={RowComponent}
          rowCount={addresses?.length || 0}
          rowHeight={25}
          rowProps={{ addresses }}
          width={Math.max(containerWidth, 1812)}
        />
      </div>
    </div>
  );
}

function RowComponent({
  index,
  addresses,
  style,
}: RowComponentProps<{
  addresses: any[];
}>) {
  const address = addresses[index];

  return (
    <div className="flex flex-row items-center gap-2 px-2" style={style}>
      <div className="flex-1">{address.city}</div>
      <div className="flex-1">{address.state}</div>
      <div className="w-10 text-xs">{address.zip}</div>
      <div className="w-10 text-xs">{address.zip}</div>
      <div className="w-10 text-xs">{address.zip}</div>
    </div>
  );
}

export default TableAsk;
