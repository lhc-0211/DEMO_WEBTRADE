import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { memo, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { ALL_COLUMNS_FAVORITE } from "../../../../../configs/headerPriceBoard";
import { socketClient } from "../../../../../services/socket";
import { useAppDispatch } from "../../../../../store/hook";
import { setListStockByIdFromCache } from "../../../../../store/slices/priceboard/slice";
import type {
  Column,
  Favorite,
  SnapshotDataCompact,
} from "../../../../../types";
import { unregisterVisibleCell } from "../../../../../utils";
import PriceCell from "./PriceCell";

interface BodyTableProps {
  symbol: string;
  snapshot: SnapshotDataCompact;
  dragListeners?: DraggableSyntheticListeners;
  dragAttributes?: DraggableAttributes;
  active?: string; // id của danh mục
}

function BodyTableFavorite({
  symbol,
  snapshot,
  dragListeners,
  dragAttributes,
  active,
}: BodyTableProps) {
  const dispatch = useAppDispatch();

  const columns: Column[] = (() => {
    const saved = localStorage.getItem("clientConfig");
    try {
      return saved ? JSON.parse(saved) : ALL_COLUMNS_FAVORITE;
    } catch {
      return ALL_COLUMNS_FAVORITE;
    }
  })();

  useEffect(() => {
    return () => {
      unregisterVisibleCell(symbol);
    };
  }, [symbol]);

  // === Xóa stock ra khỏi danh mục yêu thích ===
  const handleRemoveSymbol = (symbolToRemove: string) => {
    const stored = localStorage.getItem("favorites");
    if (!stored || !active) return;

    const favorites = JSON.parse(stored) as Favorite[];
    const favorite = favorites.find((f) => f.id === active);
    if (!favorite) return;

    // Lọc ra symbol cần xoá
    const newSymbols = favorite.symbols.filter((s) => s !== symbolToRemove);
    favorite.symbols = newSymbols;

    localStorage.setItem("favorites", JSON.stringify(favorites));

    dispatch(setListStockByIdFromCache(active, newSymbols));

    // Unsubscribe socket
    socketClient.unsubscribe({
      symbols: [symbolToRemove],
    });
  };

  return (
    <div className="flex border-x border-b border-border divide-x divide-border w-full">
      {columns.map((col) => {
        const hasChildren = !!col.children?.length;

        if (col.key === "mark") {
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
                />
              </div>
            </div>
          );
        }

        if (col.key === "symbol") {
          return (
            <div
              key={col.key}
              className="h-7 grid place-items-center"
              style={{ width: col.width }}
            >
              <div className="relative w-full flex items-center justify-center h-7 group">
                <PriceCell
                  symbol={symbol}
                  cellKey={col.key}
                  snapshot={snapshot}
                  disableFlash={true}
                />
                <IoClose
                  className="absolute top-1.5 right-0 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => handleRemoveSymbol(symbol)}
                />
              </div>
            </div>
          );
        }

        return (
          <div
            key={col.key}
            className="flex flex-col w-full"
            style={{ width: col.width }} // parent width
          >
            {!hasChildren ? (
              <PriceCell
                symbol={symbol}
                cellKey={col.key}
                width={"100%"}
                snapshot={snapshot}
              />
            ) : (
              <div className="flex divide-x divide-border text-xs font-medium">
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

export default memo(BodyTableFavorite);
