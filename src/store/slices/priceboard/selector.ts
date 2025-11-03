import type { RootState } from "../..";
import type { ApiStatus } from "../../../types";

// --- Danh sách mã chứng khoán theo sàn ---
export const selectListStockById = (state: RootState): string[] =>
  state.priceBoard.data.listStockById ?? [];

export const selectListStockByIdStatus = (state: RootState): ApiStatus =>
  state.priceBoard.status.fetchListStockById ?? { loading: false, error: null };
