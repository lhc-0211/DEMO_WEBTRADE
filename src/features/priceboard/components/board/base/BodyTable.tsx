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

export default memo(BodyTableBase);
