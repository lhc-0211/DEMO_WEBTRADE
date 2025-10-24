import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  ApiStatus,
  ChartDataIndex,
  InfoIndex,
  topForeignTradedItem,
  topStockTradedItem,
} from "../../../types";

// State interface

export interface PriceBoardState {
  data: {
    infoIndex: InfoIndex[];
    chartIndexs: Record<string, ChartDataIndex>;
    topStockTraded: topStockTradedItem[];
    topForeignTraded: topForeignTradedItem[];
  };
  status: {
    fetchInfoIndex: ApiStatus;
    fetchChartIndexs: Record<string, ApiStatus>;
    fetchTopStockTraded: ApiStatus;
    fetchTopForeignTraded: ApiStatus;
  };
}

const initialState: PriceBoardState = {
  data: {
    infoIndex: [],
    chartIndexs: {},
    topStockTraded: [],
    topForeignTraded: [],
  },
  status: {
    fetchInfoIndex: { loading: false, error: null },
    fetchChartIndexs: {},
    fetchTopStockTraded: { loading: false, error: null },
    fetchTopForeignTraded: { loading: false, error: null },
  },
};

const priceBoardSlice = createSlice({
  name: "priceBoard",
  initialState,
  reducers: {
    // Thông tin Index
    fetchInfoIndexRequest(state) {
      state.status.fetchInfoIndex = { loading: true, error: null };
      state.data.infoIndex = [];
    },
    fetchInfoIndexSuccess(state, action: PayloadAction<InfoIndex[]>) {
      state.status.fetchInfoIndex = { loading: false, error: null };
      state.data.infoIndex = action.payload;
    },
    fetchInfoIndexFailure(state, action: PayloadAction<string>) {
      state.status.fetchInfoIndex = { loading: false, error: action.payload };
      state.data.infoIndex = [];
    },

    // Biểu đồ Index
    fetchChartIndexRequest(state, action: PayloadAction<string>) {
      const id = action.payload;

      if (!state.status.fetchChartIndexs[id]) {
        state.status.fetchChartIndexs[id] = { loading: false, error: null };
      }
      state.status.fetchChartIndexs[id].loading = true;
      state.status.fetchChartIndexs[id].error = null;
      state.data.chartIndexs[id] = { id, data: [] };
    },
    fetchChartIndexSuccess(state, action: PayloadAction<ChartDataIndex>) {
      const id = action.payload.id;
      state.status.fetchChartIndexs[id] = { loading: false, error: null };
      state.data.chartIndexs[id] = action.payload;
    },
    fetchChartIndexFailure(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.status.fetchChartIndexs[id] = {
        loading: false,
        error: action.payload,
      };
      state.data.chartIndexs[id] = { id, data: [] };
    },

    // Thông tin Top KL giao dịch trong ngày
    fetchTopStockTradedRequest(state, action: PayloadAction<string>) {
      state.status.fetchTopStockTraded = { loading: true, error: null };
      state.data.topStockTraded = [];
    },
    fetchTopStockTradedSuccess(
      state,
      action: PayloadAction<topStockTradedItem[]>
    ) {
      state.status.fetchTopStockTraded = { loading: false, error: null };
      state.data.topStockTraded = action.payload;
    },
    fetchTopStockTradedFailure(state, action: PayloadAction<string>) {
      state.status.fetchTopStockTraded = {
        loading: false,
        error: action.payload,
      };
      state.data.topStockTraded = [];
    },

    // Thông tin Top KL mua bán nước ngoài
    fetchTopForeignTradedRequest(state, action: PayloadAction<string>) {
      state.status.fetchTopForeignTraded = { loading: true, error: null };
      state.data.topForeignTraded = [];
    },
    fetchTopForeignTradedSuccess(
      state,
      action: PayloadAction<topForeignTradedItem[]>
    ) {
      state.status.fetchTopForeignTraded = { loading: false, error: null };
      state.data.topForeignTraded = action.payload;
    },
    fetchTopForeignTradedFailure(state, action: PayloadAction<string>) {
      state.status.fetchTopForeignTraded = {
        loading: false,
        error: action.payload,
      };
      state.data.topForeignTraded = [];
    },
  },
});

export const {
  fetchInfoIndexRequest,
  fetchInfoIndexSuccess,
  fetchInfoIndexFailure,
  fetchChartIndexRequest,
  fetchChartIndexSuccess,
  fetchChartIndexFailure,
  fetchTopStockTradedRequest,
  fetchTopStockTradedSuccess,
  fetchTopStockTradedFailure,
  fetchTopForeignTradedRequest,
  fetchTopForeignTradedSuccess,
  fetchTopForeignTradedFailure,
} = priceBoardSlice.actions;

export default priceBoardSlice.reducer;
