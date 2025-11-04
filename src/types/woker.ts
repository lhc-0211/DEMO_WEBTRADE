import type { PriceCompare, SnapshotDataCompact } from "./socketCient";

export interface FlashResult {
  symbol: string;
  key: string;
  flashClass: string | null;
}

// === INPUT: main -> worker ===
export type WorkerInputMessage =
  | { type: "batch"; data: SnapshotDataCompact[] }
  | { type: "visible"; data: string[] }
  | { type: "clear"; data: string[] };

// === OUTPUT: worker -> main ===
export type WorkerOutputMessage = {
  type: "update";
  data: {
    flashes: FlashResult[];
    colors: Record<string, Record<string, PriceCompare | "t">>;
  };
};
