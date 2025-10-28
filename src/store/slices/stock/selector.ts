// src/store/slices/stock/selector.ts
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../..";
import type { SnapshotData } from "../../../types";

const selectSnapshots = (state: RootState) => state.stock.snapshots;
const selectColors = (state: RootState) => state.stock.colors;

export const selectAllSymbols = createSelector(
  [selectSnapshots],
  (snapshots): readonly string[] => Object.keys(snapshots)
);

export const selectSnapshotsBySymbols = createSelector(
  [selectSnapshots, (_: RootState, symbols: readonly string[]) => symbols],
  (snapshots, symbols): Readonly<Record<string, SnapshotData>> => {
    const result: Record<string, SnapshotData> = {};
    for (const sym of symbols) {
      const snap = snapshots[sym];
      if (snap) result[sym] = snap;
    }
    return result;
  }
);

export const selectColorsBySymbol = createSelector(
  [selectColors, (_: RootState, symbol: string) => symbol],
  (colors, symbol): Readonly<Record<string, string>> => colors[symbol] ?? {}
);
