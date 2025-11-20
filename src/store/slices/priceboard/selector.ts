import { createSelector } from "reselect";
import type { RootState } from "../..";
import type { ApiStatus } from "../../../types";

const EMPTY_ARRAY: string[] = [];

const selectPriceBoardState = (state: RootState) => state.priceBoard;
const selectGroupId = (_: RootState, groupId: string) => groupId;

export const selectSymbolsByBoardId = createSelector(
  [selectPriceBoardState, selectGroupId],
  (priceBoard, groupId): string[] => {
    const reduxList = priceBoard?.data?.lists?.[groupId];
    if (Array.isArray(reduxList) && reduxList.length > 0) {
      return reduxList;
    }

    const cacheKey = `stocks_${groupId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn(`[PriceBoard] Invalid cache for ${cacheKey}`, e);
      }
    }

    return EMPTY_ARRAY;
  }
);

export const selectListStockStatus = createSelector(
  [selectPriceBoardState, selectGroupId],
  (priceBoard, groupId): ApiStatus => {
    return (
      priceBoard?.status?.fetchListStockById?.[groupId] ?? {
        loading: false,
        error: null,
      }
    );
  }
);

// Mã chưng skhoasn tìm kiếm
export const selectScrollToSymbol = (state: RootState) =>
  state.priceBoard.data.scrollToSymbol;
