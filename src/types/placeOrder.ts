import type { OptionType } from "../components/inputs/InputSearchField";

export interface OrderForm {
  orderSymbol: OptionType | null;
  orderSide: "B" | "S";
  orderVolume: string;
  orderPrice: string;
  accountOrder: string;
}

export interface FetchShareCodeResponse {
  rc: number;
  msg: string;
  data: {
    id: number;
    sym: string;
    fullName: string;
    name_vn: string;
    c: string;
    f: string;
    r: string;
    lastPrice: string;
    lastVolume: number;
    fRoom: string;
    cl: string;
    g1: string;
    g2: string;
    g3: string;
    g4: string;
    g5: string;
    g6: string;
    g7: string;
    mc: string;
    mr: string;
    limit: string;
    fBVol: string;
    fSVolume: string;
    stepPrice: number;
    code: string;
    stockType: string;
    status_info: string;
    force_use: string;
    trade_date: string;
    board_id: string;
    ForeignBuy: string;
    ForeignSell: string;
    ForeignTotalRoom: string;
    ForeignRoom: string;
    highPrice: string;
    lowPrice: string;
    avePrice: string;
    listedVol: string;
    marginFlag: string;
  };
}

export interface FetchShareStockItem {
  shareCode: string;
  shareName: string;
  fullName: string;
  fullNameEnglish: string;
  tradeTable: string;
}

export interface FetchShareStockResponse {
  rc: number;
  msg: string;
  data: FetchShareStockItem[];
}

export type FetchOrdersResponse = {
  rc: number;
  msg: string;
  data: {
    ClOrdID: string;
    Account: string;
    AccountType: number;
    HandlInst: string;
    MaxFloor: number;
    Symbol: string;
    Side: string;
    CashMargin: string;
    TransactTime: string;
    OrderQty: number;
    OrdType: string;
    Price: number;
    StopPx: number;
    TimeInForce: string;
    TradeDate: string;
    Country: string;
    InvestCode: string;
    FornInvestTypeCode: string;
    CustodianID: string;
    OpenCloseCode: string;
    MarketId: string;
  };
};

export type OrderParams = {
  accountCode: string;
  symbol: string;
  showPrice: string;
  volume: string;
  orderType: string;
  refId: string;
};

export type OrderActionPayload = {
  params: OrderParams;
  side: "BUY" | "SELL";
};

export interface FetchOrdersIndayParams {
  page?: number;
  size?: number;
  symbol?: string;
  orderStatus?: number | string;
  side?: string;
  accountCode?: string;
}

export interface OrderIndayItem {
  pkFrontOrder: number;
  orderNo: number;
  orderTime: number | string; // timestamp
  accountCode: string;
  side: string;
  shareCode: string;
  orderVolume: number;
  orderShowPrice: string;
  orderPrice: number;
  matchedVolume: number;
  orderStatus: string;
  chanel: string;
  group: string;
  cancelTime: number | null;
  changeTime: number | null;
  rejectText: string | null;
  changePrice: number;
  matchedValue: number;
  quoteStatus: string;
  autoType: string | null;
  setOrderType: string;
  boardId: string;
  tradeTable: string;
  color: string;
  marketPrice: number;
  product: string | null;
}

export interface FetchOrdersIndayResponse {
  rc: number;
  msg: string;
  data: OrderIndayItem[];
}
