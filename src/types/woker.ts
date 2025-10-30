import type { SnapshotData } from "./socketCient";

export type FlashClass =
  | "flash-up"
  | "flash-down"
  | "flash-ceil"
  | "flash-floor"
  | "flash-reference";

export interface FlashResult {
  symbol: string;
  key: string;
  flashClass: FlashClass;
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
    flash: FlashResult[];
    colors: Record<string, Record<string, string>>;
  };
};
