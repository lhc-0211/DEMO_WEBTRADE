// src/components/BodyTable.tsx
import { memo, useEffect, useMemo } from "react";
import {
  ALL_COLUMNS,
  KEYS_COLOR,
} from "../../../../../configs/headerPriceBoard";
import { useAppSelector } from "../../../../../store/hook";
import { selectSnapshotsBySymbols } from "../../../../../store/slices/stock/selector";
import type { Column, PriceCompare } from "../../../../../types";
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
    try {
      return saved ? JSON.parse(saved) : ALL_COLUMNS;
    } catch {
      return ALL_COLUMNS;
    }
  }, []);

  const textColorClasses = useMemo(() => {
    const classes: Record<string, string> = {};

    KEYS_COLOR.forEach((key) => {
      let cmp: PriceCompare | undefined;

      if (key === "lastPrice") {
        cmp = snapshot.trade?.priceCompare;
      } else if (key.startsWith("priceBuy")) {
        const idx = parseInt(key[8]) - 1;
        cmp = snapshot.orderBook?.bids?.[idx]?.priceCompare;
      } else if (key.startsWith("priceSell")) {
        const idx = parseInt(key[9]) - 1;
        cmp = snapshot.orderBook?.asks?.[idx]?.priceCompare;
      } else if (key.startsWith("change")) {
        cmp = snapshot.trade?.priceCompare;
      } else if (key.startsWith("changePc")) {
        cmp = snapshot.trade?.priceCompare;
      } else if (key === "lastVolume") {
        cmp = snapshot.trade?.priceCompare;
      } else if (key.startsWith("volumeBuy")) {
        const idx = parseInt(key[9]) - 1;
        cmp = snapshot.orderBook?.bids?.[idx]?.priceCompare;
      } else if (key.startsWith("volumeSell")) {
        const idx = parseInt(key[10]) - 1;
        cmp = snapshot.orderBook?.asks?.[idx]?.priceCompare;
      }

      classes[key] = cmp || "text-text-body";
    });

    return classes;
  }, [snapshot]);

  useEffect(() => {
    const timer = setTimeout(() => {
      columns.forEach((col) => {
        if (col.children) {
          col.children.forEach((child) => {
            const el = document.querySelector<HTMLElement>(
              `[data-symbol="${symbol}"][data-key="${child.key}"]`
            );
            if (el) registerVisibleCell(symbol, child.key, el);
          });
        } else {
          const el = document.querySelector<HTMLElement>(
            `[data-symbol="${symbol}"][data-key="${col.key}"]`
          );
          if (el) registerVisibleCell(symbol, col.key, el);
        }
      });
    }, 0);

    return () => {
      clearTimeout(timer);
      unregisterVisibleCell(symbol);
    };
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
                  textColorClasses[col.key]
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
                      textColorClasses[child.key]
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
