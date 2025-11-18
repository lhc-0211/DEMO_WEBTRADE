import _ from "lodash";
import { memo, useEffect, useState } from "react";
import { getScrollbarSize, List, type RowComponentProps } from "react-window";
import { usePrevious } from "../../hooks/usePrevious";
import { useAppSelector } from "../../store/hook";
import { selectSnapshotsBySymbols } from "../../store/slices/stock/selector";
import { formatPrice, formatVolPrice } from "../../utils";

function OrderHisDetail({ symbol }: { symbol: string }) {
  const snapshots = useAppSelector((state) =>
    selectSnapshotsBySymbols(state, symbol.split(",").filter(Boolean))
  );

  const snapshotCurrent = snapshots[symbol];

  const [size] = useState(getScrollbarSize);
  const [datas, setDatas] = useState<any>([]);
  const preListOrderHis = usePrevious(snapshotCurrent?.trade);

  useEffect(() => {
    const current: any = snapshotCurrent?.trade;
    if (!current) return;

    if (preListOrderHis && _.isEqual(current, preListOrderHis)) return;

    setDatas((prev: any) => {
      const map = new Map();

      // Đặt current lên đầu
      map.set(`${current.symbol}_${current["10"]}`, current);

      // Thêm các phần tử cũ
      prev.forEach((item: any) =>
        map.set(`${item.symbol}_${item["10"]}`, item)
      );

      return Array.from(map.values());
    });
  }, [snapshotCurrent?.trade, preListOrderHis]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row p-1 px-2">
        <div className="grow flex flex-row items-center gap-2 text-text-body font-normal">
          <div className="flex-1 text-xs grid place-items-center">
            Thời gian
          </div>
          <div className="flex-1 text-xs grid place-items-center">M/B</div>
          <div className="flex-1 text-xs grid place-items-center">Giá</div>
          <div className="flex-1 text-xs grid place-items-center">KL</div>
        </div>
        <div className="shrink" style={{ width: size }} />
      </div>
      <div className="overflow-hidden">
        <List
          rowComponent={RowComponent}
          rowCount={datas.length || 0}
          rowHeight={25}
          rowProps={{ datas }}
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
  datas: any[];
}>) {
  const data = datas[index];

  return (
    <div
      className="flex flex-row items-center gap-2 px-2 text-text-body font-normal h-4.5"
      style={style}
    >
      <div className="flex-1 text-[10px] grid place-items-center">
        {data?.["10"]}
      </div>
      <div className="flex-1 text-[10px] grid place-items-center">-</div>
      <div className="flex-1 text-[10px] grid place-items-center">
        {formatPrice(data?.["8"])}
      </div>
      <div className="flex-1 text-[10px] grid place-items-center">
        {formatVolPrice(data?.["9"])}
      </div>
    </div>
  );
}

export default memo(OrderHisDetail);
