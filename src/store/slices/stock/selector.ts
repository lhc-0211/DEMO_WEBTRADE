import type { RootState } from "../..";
import type { SnapshotData } from "../../../types";

export const selectAllSymbols = (state: RootState): readonly string[] =>
  Object.keys(state.stock.snapshots);

export const selectSnapshotsBySymbols = (
  state: RootState,
  symbols: readonly string[]
): Record<string, SnapshotData> => {
  const result: Record<string, SnapshotData> = {};
  symbols.forEach((sym) => {
    if (state.stock.snapshots[sym]) result[sym] = state.stock.snapshots[sym];
  });
  return result;
};
