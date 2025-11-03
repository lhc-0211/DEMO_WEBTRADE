export interface SubscribeOptions {
  groupId?: string;
  symbols?: string[];
}

export type PriceCompare = "u" | "d" | "r" | "c" | "f";

// --- OrderBook---
export type OrderBookDataCompact = {
  1: "ob"; // type
  22: string; // bids compacted, ví dụ: "26600.0|1000.0|d|27000.0|400.0|u|..."
  23: string; // asks compacted
  24: string; // high
  25: string; // low
  28: string; // avg
  26: number; // totalVol
  recv_ts: number;
};

export type OrderBookMessageCompact = {
  1: "ob";
  symbol: string;
  22: string;
  23: string;
  recv_ts: number;
};

// --- Trade---
export type TradeDataCompact = {
  1: "t";
  symbol: string;
  8: number; // price
  9: number; // volume
  10: string; // time "HH:MM:SS"
  11: number; // changeAbs
  12: number; // changePct
  13: PriceCompare; // priceCompare
  recv_ts: number;
};

export type TradeMessageCompact = TradeDataCompact;

// --- ForeignTrade---
export type ForeignTradeDataCompact = {
  1: "ft";
  symbol: string;
  14: number; // foreignBuyAmount
  15: number; // foreignBuyVolume
  16: number; // foreignSellAmount
  17: number; // foreignSellVolume
  18: number; // foreignNetValue
  recv_ts: number;
};

export type ForeignTradeMessageCompact = ForeignTradeDataCompact;

// --- ForeignRoom---
export type ForeignRoomDataCompact = {
  1: "fr";
  symbol: string;
  19: string; // marketId
  20: number; // currentRoom
  21: number; // totalRoom
  recv_ts: number;
};

export type ForeignRoomMessageCompact = ForeignRoomDataCompact;

// --- RefPrices---
export type RefPricesDataCompact = {
  1: "r";
  symbol: string;
  4: number; // ref
  5: number; // ceil
  6: number; // floor
  recv_ts: number;
};

export type RefPricesMessageCompact = RefPricesDataCompact;

// --- Snapshot---
export type SnapshotDataCompact = {
  symbol: string;
  orderBook?: OrderBookDataCompact;
  trade?: TradeDataCompact;
  foreignTrade?: ForeignTradeDataCompact;
  foreignRoom?: ForeignRoomDataCompact;
  refPrices?: RefPricesDataCompact;
};

// --- WebSocket Message---
export type WebSocketMessageCompact =
  | OrderBookMessageCompact
  | TradeMessageCompact
  | ForeignTradeMessageCompact
  | ForeignRoomMessageCompact
  | RefPricesMessageCompact;
