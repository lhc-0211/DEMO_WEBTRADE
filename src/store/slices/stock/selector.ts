// src/store/slices/stock/selector.ts
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../..";
import type { IndexData, SnapshotDataCompact } from "../../../types";

// === STOCK SELECTORS (giữ nguyên) ===
export const selectSnapshots = (state: RootState) => state.stock.snapshots;
const selectSubscribedOrder = (state: RootState) => state.stock.subscribedOrder;

export const selectAllSymbols = createSelector(
  [selectSnapshots, selectSubscribedOrder],
  (snapshots, subscribedOrder): readonly string[] => {
    const keys = Object.keys(snapshots);
    return subscribedOrder.filter((sym) => keys.includes(sym));
  }
);

export const selectSnapshotsBySymbols = createSelector(
  [selectSnapshots, (_: RootState, symbols: readonly string[]) => symbols],
  (snapshots, symbols): Readonly<Record<string, SnapshotDataCompact>> => {
    const result: Record<string, SnapshotDataCompact> = {};
    for (const sym of symbols) {
      const snap = snapshots[sym];
      if (snap) result[sym] = snap;
    }
    return result;
  }
);

const selectIndices = (state: RootState) => state.stock.indices;

/** Lấy tất cả index đang có */
export const selectAllIndices = createSelector(
  [selectIndices],
  (indices): Readonly<Record<string, IndexData>> => indices
);

/** Lấy 1 index theo ID (VD: VN-Index, HNX-Index...) */
export const selectIndexById = createSelector(
  [selectIndices, (_: RootState, id: string) => id],
  (indices, id): IndexData | undefined => indices[id]
);

/** Lấy nhiều index theo danh sách ID */
export const selectIndicesByIds = createSelector(
  [selectIndices, (_: RootState, ids: readonly string[]) => ids],
  (indices, ids): Readonly<Record<string, IndexData>> => {
    const result: Record<string, IndexData> = {};
    for (const id of ids) {
      if (indices[id]) result[id] = indices[id];
    }

    return result;
  }
);

/** Các index phổ biến – dùng nhanh */
export const selectMajorIndices = createSelector(
  [selectIndices],
  (
    indices
  ): {
    vnIndex?: IndexData;
    vn30Index?: IndexData;
    hnxIndex?: IndexData;
    upcomIndex?: IndexData;
  } => ({
    vn30Index: indices["2:002"],
    vnIndex: indices["2:100"],
    hnxIndex: indices["2:300"],
    upcomIndex: indices["4:200"],
  })
);
