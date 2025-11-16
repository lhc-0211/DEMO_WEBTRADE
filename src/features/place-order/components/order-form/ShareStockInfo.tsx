import { memo } from "react";
import type { FetchShareCodeResponse } from "../../../../types/placeOrder";
import {
  colorFix,
  getBgColorStock,
  numberFormat,
  StringToDouble,
} from "../../../../utils";
import ShareStockInfoSkeleton from "./ShareStockInfoSkeleton";

function ShareStockInfo({
  shareStock,
  loading,
}: {
  shareStock: FetchShareCodeResponse["data"] | null;
  loading: boolean;
}) {
  if (loading || !shareStock) return <ShareStockInfoSkeleton />;

  const color =
    (shareStock &&
      colorFix(
        shareStock?.lastPrice,
        StringToDouble(shareStock?.r),
        StringToDouble(shareStock?.c),
        StringToDouble(shareStock?.f),
        StringToDouble(shareStock?.r)
      )) ||
    "";

  const _div = shareStock && StringToDouble(shareStock?.r) > 50 ? 1 : 2;

  return (
    <div className="flex flex-col bg-skin-card rounded-xl gap-3 p-3">
      <div className="flex items-center">
        {/* Ô giá chính */}
        <div
          className={`mr-3 p-2 rounded-lg h-16 w-[109px] flex flex-col items-center justify-center gap-1 ${color} ${getBgColorStock(
            color
          )}`}
        >
          <div className="text-2xl font-semibold">
            {numberFormat(shareStock?.lastPrice, _div, "0")}
          </div>
        </div>

        {/* Lưới giá trị */}
        <div className="grid grid-cols-3 gap-3 place-items-end">
          {[
            { label: "Trần", value: shareStock?.c, color: "c" },
            { label: "T.C", value: shareStock?.r, color: "r" },
            { label: "Sàn", value: shareStock?.f, color: "f" },
            { label: "Cao", value: shareStock?.highPrice },
            { label: "TB", value: shareStock?.avePrice },
            { label: "Thấp", value: shareStock?.lowPrice },
          ].map((item, idx) => (
            <div key={idx} className="grid gap-1 min-w-[60px] ml-4">
              <span className="text-skin-white-300 text-[10px] font-normal">
                {item.label}
              </span>
              <span className={`text-xs font-semibold ${item.color ?? color}`}>
                {numberFormat(item.value, _div, "0")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(ShareStockInfo);
