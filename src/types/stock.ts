export interface OrderBookData {
  bids: Array<{ price: number; volume: number; priceCompare: string }>;
  asks: Array<{ price: number; volume: number; priceCompare: string }>;
  recv_ts: number;
}

export interface TradeData {
  price: number;
  volume: number;
  boardId: string;
  marketId: string;
  recv_ts: number;
}

export interface ForeignTradeData {
  foreignBuyVolume: number;
  foreignSellVolume: number;
  foreignBuyAmount: number;
  foreignSellAmount: number;
  foreignNetValue: number;
  boardId: string;
  marketId: string;
  recv_ts: number;
}

export interface ForeignRoomData {
  currentRoom: number;
  totalRoom: number;
  marketId: string;
  recv_ts: number;
}

export interface SnapshotData {
  symbol: string;
  orderBook?: OrderBookData;
  trade?: TradeData;
  foreignTrade?: ForeignTradeData;
  foreignRoom?: ForeignRoomData;
  ceil?: number;
  floor?: number;
  ref?: number;
  high?: number;
  avg?: number;
  low?: number;
  totalVol?: number;
}

// Định nghĩa type cho các message WebSocket
export interface OrderBookMessage {
  type: "orderBook";
  symbol: string;
  boardId: string;
  marketId: string;
  data: {
    bids: Array<{ price: number; volume: number; priceCompare: string }>;
    asks: Array<{ price: number; volume: number; priceCompare: string }>;
  };
  recv_ts: number;
}

export interface TradeMessage {
  type: "trade";
  symbol: string;
  boardId: string;
  marketId: string;
  price: number;
  volume: number;
  recv_ts: number;
}

export interface ForeignTradeMessage {
  type: "foreignTrade";
  symbol: string;
  boardId: string;
  marketId: string;
  foreignBuyVolume: number;
  foreignSellVolume: number;
  foreignBuyAmount: number;
  foreignSellAmount: number;
  foreignNetValue: number;
  recv_ts: number;
}

export interface ForeignRoomMessage {
  type: "foreignRoom";
  symbol: string;
  marketId: string;
  currentRoom: number;
  totalRoom: number;
  recv_ts: number;
}
