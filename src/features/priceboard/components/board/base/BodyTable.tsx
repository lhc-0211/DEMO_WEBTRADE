import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { memo, useEffect } from "react";
import { ALL_COLUMNS_BASE } from "../../../../../configs/headerPriceBoard";
import type { Column, SnapshotDataCompact } from "../../../../../types";
import { unregisterVisibleCell } from "../../../../../utils";
import PriceCell from "./PriceCell";

interface BodyTableProps {
  symbol: string;
  snapshot: SnapshotDataCompact;
  dragListeners?: DraggableSyntheticListeners;
  dragAttributes?: DraggableAttributes;
}

function BodyTableBase({
  symbol,
  snapshot,
  dragListeners,
  dragAttributes,
}: BodyTableProps) {
  const columns: Column[] = (() => {
    const saved = localStorage.getItem("clientConfig");
    try {
      return saved ? JSON.parse(saved) : ALL_COLUMNS_BASE;
    } catch {
      return ALL_COLUMNS_BASE;
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
              style={{ width: col.width }}
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
                  disableFlash={true} // Tắt flash cho symbol
                />
              </div>
            </div>
          );
        }

        // Các cột khác
        return (
          <div
            key={col.key}
            className="flex flex-col"
            style={{ width: col.width }} // parent width
          >
            {/* Nếu không có children */}
            {!hasChildren ? (
              <PriceCell
                symbol={symbol}
                cellKey={col.key}
                width={"100%"}
                snapshot={snapshot}
              />
            ) : (
              // Nếu có children
              <div className="flex divide-x divide-border text-xs font-medium w-full">
                {col.children?.map((child) => (
                  <PriceCell
                    key={child.key}
                    cellKey={child.key}
                    symbol={symbol}
                    snapshot={snapshot}
                    width={`${100 / (col.children?.length || 1)}%`}
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

export default memo(BodyTableBase);
