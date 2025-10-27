import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SnapshotData } from "../../../types";

interface StockState {
  snapshots: Record<string, SnapshotData>;
}

const initialState: StockState = {
  snapshots: {},
};

const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    updateSnapshots(state, action: PayloadAction<SnapshotData[]>) {
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
  },
});

export const { updateSnapshots, clearSnapshot, resetSnapshots } =
  stockSlice.actions;
export default stockSlice.reducer;
