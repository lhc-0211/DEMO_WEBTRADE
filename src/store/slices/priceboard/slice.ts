import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ApiStatus } from "../../../types";
import { fetchListStockById } from "./thunks";

export interface PriceBoardState {
  data: {
    lists: Record<string, string[]>;
  };
  status: {
    fetchListStockById: Record<string, ApiStatus>;
  };
}

const initialState: PriceBoardState = {
  data: { lists: {} },
  status: { fetchListStockById: {} },
};

const priceBoardSlice = createSlice({
  name: "priceBoard",
  initialState,
  reducers: {
    setListStockByIdFromCache: {
      prepare: (groupId: string, symbols: string[]) => ({
        payload: { groupId, symbols },
      }),
      reducer: (
        state,
        action: PayloadAction<{ groupId: string; symbols: string[] }>
      ) => {
        const { groupId, symbols } = action.payload;
        state.data.lists[groupId] = symbols;
        state.status.fetchListStockById[groupId] = {
          loading: false,
          error: null,
        };
      },
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListStockById.pending, (state, action) => {
        const groupId = action.meta.arg;
        state.status.fetchListStockById[groupId] = {
          loading: true,
          error: null,
        };
      })
      .addCase(fetchListStockById.fulfilled, (state, action) => {
        const { groupId, symbols } = action.payload;
        state.data.lists[groupId] = symbols;
        state.status.fetchListStockById[groupId] = {
          loading: false,
          error: null,
        };
      })
      .addCase(fetchListStockById.rejected, (state, action) => {
        const groupId = action.meta.arg;
        state.status.fetchListStockById[groupId] = {
          loading: false,
          error: action.payload ?? "Error",
        };
      });
  },
});

export const { setListStockByIdFromCache } = priceBoardSlice.actions;
export default priceBoardSlice.reducer;
