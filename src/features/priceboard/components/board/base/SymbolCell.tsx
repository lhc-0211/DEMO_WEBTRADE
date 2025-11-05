import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { memo, useEffect, useRef } from "react";
import type { PriceCompare, SnapshotDataCompact } from "../../../../../types";
import { getColumnValueCompact } from "../../../../../utils/priceboard";

interface SymbolCellProps {
  symbol: string;
  snapshot: SnapshotDataCompact;
  dragListeners?: DraggableSyntheticListeners;
  dragAttributes?: DraggableAttributes;
}

export const SymbolCell = memo(function SymbolCell({
  symbol,
  snapshot,
  dragListeners,
  dragAttributes,
}: SymbolCellProps) {
  const cellRef = useRef<HTMLDivElement>(null);

  // === CHỈ MÀU TỪ lastPrice (trade[13]) ===
  const tradeCmp = snapshot.trade?.[13] as PriceCompare | undefined;
  const colorClass = tradeCmp ?? "";

  // === ÁP DỤNG MÀU + ĐẬM ===
  useEffect(() => {
    const el = cellRef.current;
    if (el && colorClass) {
      el.classList.remove("u", "d", "c", "f", "r");
      el.classList.add(colorClass);
    }
  }, [colorClass]);

  const value = getColumnValueCompact(snapshot, "symbol");

  return (
    <div
      ref={cellRef}
      data-symbol={symbol}
      data-key="symbol" // vẫn giữ để debug nếu cần
      className="h-7 grid place-items-center text-xs font-medium"
    >
      <div
        className={`
          flex items-center justify-center h-7 cursor-grab active:cursor-grabbing
          ${colorClass ? "font-bold" : ""}
        `}
        {...dragListeners}
        {...dragAttributes}
      >
        {value}
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
});
