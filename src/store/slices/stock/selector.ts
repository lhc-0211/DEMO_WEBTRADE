// src/store/slices/stock/selector.ts
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../..";
import type { SnapshotDataCompact } from "../../../types";

const selectSnapshots = (state: RootState) => state.stock.snapshots;

export const selectAllSymbols = createSelector(
  [
    (state: RootState) => state.stock.snapshots,
    (state: RootState) => state.stock.subscribedOrder,
  ],
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
