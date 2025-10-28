import type { SnapshotData } from "../../../../../types";

type ColumnValue = string | number | undefined;

const getColumnValue = (snapshot: SnapshotData, key: string): ColumnValue => {
  switch (key) {
    case "lastPrice":
      return snapshot.trade?.price;
    case "lastVolume":
      return snapshot.trade?.volume;
    case "priceBuy1":
      return snapshot.orderBook?.bids?.[0]?.price;
    case "volumeBuy1":
      return snapshot.orderBook?.bids?.[0]?.volume;
    case "priceBuy2":
      return snapshot.orderBook?.bids?.[1]?.price;
    case "volumeBuy2":
      return snapshot.orderBook?.bids?.[1]?.volume;
    case "priceBuy3":
      return snapshot.orderBook?.bids?.[2]?.price;
    case "volumeBuy3":
      return snapshot.orderBook?.bids?.[2]?.volume;
    case "priceSell1":
      return snapshot.orderBook?.asks?.[0]?.price;
    case "volumeSell1":
      return snapshot.orderBook?.asks?.[0]?.volume;
    case "priceSell2":
      return snapshot.orderBook?.asks?.[1]?.price;
    case "volumeSell2":
      return snapshot.orderBook?.asks?.[1]?.volume;
    case "priceSell3":
      return snapshot.orderBook?.asks?.[2]?.price;
    case "volumeSell3":
      return snapshot.orderBook?.asks?.[2]?.volume;
    default:
      return undefined;
  }
};

const KEYS = [
  "lastPrice",
  "lastVolume",
  "priceBuy1",
  "volumeBuy1",
  "priceBuy2",
  "volumeBuy2",
  "priceBuy3",
  "volumeBuy3",
  "priceSell1",
  "volumeSell1",
  "priceSell2",
  "volumeSell2",
  "priceSell3",
  "volumeSell3",
] as const;

type FlashResult = { symbol: string; key: string; flashClass: string };

self.onmessage = (
  e: MessageEvent<{
    type: "batch";
    data: Array<{ snapshot: SnapshotData; prevSnapshot: SnapshotData | null }>;
  }>
) => {
  if (e.data.type !== "batch") return;

  const results: FlashResult[] = [];

  for (const { snapshot, prevSnapshot } of e.data.data) {
    if (!prevSnapshot) continue;

    for (const key of KEYS) {
      const newVal = getColumnValue(snapshot, key);
      const oldVal = getColumnValue(prevSnapshot, key);
      if (newVal === oldVal || newVal == null || oldVal == null) continue;

      let flashClass: string | null = null;

      if (key.includes("Price") || key === "lastPrice") {
        if (key === "lastPrice") {
          flashClass = newVal > oldVal ? "flash-up" : "flash-down";
        } else if (key.startsWith("priceBuy")) {
          const idx = parseInt(key[8]) - 1;
          const cmp = snapshot.orderBook?.bids?.[idx]?.priceCompare;
          if (cmp === "u") flashClass = "flash-up";
          else if (cmp === "d") flashClass = "flash-down";
        } else if (key.startsWith("priceSell")) {
          const idx = parseInt(key[9]) - 1;
          const cmp = snapshot.orderBook?.asks?.[idx]?.priceCompare;
          if (cmp === "u") flashClass = "flash-up";
          else if (cmp === "d") flashClass = "flash-down";
        }
      } else if (key.includes("Volume") || key === "lastVolume") {
        if (typeof newVal === "number" && typeof oldVal === "number") {
          flashClass = newVal > oldVal ? "flash-up" : "flash-down";
        }
      }

      if (flashClass) {
        results.push({ symbol: snapshot.symbol, key, flashClass });
      }
    }
  }

  if (results.length > 0) {
    self.postMessage({ type: "flash", data: results });
  }
};

declare const self: Worker;
