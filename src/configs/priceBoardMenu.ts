import type { PriceBoardMenuGroup } from "../types";

export const PRICE_BOARD_MENU: PriceBoardMenuGroup[] = [
  {
    key: "customer",
    label: "Nhóm yêu thích",
    items: [
      { id: "favorite", name: "Yêu thích", isCustom: true },
      { id: "all", name: "Toàn thị trường" },
    ],
  },
  {
    key: "hose",
    label: "HOSE",
    items: [
      // { id: "vnindex", name: "VNINDEX" },
      { id: "hose", name: "HOSE" },
      { id: "vn30", name: "VN30" },
      // { id: "vnxall", name: "VNXALL" },
      // { id: "vnx50", name: "VNX50" },
    ],
  },
  {
    key: "hnx",
    label: "HNX",
    items: [
      { id: "hnx", name: "HNX" },
      { id: "hnx30", name: "HNX30" },
    ],
  },
  {
    key: "upcom",
    label: "UPCOM",
    items: [{ id: "upcom", name: "UPCOM" }],
  },
  {
    key: "cw",
    label: "Chứng quyền",
    items: [{ id: "cw", name: "Chứng quyền" }],
  },
  {
    key: "etf",
    label: "ETF",
    items: [{ id: "etf", name: "ETFs" }],
  },
  {
    key: "deal",
    label: "Thỏa thuận",
    items: [
      {
        id: "deal_hose",
        name: "Thỏa thuận HOSE",
        market: "HOSE",
        type: "deal",
      },
      { id: "deal_hnx", name: "Thỏa thuận HNX", market: "HNX", type: "deal" },
      {
        id: "deal_upcom",
        name: "Thỏa thuận UPCOM",
        market: "UPCOM",
        type: "deal",
      },
    ],
  },
  {
    key: "oddlot",
    label: "Lô lẻ",
    items: [
      { id: "hsx_ll", name: "Lô lẻ HOSE", market: "HOSE", type: "oddlot" },
      { id: "hnx_ll", name: "Lô lẻ HNX", market: "HNX", type: "oddlot" },
      {
        id: "upcom_ll",
        name: "Lô lẻ UPCOM",
        market: "UPCOM",
        type: "oddlot",
      },
    ],
  },
];
