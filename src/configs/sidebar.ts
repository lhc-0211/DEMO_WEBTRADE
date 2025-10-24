import type { SidebarItemGroup } from "../types/layout";

import { HiCursorArrowRays } from "react-icons/hi2";
import { MdCandlestickChart } from "react-icons/md";

export const SIDE_BAR_GROUPS: SidebarItemGroup[] = [
  {
    id: "group_1",
    items: [
      {
        id: "price_board",
        title: "Bảng giá",
        path: "/price-board",
        icon: MdCandlestickChart,
      },
      // {
      //   id: "market_overview",
      //   title: "Thị trường",
      //   path: "/market-overview",
      //   icon: MarketOverview,
      //   requiresLogin: true,
      // },
    ],
  },
  {
    id: "group_2",
    items: [
      {
        id: "place_order",
        title: "Đặt lệnh",
        path: "/place-order",
        icon: HiCursorArrowRays,
        requiresLogin: true,
      },
      // {
      //   id: "portfolio",
      //   title: "Danh mục",
      //   path: "/portfolio",
      //   icon: Portfolio,
      //   requiresLogin: true,
      // },
      // {
      //   id: "trade_history",
      //   title: "Lịch sử",
      //   path: "/trade-history",
      //   icon: TradeHistory,
      //   requiresLogin: true,
      // },
    ],
  },
  // {
  //   id: "group_3",
  //   items: [
  //     {
  //       id: "account_settings",
  //       title: "Tài khoản",
  //       path: "/account",
  //       icon: AccountSettings,
  //       requiresLogin: true,
  //     },
  //   ],
  // },
];
