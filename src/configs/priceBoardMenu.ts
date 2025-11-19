import type { PriceBoardMenuGroup } from "../types";

export const PRICE_BOARD_MENU: PriceBoardMenuGroup[] = [
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
  // {
  //   key: "etf",
  //   label: "ETF",
  //   items: [{ id: "etf", name: "ETFs", symbols: ["AAA", "ACB"] }],
  // },
  {
    key: "deal",
    label: "Thỏa thuận",
    items: [
      {
        id: "hsx_tt",
        name: "Thỏa thuận HOSE",
        market: "HOSE",
        type: "deal",
      },
      { id: "hnx_tt", name: "Thỏa thuận HNX", market: "HNX", type: "deal" },
      {
        id: "upcom_tt",
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

//TODO: ID chartIndex
export const ID_VN30 = "1:100";
export const ID_HOSE = "1:001";
export const ID_HNX = "2:002";
export const ID_UPCOM = "4:001";
