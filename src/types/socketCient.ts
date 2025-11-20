import type { PriceCompare } from "./woker";

export interface SubscribeOptions {
  groupId?: string;
  symbols?: string[];
}

export type SubscribeMessage = {
  type: "subscribe" | "unsubscribe" | "getSymbolList" | "request_nego";
  sessionId: string;
  groupId?: string;
  symbols?: string[];
  marketId?: string;
};

export type IndexDataCompact = {
  1: "mi";
  10: string; // time
  11: number; //change
  12: number; //changePct
  29: number; // value
  30: number; //  up
  31: number; //  down
  32: number; // noChange
  33: number; // totalVol
  34: number; // totalAmountTraded
  35: string; // id
  36: number; //openIndex
  37: string; //indexCompare
  41: string; // transsName
};

export type OrderBookDataCompact = {
  1: "ob";
  22: string;
  23: string;
  24: string;
  25: string;
  26: number;
  28: string;
};
export type TradeDataCompact = {
  1: "t";
  8: number;
  9: number;
  10: string;
  11: number;
  12: number;
  13: PriceCompare;
};
export type ForeignTradeDataCompact = { 1: "ft"; 14: number; 15: number };
export type ForeignRoomDataCompact = { 1: "fr"; 21: number };
export type RefPricesDataCompact = {
  1: "r";
  4: number;
  5: number;
  6: number;
  40?: string;
  42?: string;
  44?: number;
  45?: string;
};

export type SnapshotDataCompact = {
  symbol: string;
  orderBook?: OrderBookDataCompact;
  trade?: TradeDataCompact;
  foreignTrade?: ForeignTradeDataCompact;
  foreignRoom?: ForeignRoomDataCompact;
  refPrices?: RefPricesDataCompact;
};

// ==================== TOÀN BỘ WEB SOCKET MESSAGE TYPES ====================
type RefMessage = {
  symbol: string;
  1: "r";
  4: number;
  5: number;
  6: number;
  40?: string;
  42?: string;
  44?: number;
  45?: string;
  recv_ts: number;
};
export type TradeMessage = {
  symbol: string;
  1: "t";
  8: number;
  9: number;
  10: string;
  11: number;
  12: number;
  13: PriceCompare;
  33?: number;
  recv_ts: number;
};
type OrderBookMessage = {
  symbol: string;
  1: "ob";
  22: string;
  23: string;
  24: string;
  25: string;
  26: number;
  28: string;
  recv_ts: number;
};
type ForeignTradeMessage = {
  symbol: string;
  1: "ft";
  14: number;
  15: number;
  recv_ts: number;
};
type ForeignRoomMessage = {
  symbol: string;
  1: "fr";
  21: number;
  recv_ts: number;
};

type SymbolListMessage = {
  type: "symbolList";
  groupId: string;
  symbols: string[];
};

export type FullSnapshotMessage = {
  "1": "snapshot";
  sessionId: string;
  symbol: string;
  recv_ts: number;
  refPrices?: RefPricesDataCompact & { symbol: string };
  orderBook?: OrderBookDataCompact & { symbol: string };
  trade?: TradeDataCompact & { symbol: string };
  foreignTrade?: ForeignTradeDataCompact & { symbol: string };
  foreignRoom?: ForeignRoomDataCompact & { symbol: string };
};

export type IndexData = {
  id: string; // 35
  value: number; // 29
  change?: number;
  changePct?: number;
  up?: number; // 30
  down?: number; //31
  noChange?: number; //32
  totalVol?: number; //33
  time?: string; //10
  totalAmountTraded?: number; //34
  indexCompare: string; //37
  openIndex?: number; //36
  status: string; //41
};

export type OrderDeal = {
  "8": number; //price
  "9": number; //volume
  "10": string; //transactTime
  "11": number; //changeAbs
  "12": number; //changePct
  "13": string; //priceCompare
  "29": number; //Giá trị
  symbol: string;
};

export type DealData = {
  1: "nego";
  38: OrderDeal[];
  39: string[];
};

export type TopVData = {
  1: "topV";
  29: string[];
};

export type TopFVData = {
  1: "topFV";
  29: string[];
};

export type WebSocketMessageCompact =
  | RefMessage
  | TradeMessage
  | OrderBookMessage
  | ForeignTradeMessage
  | ForeignRoomMessage
  | FullSnapshotMessage
  | IndexDataCompact
  | SymbolListMessage
  | DealData
  | TopVData
  | TopFVData;
