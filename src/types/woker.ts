export type ColorDTO = {
  s: string; // symbol
  c?: string; // trade.priceCompare
  b: number[]; // bids prices [0,1,2]
  a: number[]; // asks prices [0,1,2]
  bc: (string | undefined)[]; // bids priceCompare
  ac: (string | undefined)[]; // asks priceCompare
};

export type ColorWorkerMessage =
  | { type: "batch"; data: ColorDTO[] }
  | { type: "colors"; data: Record<string, Record<string, string>> };
