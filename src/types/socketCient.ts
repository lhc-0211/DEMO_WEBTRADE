export interface SubscribeOptions {
  groupId?: string;
  symbols?: string[];
}
export type PriceCompare = "u" | "d" | "r" | "c" | "f";

// --- OrderBook ---
export type OrderBookDataCompact = {
  1: "ob";
  22: string; // bids
  23: string; // asks
  24: string; // high
  25: string; // low
  26: number; // total volume
  28: string; // avg
};

// --- Trade ---
export type TradeDataCompact = {
  1: "t";
  8: number; // price
  9: number; // volume
  11: number; // change abs
  12: number; // change pct
  13: PriceCompare | null; //color
};

// --- ForeignTrade ---
export type ForeignTradeDataCompact = {
  1: "ft";
  15: number; // buy volume
  17: number; // sell volume
};

// --- ForeignRoom ---
export type ForeignRoomDataCompact = {
  1: "fr";
  21: number; // total room
};

// --- RefPrices ---
export type RefPricesDataCompact = {
  1: "r";
  4: number; // ref
  5: number; // ceil
  6: number; // floor
};

// --- Snapshot ---
export type SnapshotDataCompact = {
  symbol: string;
  orderBook?: OrderBookDataCompact;
  trade?: TradeDataCompact;
  foreignTrade?: ForeignTradeDataCompact;
  foreignRoom?: ForeignRoomDataCompact;
  refPrices?: RefPricesDataCompact;
};

// --- WebSocket Message
export type WebSocketMessageCompact =
  | (OrderBookDataCompact & { symbol: string; recv_ts: number })
  | (TradeDataCompact & { symbol: string; recv_ts: number })
  | (ForeignTradeDataCompact & { symbol: string; recv_ts: number })
  | (ForeignRoomDataCompact & { symbol: string; recv_ts: number })
  | (RefPricesDataCompact & { symbol: string; recv_ts: number });
