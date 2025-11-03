import { memo, useEffect, useMemo, useRef } from "react";
import { ALL_COLUMNS } from "../../../../../configs/headerPriceBoard";
import { useAppSelector } from "../../../../../store/hook";
import { selectSnapshotsBySymbols } from "../../../../../store/slices/stock/selector";
import type { Column, SnapshotDataCompact } from "../../../../../types";
import { getColumnValueCompact } from "../../../../../utils/priceboard";
import {
  registerVisibleCellColor,
  unregisterVisibleCellColor,
} from "../../../../../worker/colorManager";
import {
  registerVisibleCell,
  unregisterVisibleCell,
} from "../../../../../worker/flashManager";

// === TÁCH CELL THÀNH COMPONENT RIÊNG ===
interface PriceCellProps {
  symbol: string;
  cellKey: string;
  width?: number;
  snapshot: SnapshotDataCompact;
}

const PriceCell = memo(function PriceCell({
  symbol,
  cellKey,
  width,
  snapshot,
}: PriceCellProps) {
  const cellRef = useRef<HTMLDivElement>(null);
  const value = getColumnValueCompact(snapshot, cellKey);

  useEffect(() => {
    if (cellRef.current) {
      registerVisibleCell(symbol, cellKey, cellRef.current);
      registerVisibleCellColor(symbol, cellKey, cellRef.current);
    }
    return () => {
      unregisterVisibleCell(symbol, cellKey);
      unregisterVisibleCellColor(symbol, cellKey);
    };
  }, [symbol, cellKey]);

  const baseColorClass =
    cellKey === "ceil"
      ? "c"
      : cellKey === "floor"
      ? "f"
      : cellKey === "ref"
      ? "r"
      : "text-text-body";

  return (
    <div
      ref={cellRef}
      data-symbol={symbol}
      data-key={cellKey}
      className={`flex items-center justify-center text-xs font-medium h-7 ${baseColorClass}`}
      style={{ minWidth: width }}
    >
      {value ?? ""}
    </div>
  );
});

// === BODY TABLE ===
interface BodyTableProps {
  symbol: string;
}

function BodyTable({ symbol }: BodyTableProps) {
  const snapshotData = useAppSelector(
    (state) => selectSnapshotsBySymbols(state, [symbol])[symbol]
  );

  const snapshot = useMemo(
    () => snapshotData ?? { symbol },
    [snapshotData, symbol]
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
    return () => {
      unregisterVisibleCell(symbol);
      unregisterVisibleCellColor(symbol);
    };
  }, [symbol]);

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
                {getColumnValueCompact(snapshot, col.key)}
              </div>
            </div>
          );
        }

        return (
          <div key={col.key} className="flex flex-col w-full">
            {!hasChildren ? (
              <PriceCell
                symbol={symbol}
                cellKey={col.key}
                width={col.width}
                snapshot={snapshot}
              />
            ) : (
              <div className="flex divide-x divide-border text-xs font-medium">
                {col.children?.map((child) => (
                  <PriceCell
                    cellKey={child.key}
                    symbol={symbol}
                    width={child.width}
                    snapshot={snapshot}
                  />
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
