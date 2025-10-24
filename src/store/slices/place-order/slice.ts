import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ApiStatus } from "../../../types";
import type {
  FetchOrdersIndayParams,
  FetchShareCodeResponse,
  FetchShareStockItem,
  OrderActionPayload,
  OrderIndayItem,
} from "../../../types/placeOrder";

export interface PlaceOrderState {
  data: {
    shareStockCode: FetchShareCodeResponse["data"] | null;
    listShareStock: FetchShareStockItem[] | null;
    listOrdersInday: OrderIndayItem[] | null;
  };
  status: {
    fetchShareStockCode: ApiStatus;
    fetchListShareStock: ApiStatus;
    fetchOrders: ApiStatus;
    fetchListOrdersInday: ApiStatus;
  };
}

const initialState: PlaceOrderState = {
  data: {
    shareStockCode: null,
    listShareStock: null,
    listOrdersInday: null,
  },
  status: {
    fetchShareStockCode: { loading: false, error: null },
    fetchListShareStock: { loading: false, error: null },
    fetchOrders: { loading: false, error: null, success: false },
    fetchListOrdersInday: { loading: false, error: null },
  },
};

const placeOrderSlice = createSlice({
  name: "placeOrder",
  initialState,
  reducers: {
    //Lấy detail mã ck
    fetchShareStockCodeRequest: (
      state,
      action: PayloadAction<{ shareCode: string; volume: number }>
    ) => {
      state.status.fetchShareStockCode = { loading: true, error: null };
      state.data.shareStockCode = null;
    },
    fetchShareStockCodeSuccess: (
      state,
      action: PayloadAction<FetchShareCodeResponse["data"]>
    ) => {
      state.status.fetchShareStockCode = { loading: false, error: null };
      state.data.shareStockCode = action.payload;
    },
    fetchShareStockCodeFailure: (state, action: PayloadAction<string>) => {
      state.status.fetchShareStockCode = {
        loading: false,
        error: action.payload,
      };
      state.data.shareStockCode = null;
    },

    //Lấy list mã chứng khoán
    fetchListShareStockRequest: (state) => {
      state.status.fetchListShareStock = { loading: true, error: null };
      state.data.listShareStock = null;
    },
    fetchListShareStockSuccess: (
      state,
      action: PayloadAction<FetchShareStockItem[]>
    ) => {
      state.status.fetchListShareStock = { loading: false, error: null };
      state.data.listShareStock = action.payload;
    },
    fetchListShareStockFailure: (state, action: PayloadAction<string>) => {
      state.status.fetchListShareStock = {
        loading: false,
        error: action.payload,
      };
      state.data.listShareStock = null;
    },

    //Đặt lệnh
    fetchOrdersRequest: (state, action: PayloadAction<OrderActionPayload>) => {
      state.status.fetchListOrdersInday = {
        loading: true,
        error: null,
        success: false,
      };
    },
    fetchOrdersSuccess: (state) => {
      state.status.fetchOrders = { loading: false, error: null, success: true };
    },
    fetchOrdersFailure: (state, action: PayloadAction<string>) => {
      state.status.fetchOrders = {
        loading: false,
        error: action.payload,
        success: false,
      };
    },
    resetFetchOrders: (state) => {
      state.status.fetchOrders = {
        loading: false,
        success: false,
        error: null,
      };
    },

    //Lấy list lịch sử đặt lệnh
    fetchListOrdersIndayRequest: (
      state,
      action: PayloadAction<FetchOrdersIndayParams>
    ) => {
      state.status.fetchListOrdersInday = { loading: true, error: null };
      state.data.listOrdersInday = null;
    },
    fetchListOrdersIndaySuccess: (
      state,
      action: PayloadAction<OrderIndayItem[]>
    ) => {
      state.status.fetchListOrdersInday = { loading: false, error: null };
      state.data.listOrdersInday = action.payload;
    },
    fetchListOrdersIndayFailure: (state, action: PayloadAction<string>) => {
      state.status.fetchListOrdersInday = {
        loading: false,
        error: action.payload,
      };
      state.data.listOrdersInday = null;
    },
  },
});

export const {
  fetchShareStockCodeRequest,
  fetchShareStockCodeSuccess,
  fetchShareStockCodeFailure,
  fetchListShareStockRequest,
  fetchListShareStockSuccess,
  fetchListShareStockFailure,
  fetchOrdersRequest,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  resetFetchOrders,
  fetchListOrdersIndayRequest,
  fetchListOrdersIndaySuccess,
  fetchListOrdersIndayFailure,
} = placeOrderSlice.actions;

export default placeOrderSlice.reducer;
