// store/slices/stock/slice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  DealData,
  IndexData,
  SnapshotDataCompact,
  TopFVData,
  TopVData,
} from "../../../types";

interface StockState {
  snapshots: Record<string, SnapshotDataCompact>;
  subscribedOrder: string[];
  indices: Record<string, IndexData>;
  dealMessage: DealData | null;
  topVMessage: TopVData | null;
  topFVMessage: TopFVData | null;
  detailSymbol: string | null;
}

const initialState: StockState = {
  snapshots: {},
  subscribedOrder: [],
  indices: {},
  dealMessage: null,
  topVMessage: null,
  topFVMessage: null,
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
        const old = state.indices[idx.id];

        // Nếu chưa có dữ liệu cũ -> thêm mới luôn
        if (!old) {
          state.indices[idx.id] = idx;
          continue;
        }

        // So sánh từng field của IndexData
        const isSame =
          old.value === idx.value &&
          old.change === idx.change &&
          old.changePct === idx.changePct &&
          old.up === idx.up &&
          old.down === idx.down &&
          old.noChange === idx.noChange &&
          old.totalVol === idx.totalVol &&
          old.time === idx.time &&
          old.totalAmountTraded === idx.totalAmountTraded &&
          old.indexCompare === idx.indexCompare &&
          old.openIndex === idx.openIndex &&
          old.status === idx.status;

        if (isSame) continue;

        // Chỉ update khi có thay đổi
        state.indices[idx.id] = idx;
      }
    },

    setDealMessage(state, action: PayloadAction<DealData>) {
      const old = state.dealMessage;
      const next = action.payload;

      // Trường hợp chưa có dữ liệu
      if (!old) {
        state.dealMessage = next;
        return;
      }

      // So sánh mảng 38
      const oldList = old["38"];
      const newList = next["38"];

      // Nếu độ dài khác nhau -> có thay đổi
      if (oldList.length !== newList.length) {
        state.dealMessage = next;
        return;
      }

      // So sánh từng item
      let isSame = true;
      for (let i = 0; i < oldList.length; i++) {
        const a = oldList[i];
        const b = newList[i];

        if (
          a[8] !== b[8] ||
          a[9] !== b[9] ||
          a[10] !== b[10] ||
          a[11] !== b[11] ||
          a[12] !== b[12] ||
          a[13] !== b[13] ||
          a[29] !== b[29] ||
          a.symbol !== b.symbol
        ) {
          isSame = false;
          break;
        }
      }

      if (isSame) return;

      // Có thay đổi → update
      state.dealMessage = next;
    },

    setTopVMessage(state, action: PayloadAction<TopVData>) {
      const newData = action.payload;

      const oldArr = state.topVMessage ? state.topVMessage["29"] : [];
      const newArr = newData["29"] ?? [];

      if (oldArr.length === newArr.length && oldArr.join() === newArr.join()) {
        return;
      }

      state.topVMessage = newData;
    },

    setTopFVMessage(state, action: PayloadAction<TopFVData>) {
      const newData = action.payload;

      const oldArr = state.topFVMessage ? state.topFVMessage["29"] : [];
      const newArr = newData["29"] ?? [];

      if (oldArr.length === newArr.length && oldArr.join() === newArr.join()) {
        return;
      }

      state.topFVMessage = newData;
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
  setTopFVMessage,
  setDetailSymbol,
} = stockSlice.actions;

export default stockSlice.reducer;
