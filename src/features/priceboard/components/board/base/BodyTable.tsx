// src/components/BodyTable.tsx
import { memo, useEffect, useMemo } from "react";
import { ALL_COLUMNS } from "../../../../../configs/headerPriceBoard";
import { useAppSelector } from "../../../../../store/hook";
import {
  selectColorsBySymbol,
  selectSnapshotsBySymbols,
} from "../../../../../store/slices/stock/selector";
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
  const cellColors = useAppSelector((state) =>
    selectColorsBySymbol(state, symbol)
  );

  const columns = useMemo<Column[]>(() => {
    const saved = localStorage.getItem("clientConfig");
    try {
      return saved ? JSON.parse(saved) : ALL_COLUMNS;
    } catch {
      return ALL_COLUMNS;
    }
  }, []);

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
  }, [symbol, columns]);

  const renderCell = (key: string, value: string | number) => (
    <div
      data-symbol={symbol}
      data-key={key}
      className={`flex items-center justify-center text-xs font-medium select-none h-7 transition-colors duration-300 ${
        cellColors[key] || "text-text-body"
      }`}
      style={{ minWidth: key === "symbol" ? 60 : undefined }}
    >
      {value}
    </div>
  );

  return (
    <div className="flex border-x border-b border-border divide-x divide-border w-full">
      {columns.map((col) => {
        const hasChildren = !!col.children?.length;

        if (col.key === "mark" || col.key === "symbol") {
          return (
            <div
              key={col.key}
              className={`h-7 grid place-items-center text-xs font-medium select-none ${
                col.key === "symbol"
                  ? cellColors["lastPrice"] || "text-text-body"
                  : ""
              }`}
              style={{ minWidth: col.width }}
            >
              <div
                data-symbol={symbol}
                data-key={col.key}
                className="flex items-center justify-center h-7"
              >
                {getColumnValue(snapshot, col.key)}
              </div>
            </div>
          );
        }

        return (
          <div key={col.key} className="flex flex-col w-full">
            {!hasChildren ? (
              renderCell(col.key, getColumnValue(snapshot, col.key))
            ) : (
              <div className="flex divide-x divide-border text-xs font-medium select-none">
                {col.children?.map((child) => (
                  <div
                    key={child.key}
                    className="flex-1"
                    style={{ minWidth: child.width }}
                  >
                    {renderCell(child.key, getColumnValue(snapshot, child.key))}
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
