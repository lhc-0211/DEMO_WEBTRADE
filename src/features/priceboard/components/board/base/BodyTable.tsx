import { memo, useEffect, useMemo } from "react";
import { ALL_COLUMNS } from "../../../../../configs/headerPriceBoard";
import { useAppSelector } from "../../../../../store/hook";
import { selectSnapshotsBySymbols } from "../../../../../store/slices/stock/selector";
import type { Column } from "../../../../../types";
import { getColumnValue } from "../../../../../utils/priceboard";
import {
  registerVisibleCell,
  unregisterVisibleCell,
} from "../workers/flashManager";

function BodyTable({ symbol }: { symbol: string }) {
  const snapshot = useAppSelector(
    (state) => selectSnapshotsBySymbols(state, [symbol])[symbol]
  ) || { symbol };

  const columns = useMemo<Column[]>(() => {
    const saved = localStorage.getItem("clientConfig");
    return saved ? JSON.parse(saved) : ALL_COLUMNS;
  }, []);

  const textColorClasses = useMemo(() => {
    const classes: Record<string, string> = {};
    const keys = [
      "lastPrice",
      "lastVolume",
      "priceBuy1",
      "volumeBuy1",
      "priceBuy2",
      "volumeBuy2",
      "priceBuy3",
      "volumeBuy3",
      "priceSell1",
      "volumeSell1",
      "priceSell2",
      "volumeSell2",
      "priceSell3",
      "volumeSell3",
    ] as const;

    keys.forEach((key) => {
      let cmp: string | undefined;
      if (key === "lastPrice") {
        // cmp = snapshot.trade?.priceCompare;
      } else if (key.startsWith("priceBuy"))
        cmp = snapshot.orderBook?.bids?.[parseInt(key[8]) - 1]?.priceCompare;
      else if (key.startsWith("priceSell"))
        cmp = snapshot.orderBook?.asks?.[parseInt(key[9]) - 1]?.priceCompare;

      console.log("cmp", cmp);

      classes[key] = cmp || "text-text-body";
    });
    return classes;
  }, [snapshot]);

  useEffect(() => {
    const register = (key: string, el: HTMLElement | null) => {
      if (el) registerVisibleCell(symbol, key, el);
    };

    // Đăng ký tất cả cell
    columns.forEach((col) => {
      if (col.children) {
        col.children.forEach((child) =>
          register(
            child.key,
            document.querySelector(
              `[data-symbol="${symbol}"][data-key="${child.key}"]`
            )
          )
        );
      } else {
        register(
          col.key,
          document.querySelector(
            `[data-symbol="${symbol}"][data-key="${col.key}"]`
          )
        );
      }
    });

    return () => unregisterVisibleCell(symbol);
  }, [symbol, columns, snapshot]);

  return (
    <div className="flex border-x border-b border-border divide-x divide-border w-full">
      {columns.map((col) => {
        const hasChildren = !!col.children?.length;

        if (col.key === "mark" || col.key === "symbol") {
          return (
            <div
              key={col.key}
              className="h-7 grid place-items-center text-text-body text-xs font-medium select-none"
              style={{ minWidth: col.width }}
            >
              <div
                data-symbol={symbol}
                data-key={col.key}
                className={`flex items-center justify-center h-7 ${
                  col.children ? "border-b border-border" : ""
                }`}
                style={{ minWidth: col.width }}
              >
                {getColumnValue(snapshot, col.key)}
              </div>
            </div>
          );
        }

        return (
          <div key={col.key} className="flex flex-col w-full">
            {!hasChildren ? (
              <div
                data-symbol={symbol}
                data-key={col.key}
                className={`flex items-center justify-center text-xs font-medium select-none h-7 transition-colors duration-300 ${
                  textColorClasses[col.key] || "text-text-body"
                }`}
                style={{ minWidth: col.width }}
              >
                {getColumnValue(snapshot, col.key)}
              </div>
            ) : (
              <div className="flex divide-x divide-border text-xs font-medium select-none">
                {col.children?.map((child) => (
                  <div
                    key={child.key}
                    data-symbol={symbol}
                    data-key={child.key}
                    className={`flex-1 text-center h-7 grid place-items-center transition-colors duration-300 ${
                      textColorClasses[child.key] || "text-text-body"
                    }`}
                    style={{ minWidth: child.width }}
                  >
                    {getColumnValue(snapshot, child.key)}
                  </div>
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
