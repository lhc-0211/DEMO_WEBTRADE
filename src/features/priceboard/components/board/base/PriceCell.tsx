import { memo, useEffect, useRef } from "react";
import { useAppDispatch } from "../../../../../store/hook";
import { setDetailSymbol } from "../../../../../store/slices/stock/slice";
import type { PriceCompare, SnapshotDataCompact } from "../../../../../types";
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
  const dispatch = useAppDispatch();

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
      return `${tradeCmp} cursor-pointer`;
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
      onClick={() => {
        if (cellKey === "symbol") {
          dispatch(setDetailSymbol(symbol + ""));
        }
      }}
    >
      {value ?? ""}
    </div>
  );
});

export default PriceCell;
