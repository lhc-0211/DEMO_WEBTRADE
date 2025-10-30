export interface Stock {
  code: string;
  name: string;
  price: number;
  change: number;
}

export interface Snapshot {
  sym: string;
  lastPrice: number;
  volume: number;
  change: number;
}

export interface InfoIndex {
  insertedAt: string;
  marketId: string;
  tradingSessionId: string;
  marketIndexClass: string;
  indexsTypeCode: string;
  currency: string;
  transactTime: string;

  openIndexes: number;
  valueIndexes: number;
  totalVolumeTraded: number;
  grossTradeAmt: number;
  contauctAccTrdvol: number;
  contauctAccTrdval: number;
  blktrdAccTrdvol: number;
  blktrdAccTrdval: number;

  fluctuationUpperLimitIssueCount: number;
  fluctuationUpIssueCount: number;
  fluctuationSteadinessIssueCount: number;
  fluctuationDownIssueCount: number;
  fluctuationLowerLimitIssueCount: number;

  fluctuationUpIssueVolume: number;
  fluctuationDownIssueVolume: number;
  fluctuationSteadinessIssueVolume: number;

  status: string;
  openIndex: number;
  change: number;
  percentChange: number;
}

export interface ChartIndexItem {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  value: number;
  openPrice: number;
}

export interface ChartDataIndex {
  id: string;
  data: ChartIndexItem[];
}

export interface PriceVolumeChart {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  s: string;
  t: number[];
  v: number[];
}

export interface topStockTradedItem {
  boardId: string;
  symbol: string;
  totalVolumeTraded: number;
  totalValueTraded: number;
  lastPrice: number;
  status: string;
}

export interface topForeignTradedItem {
  marketId: string;
  boardId: string;
  symbol: string;
  sellVolumeTotal: number;
  sellTradeAmountTotal: number;
  buyVolumeTotal: number;
  volumeTotal: number;
  buyTradeAmountTotal: number;
  amountTotal: number;
  lastPrice: number;
  status: string;
}

export interface PriceBoardMenuGroup {
  label: string;
  key: string;
  items: {
    id: string;
    name: string;
    market?: string;
    type?: string;
    isCustom?: boolean;
  }[];
}

export interface Column {
  key: string;
  label: string;
  width: number;
  default: boolean;
  children?: Column[];
}
