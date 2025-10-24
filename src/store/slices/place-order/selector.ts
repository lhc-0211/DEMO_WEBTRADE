import type { RootState } from "../..";
import type { ApiStatus } from "../../../types";
import type {
  FetchShareCodeResponse,
  FetchShareStockItem,
  OrderIndayItem,
} from "../../../types/placeOrder";

export const selectShareStock = (
  state: RootState
): FetchShareCodeResponse["data"] | null =>
  state.placeOrder.data.shareStockCode;

export const selectShareStockStatus = (state: RootState): ApiStatus =>
  state.placeOrder.status.fetchShareStockCode;

export const selectListShareStock = (
  state: RootState
): FetchShareStockItem[] | null => state.placeOrder.data.listShareStock;

export const selectOrdersStatus = (state: RootState): ApiStatus =>
  state.placeOrder.status.fetchOrders;

export const selectListOrdersIndayStatus = (state: RootState): ApiStatus =>
  state.placeOrder.status.fetchListOrdersInday;

export const selectListOrdersInday = (
  state: RootState
): OrderIndayItem[] | null => state.placeOrder.data.listOrdersInday;
