import { useState } from "react";
import { MdOutlineArrowLeft, MdOutlineArrowRight } from "react-icons/md";
import { getScrollbarSize, type RowComponentProps } from "react-window";
import { useAppDispatch } from "../../../../store/hook";
import type {
  ModeTableSynThetic,
  topForeignTradedItem,
  topStockTradedItem,
} from "../../../../types";
import { numberFormat } from "../../../../utils";
import { SynTheticTableSkeleton } from "./SynTheticTableSkeleton";

function RowComponentInday({
  index,
  topStockTraded,
  style,
}: RowComponentProps<{
  topStockTraded: topStockTradedItem[];
}>) {
  const data = topStockTraded[index];
  return (
    <div
      className={`flex flex-row items-center gap-2 px-2 text-xs font-medium text-text-body rounded ${
        index % 2 === 0 && "bg-input"
      }`}
      style={style}
    >
      <div className={`w-20 ${data.status}`}>{data.symbol}</div>
      <div className="flex-1 text-right">
        {numberFormat(data.totalVolumeTraded)}
      </div>
      <div className={`flex-1 text-right ${data.status}`}>
        {numberFormat(data.lastPrice, 2)}
      </div>
    </div>
  );
}

function RowComponentForeign({
  index,
  topForeignTraded,
  style,
}: RowComponentProps<{
  topForeignTraded: topForeignTradedItem[];
}>) {
  const data = topForeignTraded[index];
  return (
    <div
      className={`flex flex-row items-center gap-2 px-2 text-xs font-medium text-text-body rounded ${
        index % 2 === 0 && "bg-input"
      }`}
      style={style}
    >
      <div className={`w-20 ${data.status}`}>{data.symbol}</div>
      <div className={`flex-1 text-right ${data.status}`}>
        {numberFormat(data.lastPrice, 2)}
      </div>
      <div className="flex-1 text-right">
        {numberFormat(data.sellVolumeTotal)}
      </div>
      <div className="flex-1 text-right">
        {numberFormat(data.buyVolumeTotal)}
      </div>
    </div>
  );
}

export default function SynTheticTable() {
  const disatch = useAppDispatch();

  // const topStockTraded = useAppSelector(selectTopStockTraded);
  // const { loading: loadingStock } = useAppSelector(selectTopStockTradedStatus);

  // const topForeignTraded = useAppSelector(
  //   (state) => state.priceBoard.data.topForeignTraded
  // );
  // const { loading: loadingForeign, error: errorForeign } = useAppSelector(
  //   (state) => state.priceBoard.status.fetchTopForeignTraded
  // );

  const [size] = useState(getScrollbarSize);
  const [modeTable, setModeTable] = useState<ModeTableSynThetic>("INDAY");

  // useEffect(() => {
  //   if (modeTable === "INDAY") {
  //     disatch(fetchTopStockTradedRequest("10"));
  //   } else {
  //     disatch(fetchTopForeignTradedRequest("10"));
  //   }
  // }, [modeTable, disatch]);

  return (
    <div className="bg-surface rounded-xl pb-1 px-1">
      <div className="flex flex-row items-center justify-between p-1 border-b border-border h-[33px]">
        <MdOutlineArrowLeft
          className="w-6 h-6 text-text-title cursor-pointer"
          onClick={() =>
            setModeTable((pre) => (pre === "INDAY" ? "FOREIGN" : "INDAY"))
          }
        />
        <h1 className="text-xs font-medium text-text-title">
          {modeTable === "INDAY"
            ? "Top KL giao dịch trong ngày"
            : "Top KL mua/bán Nước ngoài"}
        </h1>
        <MdOutlineArrowRight
          className="w-6 h-6 text-text-title cursor-pointer"
          onClick={() =>
            setModeTable((pre) => (pre === "INDAY" ? "FOREIGN" : "INDAY"))
          }
        />
      </div>
      {modeTable === "INDAY" ? (
        <div className="h-full flex flex-col">
          <div className="flex flex-row px-2 h-5">
            <div className="grow flex flex-row items-center gap-2 text-xs font-medium text-text-body">
              <div className="w-20">Mã CK</div>
              <div className="flex-1 text-right">KL</div>
              <div className="flex-1 text-right">Giá khớp</div>
            </div>
            <div className="shrink" style={{ width: size }} />
          </div>
          <div className="overflow-hidden h-[91px]">
            {/* {loadingStock ? (
              <SynTheticTableSkeleton type="INDAY" />
            ) : (
              <List
                rowComponent={RowComponentInday}
                rowCount={topStockTraded.length}
                rowHeight={20}
                rowProps={{ topStockTraded }}
              />
            )} */}
            <SynTheticTableSkeleton type="INDAY" />
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="flex flex-row px-2 h-5">
            <div className="grow flex flex-row items-center gap-2 text-xs font-medium text-text-body">
              <div className="w-20">Mã CK</div>
              <div className="flex-1 text-right">Giá</div>
              <div className="flex-1 text-right">KL mua</div>
              <div className="flex-1 text-right">KL bán</div>
            </div>
            <div className="shrink" style={{ width: size }} />
          </div>
          <div className="overflow-hidden h-[91px]">
            {/* {loadingForeign ? (
              <SynTheticTableSkeleton type="FOREIGN" />
            ) : errorForeign ? (
              <div className="w-full h-full text-red-500">
                Error:{errorForeign}
              </div>
            ) : (
              <List
                rowComponent={RowComponentForeign}
                rowCount={topForeignTraded.length}
                rowHeight={20}
                rowProps={{ topForeignTraded }}
              />
            )} */}
            <SynTheticTableSkeleton type="FOREIGN" />
          </div>
        </div>
      )}
    </div>
  );
}
