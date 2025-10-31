import type { SnapshotData } from "./socketCient";

export interface FlashResult {
  symbol: string;
  key: string;
  flashClass: string | null;
}

// === INPUT: main → worker ===
export type WorkerInputMessage =
  | { type: "batch"; data: SnapshotData[] }
  | { type: "visible"; data: string[] }
  | { type: "clear"; data: string[] };

// === OUTPUT: worker → main ===
export type WorkerOutputMessage = {
  type: "update";
  data: {
    flashes: FlashResult[];
    colors: Record<string, Record<string, string>>;
  };
};
