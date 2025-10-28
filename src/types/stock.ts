export type PriceCompare = "u" | "d" | "r" | "n";

export type OrderBookLevel = {
  price: number;
  volume: number;
  priceCompare: PriceCompare;
};

export type OrderBookData = {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  recv_ts: number;
};

export type TradeData = {
  price: number;
  volume: number;
  boardId: string;
  marketId: string;
  recv_ts: number;
};

export type ForeignTradeData = {
  foreignBuyVolume: number;
  foreignSellVolume: number;
  foreignBuyAmount: number;
  foreignSellAmount: number;
  foreignNetValue: number;
  boardId: string;
  marketId: string;
  recv_ts: number;
};

export type ForeignRoomData = {
  currentRoom: number;
  totalRoom: number;
  marketId: string;
  recv_ts: number;
};

// WebSocket Message Types
export type OrderBookMessage = {
  type: "orderBook";
  symbol: string;
  boardId: string;
  marketId: string;
  recv_ts: number;
  data: {
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
  };
};

export type TradeMessage = {
  type: "trade";
  symbol: string;
  boardId: string;
  marketId: string;
  price: number;
  volume: number;
  recv_ts: number;
};

export type ForeignTradeMessage = {
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
};

export type ForeignRoomMessage = {
  type: "foreignRoom";
  symbol: string;
  marketId: string;
  currentRoom: number;
  totalRoom: number;
  recv_ts: number;
};

export type WebSocketMessage =
  | OrderBookMessage
  | TradeMessage
  | ForeignTradeMessage
  | ForeignRoomMessage;

// Redux Snapshot
export type SnapshotData = {
  symbol: string;
  orderBook?: OrderBookData;
  trade?: TradeData;
  foreignTrade?: ForeignTradeData;
  foreignRoom?: ForeignRoomData;
};

export type FlashResult = {
  symbol: string;
  key: string;
  flashClass: "flash-up" | "flash-down";
};
