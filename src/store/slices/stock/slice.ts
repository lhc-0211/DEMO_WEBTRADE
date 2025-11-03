import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SnapshotDataCompact } from "../../../types";

export type CellColorMap = Record<string, string>;
export type SymbolColorMap = Record<string, CellColorMap>;

interface StockState {
  snapshots: Record<string, SnapshotDataCompact>;
  subscribedOrder: string[];
}

const initialState: StockState = {
  snapshots: {},
  subscribedOrder: [],
};

const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    updateSnapshots(state, action: PayloadAction<SnapshotDataCompact[]>) {
      action.payload.forEach((snapshot) => {
        state.snapshots[snapshot.symbol] = {
          ...state.snapshots[snapshot.symbol],
          ...snapshot,
        };
      });
    },

    clearSnapshot(state, action: PayloadAction<string[]>) {
      action.payload.forEach((symbol) => {
        delete state.snapshots[symbol];
      });
    },

    resetSnapshots(state) {
      state.snapshots = {};
    },

    setSubscribedOrder: (state, action: PayloadAction<string[]>) => {
      state.subscribedOrder = action.payload;
    },
  },
});

export const {
  updateSnapshots,
  clearSnapshot,
  resetSnapshots,
  setSubscribedOrder,
} = stockSlice.actions;

export default stockSlice.reducer;
