import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SnapshotData } from "../../../types";

export type CellColorMap = Record<string, string>; // key: "lastPrice" → "text-green"
export type SymbolColorMap = Record<string, CellColorMap>; // symbol: "AAA" → { lastPrice: "text-green" }

interface StockState {
  snapshots: Record<string, SnapshotData>;
  colors: SymbolColorMap;
  subscribedOrder: string[];
}

const initialState: StockState = {
  snapshots: {},
  colors: {},
  subscribedOrder: [],
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

    updateColors(
      state,
      action: PayloadAction<{ symbol: string; colors: Record<string, string> }>
    ) {
      const { symbol, colors } = action.payload;
      state.colors[symbol] = colors;
    },

    clearSnapshot(state, action: PayloadAction<string[]>) {
      action.payload.forEach((symbol) => {
        delete state.snapshots[symbol];
        delete state.colors[symbol];
      });
    },

    resetSnapshots(state) {
      state.snapshots = {};
      state.colors = {};
    },

    setSubscribedOrder: (state, action: PayloadAction<string[]>) => {
      state.subscribedOrder = action.payload;
    },
  },
});

export const {
  updateSnapshots,
  updateColors,
  clearSnapshot,
  resetSnapshots,
  setSubscribedOrder,
} = stockSlice.actions;

export default stockSlice.reducer;
