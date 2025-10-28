import { KEYS_COLOR } from "../../../../../configs/headerPriceBoard";
import type { SnapshotData } from "../../../../../types";

const getTextColor = (cmp: string | undefined): string => {
  switch (cmp) {
    case "u":
      return "text-green-500";
    case "d":
      return "text-red-500";
    case "r":
      return "text-yellow-500";
    case "c":
      return "text-purple-500";
    case "f":
      return "text-blue-500";
    default:
      return "text-text-body";
  }
};

self.onmessage = (e: MessageEvent<{ type: "batch"; data: SnapshotData[] }>) => {
  if (e.data.type !== "batch") return;

  const colors: Record<string, Record<string, string>> = {};

  for (const s of e.data.data) {
    colors[s.symbol] = {};
    KEYS_COLOR.forEach((key) => {
      let cmp: string | undefined;
      if (
        key === "lastPrice" ||
        key === "lastVolume" ||
        key.includes("change")
      ) {
        cmp = s.trade?.priceCompare;
      } else if (key.startsWith("priceBuy")) {
        const i = parseInt(key[8]) - 1;
        cmp = s.orderBook?.bids?.[i]?.priceCompare;
      } else if (key.startsWith("priceSell")) {
        const i = parseInt(key[9]) - 1;
        cmp = s.orderBook?.asks?.[i]?.priceCompare;
      }
      colors[s.symbol][key] = getTextColor(cmp);
    });
  }

  self.postMessage({ type: "colors", data: colors });
};
