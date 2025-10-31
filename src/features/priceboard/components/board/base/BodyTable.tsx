import { memo, useEffect, useMemo, useRef } from "react";
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
} from "../../../../../worker/flashManager";

interface BodyTableProps {
  symbol: string;
}

function BodyTable({ symbol }: BodyTableProps) {
  const snapshotData = useAppSelector(
    (state) => selectSnapshotsBySymbols(state, [symbol])[symbol]
  );

  const snapshot = useMemo(() => {
    return snapshotData ?? { symbol };
  }, [snapshotData, symbol]);

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

  // Ref để cache DOM elements
  const cellRefs = useRef<Map<string, HTMLElement>>(new Map());

  // === REGISTER CELLS ===
  useEffect(() => {
    const registerCell = (key: string) => {
      const selector = `[data-symbol="${symbol}"][data-key="${key}"]`;
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        cellRefs.current.set(key, el);
        registerVisibleCell(symbol, key, el);
      }
    };

    columns.forEach((col) => {
      if (col.children) {
        col.children.forEach((child) => registerCell(child.key));
      } else {
        registerCell(col.key);
      }
    });

    const refSnapshot = cellRefs.current;

    return () => {
      refSnapshot.clear();
      unregisterVisibleCell(symbol);
    };
  }, [symbol, columns]);

  // === RENDER CELL ===
  const renderCell = (key: string, width?: number) => {
    const value = getColumnValue(snapshot, key);

    const colorClass =
      key === "ceil"
        ? "text-violet-500"
        : key === "floor"
        ? "text-blue-500"
        : key === "ref"
        ? "text-yellow-500"
        : cellColors[key] ?? "text-text-body";

    // const colorClass = cellColors[key] ?? "text-text-body";
    return (
      <div
        key={key}
        data-symbol={symbol}
        data-key={key}
        className={`flex items-center justify-center text-xs font-medium h-7 transition-colors duration-300 ${colorClass}`}
        style={{ minWidth: width }}
      >
        {value}
      </div>
    );
  };

  return (
    <div className="flex border-x border-b border-border divide-x divide-border w-full">
      {columns.map((col) => {
        const hasChildren = !!col.children?.length;

        if (col.key === "mark" || col.key === "symbol") {
          return (
            <div
              key={col.key}
              className={`h-7 grid place-items-center text-xs font-medium ${
                cellColors[col.key] ?? "text-text-body"
              }`}
              style={{ minWidth: col.width }}
            >
              <div
                data-symbol={symbol}
                data-key={col.key}
                className={`flex items-center justify-center h-7 ${
                  hasChildren ? "border-b border-border" : ""
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
              renderCell(col.key, col.width)
            ) : (
              <div className="flex divide-x divide-border text-xs font-medium">
                {col.children?.map((child) =>
                  renderCell(child.key, child.width)
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default memo(BodyTable);
