import { KEYS_COLOR } from "../../../../../configs/headerPriceBoard";
import type {
  FlashClass,
  FlashResult,
  PriceCompare,
  SnapshotData,
} from "../../../../../types";
import { StringToInt } from "../../../../../utils";
import { getColumnValue } from "../../../../../utils/priceboard";

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

    for (const key of KEYS_COLOR) {
      const newVal = getColumnValue(snapshot, key);
      const oldVal = getColumnValue(prevSnapshot, key);

      // Bỏ qua nếu null hoặc không đổi
      if (newVal == null || oldVal == null || newVal === oldVal) continue;

      let flashClass: FlashClass | null = null;

      // 1. CÁC CỘT GIÁ -> dùng priceCompare
      if (
        key === "lastPrice" ||
        key.startsWith("priceBuy") ||
        key.startsWith("priceSell") ||
        key === "change" ||
        key === "changePc"
      ) {
        let cmp: PriceCompare | undefined = undefined;

        if (key === "lastPrice") {
          cmp = snapshot.trade?.priceCompare;
        } else if (key === "change") {
          cmp = snapshot.trade?.priceCompare;
        } else if (key === "changePc") {
          cmp = snapshot.trade?.priceCompare;
        } else if (key.startsWith("priceBuy")) {
          const idx = parseInt(key[8]) - 1;
          cmp = snapshot.orderBook?.bids?.[idx]?.priceCompare;
        } else if (key.startsWith("priceSell")) {
          const idx = parseInt(key[9]) - 1;
          cmp = snapshot.orderBook?.asks?.[idx]?.priceCompare;
        }

        if (cmp === "u") flashClass = "flash-up";
        else if (cmp === "d") flashClass = "flash-down";
        else if (cmp === "r") flashClass = "flash-reference";
        else if (cmp === "c") flashClass = "flash-ceil";
        else if (cmp === "f") flashClass = "flash-floor";
      }

      // 2. CÁC CỘT KHỐI LƯỢNG -> SO SÁNH GIÁ TRỊ CŨ/MỚI
      else if (
        key === "lastVolume" ||
        key.startsWith("volumeBuy") ||
        key.startsWith("volumeSell")
      ) {
        flashClass =
          StringToInt(newVal) > StringToInt(oldVal) ? "flash-up" : "flash-down";
      }

      if (flashClass) {
        results.push({ symbol: snapshot.symbol, key, flashClass });
      }
    }
  }

  self.postMessage({ type: "flash", data: results });
};
