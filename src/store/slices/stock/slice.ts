// store/slices/stock/slice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  DealData,
  IndexData,
  SnapshotDataCompact,
  TopVData,
} from "../../../types";

interface StockState {
  snapshots: Record<string, SnapshotDataCompact>;
  subscribedOrder: string[];
  indices: Record<string, IndexData>;
  dealMessage: DealData | null;
  topVMessage: TopVData | null;
  detailSymbol: string | null;
}

const initialState: StockState = {
  snapshots: {},
  subscribedOrder: [],
  indices: {},
  dealMessage: null,
  topVMessage: null,
  detailSymbol: null,
};

const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    updateSnapshots(state, action: PayloadAction<SnapshotDataCompact[]>) {
      for (const s of action.payload) {
        state.snapshots[s.symbol] = { ...state.snapshots[s.symbol], ...s };
      }
    },

    clearSnapshot(state, action: PayloadAction<string[]>) {
      for (const sym of action.payload) delete state.snapshots[sym];
    },

    clearSnapshotAll(state) {
      state.snapshots = {};
    },

    resetSnapshots(state) {
      state.snapshots = {};
      state.indices = {};
      state.subscribedOrder = [];
    },

    setSubscribedOrder: (state, action: PayloadAction<string[]>) => {
      state.subscribedOrder = action.payload;
    },

    updateIndex(state, action: PayloadAction<IndexData[]>) {
      for (const idx of action.payload) {
        state.indices[idx.id] = idx;
      }
    },

    setDealMessage(state, action: PayloadAction<DealData>) {
      state.dealMessage = action.payload;
    },

    setTopVMessage(state, action: PayloadAction<TopVData>) {
      state.topVMessage = action.payload;
    },

    setDetailSymbol(state, action: PayloadAction<string>) {
      state.detailSymbol = action.payload;
    },
  },
});

export const {
  updateSnapshots,
  clearSnapshot,
  resetSnapshots,
  setSubscribedOrder,
  updateIndex,
  clearSnapshotAll,
  setDealMessage,
  setTopVMessage,
  setDetailSymbol,
} = stockSlice.actions;

export default stockSlice.reducer;
