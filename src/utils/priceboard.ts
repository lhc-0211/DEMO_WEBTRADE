import type { SnapshotDataCompact } from "../types";
import {
  formatPrice,
  formatVolPrice,
  numberFormat,
  StringToInt,
} from "./format";

export const getColumnValueCompact = (
  snapshot: SnapshotDataCompact,
  key: string
) => {
  if (!snapshot) return null;

  if (key === "symbol") {
    return snapshot?.symbol?.split(":")[0] || "";
  }

  // --- Trade ---
  if (snapshot.trade) {
    switch (key) {
      case "lastPrice":
        return formatPrice(snapshot.trade["8"]);
      case "lastVolume":
        return formatVolPrice(snapshot.trade["9"]);
      case "change":
        return snapshot.trade["11"] && snapshot.trade["11"] !== 0
          ? formatPrice(snapshot.trade["11"])
          : "";
      case "changePc":
        return snapshot.trade["12"]
          ? numberFormat(snapshot.trade["12"], 2, "") + " %"
          : "";
    }
  }

  // --- OrderBook ---
  if (snapshot.orderBook) {
    const bids = snapshot.orderBook["22"]?.split("|") ?? [];
    const asks = snapshot.orderBook["23"]?.split("|") ?? [];

    if (key.startsWith("priceBuy")) {
      const i = parseInt(key[8], 10) - 1;
      return formatPrice(bids[i * 3]);
    }
    if (key.startsWith("volumeBuy")) {
      const i = parseInt(key[9], 10) - 1;
      return formatVolPrice(StringToInt(bids[i * 3 + 1]));
    }
    if (key.startsWith("priceSell")) {
      const i = parseInt(key[9], 10) - 1;
      return formatPrice(asks[i * 3]);
    }
    if (key.startsWith("volumeSell")) {
      const i = parseInt(key[10], 10) - 1;
      return formatVolPrice(StringToInt(asks[i * 3 + 1]));
    }

    switch (key) {
      case "high":
        return (
          formatPrice(String(snapshot.orderBook["24"] || "").split("|")[0]) ||
          ""
        );
      case "low":
        return (
          formatPrice(String(snapshot.orderBook["25"] || "").split("|")[0]) ||
          ""
        );
      case "avg":
        return (
          formatPrice(String(snapshot.orderBook["28"] || "").split("|")[0]) ||
          ""
        );
      case "totalVol":
        return formatVolPrice(snapshot.orderBook["26"]);
    }
  }

  // --- RefPrices ---
  if (snapshot.refPrices) {
    switch (key) {
      case "ref":
        return formatPrice(snapshot.refPrices["4"]);
      case "ceil":
        return formatPrice(snapshot.refPrices["5"]);
      case "floor":
        return formatPrice(snapshot.refPrices["6"]);
    }
  }

  // --- ForeignTrade ---
  if (snapshot.foreignTrade) {
    switch (key) {
      case "foreignBuy":
        return formatVolPrice(snapshot.foreignTrade["15"]);
      case "foreignSell":
        return formatVolPrice(snapshot.foreignTrade["17"]);
    }
  }

  // --- ForeignRoom ---
  if (snapshot.foreignRoom) {
    switch (key) {
      case "foreignRoom":
        return formatVolPrice(snapshot.foreignRoom["21"]);
    }
  }

  return null;
};
