import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { memo, useEffect, useRef } from "react";
import { ALL_COLUMNS } from "../../../../../configs/headerPriceBoard";
import type {
  Column,
  PriceCompare,
  SnapshotDataCompact,
} from "../../../../../types";
import {
  registerVisibleCell,
  unregisterVisibleCell,
} from "../../../../../utils";
import { getColumnValueCompact } from "../../../../../utils/priceboard";

interface PriceCellProps {
  symbol: string;
  cellKey: string;
  width?: number;
  snapshot: SnapshotDataCompact;
  disableFlash?: boolean; // tắt flash cho symbol
}

const PriceCell = memo(function PriceCell({
  symbol,
  cellKey,
  width,
  snapshot,
  disableFlash = false,
}: PriceCellProps) {
  const cellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disableFlash) return;
    const el = cellRef.current;
    if (el) {
      registerVisibleCell(symbol, cellKey, el);
    }
    return () => {
      unregisterVisibleCell(symbol, cellKey);
    };
  }, [symbol, cellKey, disableFlash]);

  // === TÍNH MÀU ===
  const colorClass = (() => {
    if (cellKey === "ceil") return "c";
    if (cellKey === "floor") return "f";
    if (cellKey === "ref") return "r";

    const tradeCmp = snapshot.trade?.[13] as PriceCompare | undefined;
    const orderBook = snapshot.orderBook;

    const getArr = (value: string | string[] | undefined): string[] => {
      if (typeof value === "string") return value.split("|");
      if (Array.isArray(value)) {
        return value.every((v): v is string => typeof v === "string")
          ? value
          : [];
      }
      return [];
    };

    const bids = getArr(orderBook?.[22]);
    const asks = getArr(orderBook?.[23]);

    // SYMBOL: dùng màu trade
    if (cellKey === "symbol") {
      return tradeCmp ?? "";
    }

    // CÁC CỘT GIAO DỊCH
    if (
      ["lastPrice", "change", "changePercent", "lastVolume"].some((k) =>
        cellKey.includes(k)
      )
    ) {
      return tradeCmp ?? "";
    }

    // ORDERBOOK
    if (orderBook) {
      if (cellKey.startsWith("priceBuy") || cellKey.startsWith("volumeBuy")) {
        const i = parseInt(cellKey.slice(-1), 10) - 1;
        return (bids[i * 3 + 2] as PriceCompare) ?? "";
      }
      if (cellKey.startsWith("priceSell") || cellKey.startsWith("volumeSell")) {
        const i = parseInt(cellKey.slice(-1), 10) - 1;
        return (asks[i * 3 + 2] as PriceCompare) ?? "";
      }
      if (cellKey === "high")
        return (orderBook[24]?.split("|")[1] as PriceCompare) ?? "";
      if (cellKey === "low")
        return (orderBook[25]?.split("|")[1] as PriceCompare) ?? "";
      if (cellKey === "avg")
        return (orderBook[28]?.split("|")[1] as PriceCompare) ?? "";
    }

    return "";
  })();

  // === TÍNH GIÁ TRỊ ===
  const value = getColumnValueCompact(snapshot, cellKey);

  const className = [
    "flex items-center justify-center text-xs font-medium h-7 cell",
    "transition-colors duration-75",
    colorClass,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={cellRef}
      data-symbol={symbol}
      data-key={cellKey}
      className={className}
      style={{ minWidth: width }}
    >
      {value ?? ""}
    </div>
  );
});

interface BodyTableProps {
  symbol: string;
  snapshot: SnapshotDataCompact;
  dragListeners?: DraggableSyntheticListeners;
  dragAttributes?: DraggableAttributes;
}

function BodyTable({
  symbol,
  snapshot,
  dragListeners,
  dragAttributes,
}: BodyTableProps) {
  const columns: Column[] = (() => {
    const saved = localStorage.getItem("clientConfig");
    try {
      return saved ? JSON.parse(saved) : ALL_COLUMNS;
    } catch {
      return ALL_COLUMNS;
    }
  })();

  useEffect(() => {
    return () => {
      unregisterVisibleCell(symbol);
    };
  }, [symbol]);

  return (
    <div className="flex border-x border-b border-border divide-x divide-border w-full">
      {columns.map((col) => {
        const hasChildren = !!col.children?.length;

        if (col.key === "symbol") {
          return (
            <div
              key={col.key}
              className="h-7 grid place-items-center"
              style={{ minWidth: col.width }}
            >
              <div
                className="flex items-center justify-center h-7 cursor-grab active:cursor-grabbing"
                {...dragListeners}
                {...dragAttributes}
              >
                <PriceCell
                  symbol={symbol}
                  cellKey={col.key}
                  snapshot={snapshot}
                  disableFlash={true} // TẮT FLASH CHO SYMBOL
                />
                <svg
                  className="w-4 h-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
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
                    key={child.key}
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
