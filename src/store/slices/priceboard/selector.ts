import type { RootState } from "../..";
import type {
  ApiStatus,
  ChartDataIndex,
  InfoIndex,
  topForeignTradedItem,
  topStockTradedItem,
} from "../../../types";

// Selectors với type annotations
export const selectInfoIndex = (state: RootState): InfoIndex[] =>
  state.priceBoard.data.infoIndex;

export const selectInfoIndexStatus = (state: RootState): ApiStatus =>
  state.priceBoard.status.fetchInfoIndex;

export const selectChartIndexs = (
  state: RootState
): Record<string, ChartDataIndex> => state.priceBoard.data.chartIndexs;

export const selectChartIndexStatusById =
  (id: string) =>
  (state: RootState): ApiStatus =>
    state.priceBoard.status.fetchChartIndexs[id] || {
      loading: false,
      error: null,
    };

export const selectAllChartStatuses = (state: RootState) =>
  state.priceBoard.status.fetchChartIndexs;

export const selectTopStockTraded = (state: RootState): topStockTradedItem[] =>
  state.priceBoard.data.topStockTraded;

export const selectTopStockTradedStatus = (state: RootState): ApiStatus =>
  state.priceBoard.status.fetchTopStockTraded;

export const selecttopForeignTraded = (
  state: RootState
): topForeignTradedItem[] => state.priceBoard.data.topForeignTraded;

export const selecttopForeignTradedStatus = (state: RootState): ApiStatus =>
  state.priceBoard.status.fetchTopForeignTraded;
