import type { SnapshotData } from "../types";
import { formatPrice, numberFormat } from "./format";

export const getColumnValue = (
  snapshot: SnapshotData,
  colKey: string
): string => {
  switch (colKey) {
    case "symbol":
      return snapshot?.symbol?.split(":")[0] || "-";

    case "mark":
      return "★";

    case "ceil":
      // return formatPrice(snapshot.ceil);
      return "-";

    case "floor":
      // return formatPrice(snapshot.floor);
      return "-";

    case "ref":
      // return formatPrice(snapshot.ref);
      return "-";

    case "priceBuy3":
      return formatPrice(snapshot.orderBook?.bids[2]?.price);
    case "volumeBuy3":
      return numberFormat(snapshot.orderBook?.bids[2]?.volume, 0, "-");
    case "priceBuy2":
      return formatPrice(snapshot.orderBook?.bids[1]?.price);
    case "volumeBuy2":
      return numberFormat(snapshot.orderBook?.bids[1]?.volume, 0, "-");
    case "priceBuy1":
      return formatPrice(snapshot.orderBook?.bids[0]?.price);
    case "volumeBuy1":
      return numberFormat(snapshot.orderBook?.bids[0]?.volume, 0, "-");

    case "lastPrice":
      return formatPrice(snapshot.trade?.price);
    case "lastVolume":
      return numberFormat(snapshot.trade?.volume, 0, "-");

    case "change": {
      return "-";
    }

    case "changePc": {
      return "-";
    }

    case "priceSell1":
      return formatPrice(snapshot.orderBook?.asks[0]?.price);
    case "volumeSell1":
      return numberFormat(snapshot.orderBook?.asks[0]?.volume, 0, "-");
    case "priceSell2":
      return formatPrice(snapshot.orderBook?.asks[1]?.price);
    case "volumeSell2":
      return numberFormat(snapshot.orderBook?.asks[1]?.volume, 0, "-");
    case "priceSell3":
      return formatPrice(snapshot.orderBook?.asks[2]?.price);
    case "volumeSell3":
      return numberFormat(snapshot.orderBook?.asks[2]?.volume, 0, "-");

    case "high":
      // return formatPrice(snapshot.high);
      return "-";
    case "avg":
      // return formatPrice(snapshot.avg);
      return "-";
    case "low":
      // return formatPrice(snapshot.low);
      return "-";
    case "totalVol":
      // return numberFormat(snapshot.totalVol, 0, "-");
      return "-";

    case "foreignBuy":
      return numberFormat(snapshot.foreignTrade?.foreignBuyVolume, 0, "-");
    case "foreignSell":
      return numberFormat(snapshot.foreignTrade?.foreignSellVolume, 0, "-");

    case "foreignRoom": {
      return numberFormat(snapshot.foreignRoom?.totalRoom, 0, "-");
    }

    default:
      return "-";
  }
};
