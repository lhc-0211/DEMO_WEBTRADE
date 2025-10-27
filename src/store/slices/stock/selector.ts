import { createSelector } from "reselect";
import type { RootState } from "../..";
import type { SnapshotData } from "../../../types";

const selectSnapshots = (state: RootState) => state.stock.snapshots;
export const selectSnapshotsBySymbols = createSelector(
  [selectSnapshots, (_: RootState, symbols: string[]) => symbols],
  (snapshots, symbols) =>
    symbols.reduce((acc, symbol) => {
      const snapshot = snapshots[symbol];
      if (snapshot) acc[symbol] = snapshot;
      return acc;
    }, {} as Record<string, SnapshotData>)
);
