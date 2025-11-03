import { createSlice } from "@reduxjs/toolkit";
import type { ApiStatus } from "../../../types";

export interface PriceBoardState {
  data: { listStockById: string[] };
  status: { fetchListStockById: ApiStatus };
}

const initialState: PriceBoardState = {
  data: { listStockById: [] },
  status: { fetchListStockById: { loading: false, error: null } },
};

const priceBoardSlice = createSlice({
  name: "priceBoard",
  initialState,
  reducers: {
    setListStockByIdFromCache(state, action) {
      state.data.listStockById = action.payload;
      state.status.fetchListStockById = { loading: false, error: null };
    },
  },
});

export const { setListStockByIdFromCache } = priceBoardSlice.actions;
export default priceBoardSlice.reducer;
