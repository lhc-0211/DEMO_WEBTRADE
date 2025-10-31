import { memo, useEffect, useMemo, useRef } from "react";
import { ALL_COLUMNS } from "../../../../../configs/headerPriceBoard";
import { useAppSelector } from "../../../../../store/hook";
import { selectSnapshotsBySymbols } from "../../../../../store/slices/stock/selector";
import type { Column } from "../../../../../types";
import { getColumnValue } from "../../../../../utils/priceboard";

import {
  registerVisibleCellColor,
  unregisterVisibleCellColor,
} from "../../../../../worker/colorManager";
import {
  registerVisibleCell,
  unregisterVisibleCell,
} from "../../../../../worker/flashManager";

interface BodyTableProps {
  symbol: string;
}

function BodyTable({ symbol }: BodyTableProps) {
  // --- lấy snapshot từ Redux ---
  const snapshotData = useAppSelector(
    (state) => selectSnapshotsBySymbols(state, [symbol])[symbol]
  );

  const snapshot = useMemo(() => {
    return snapshotData ?? { symbol };
  }, [snapshotData, symbol]);

  // --- lấy cấu hình cột ---
  const columns = useMemo<Column[]>(() => {
    const saved = localStorage.getItem("clientConfig");
    try {
      return saved ? JSON.parse(saved) : ALL_COLUMNS;
    } catch {
      return ALL_COLUMNS;
    }
  }, []);

  // --- ref để lưu cell DOM ---
  const cellRefs = useRef<Map<string, HTMLElement>>(new Map());

  // === REGISTER CELLS ===
  useEffect(() => {
    const registerCell = (key: string) => {
      const selector = `[data-symbol="${symbol}"][data-key="${key}"]`;
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        cellRefs.current.set(key, el);
        // đăng ký flash & color
        registerVisibleCell(symbol, key, el);
        registerVisibleCellColor(symbol, key, el);
      }
    };

    // duyệt toàn bộ column và children
    columns.forEach((col) => {
      if (col.children?.length) {
        col.children.forEach((child) => registerCell(child.key));
      } else {
        registerCell(col.key);
      }
    });

    // cleanup
    const refSnapshot = cellRefs.current;
    return () => {
      refSnapshot.clear();
      unregisterVisibleCell(symbol);
      unregisterVisibleCellColor(symbol);
    };
  }, [symbol, columns]);

  // === RENDER CELL ===
  const renderCell = (key: string, width?: number) => {
    const value = getColumnValue(snapshot, key);

    // màu tĩnh mặc định cho các cột đặc biệt
    const baseColorClass =
      key === "ceil"
        ? "c"
        : key === "floor"
        ? "f"
        : key === "ref"
        ? "r"
        : "text-text-body";

    return (
      <div
        key={key}
        data-symbol={symbol}
        data-key={key}
        className={`flex items-center justify-center text-xs font-medium h-7 ${baseColorClass}`}
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
              className="h-7 grid place-items-center text-xs font-medium"
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
