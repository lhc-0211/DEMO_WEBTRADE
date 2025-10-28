// columnsConfig.ts
export const ALL_COLUMNS = [
  { key: "mark", label: "", default: true, width: 24 },
  { key: "symbol", label: "CK", default: true, width: 72 },
  { key: "ceil", label: "Trần", default: true, width: 42 },
  { key: "floor", label: "Sàn", default: true, width: 42 },
  { key: "ref", label: "TC", default: true, width: 42 },
  {
    key: "buy",
    label: "Bên mua",
    default: true,
    children: [
      { key: "priceBuy3", label: "Giá 3", default: true, width: 70 },
      { key: "volumeBuy3", label: "KL 3", default: true, width: 70 },
      { key: "priceBuy2", label: "Giá 2", default: true, width: 70 },
      { key: "volumeBuy2", label: "KL 2", default: true, width: 70 },
      { key: "priceBuy1", label: "Giá 1", default: true, width: 70 },
      { key: "volumeBuy1", label: "KL 1", default: true, width: 70 },
    ],
  },
  {
    key: "match",
    label: "Khớp lệnh",
    default: true,
    children: [
      { key: "lastPrice", label: "Khớp", default: true, width: 70 },
      { key: "lastVolume", label: "KL", default: true, width: 70 },
      { key: "change", label: "+/-", default: true, width: 50 },
      { key: "changePc", label: "%", default: true, width: 50 },
    ],
  },
  {
    key: "sell",
    label: "Bên bán",
    default: true,
    children: [
      { key: "priceSell1", label: "Giá 1", default: true, width: 70 },
      { key: "volumeSell1", label: "KL 1", default: true, width: 70 },
      { key: "priceSell2", label: "Giá 2", default: true, width: 70 },
      { key: "volumeSell2", label: "KL 2", default: true, width: 70 },
      { key: "priceSell3", label: "Giá 3", default: true, width: 70 },
      { key: "volumeSell3", label: "KL 3", default: true, width: 70 },
    ],
  },
  { key: "high", label: "Cao", default: false, width: 42 },
  { key: "avg", label: "TB", default: false, width: 42 },
  { key: "low", label: "Thấp", default: false, width: 42 },
  { key: "totalVol", label: "Tổng KL", default: true, width: 90 },
  {
    key: "foreign",
    label: "GD NĐT NN",
    default: false,
    children: [
      { key: "foreignBuy", label: "Mua", default: true, width: 70 },
      { key: "foreignSell", label: "Bán", default: true, width: 70 },
      { key: "foreignRoom", label: "Room", default: true, width: 90 },
    ],
  },
];
