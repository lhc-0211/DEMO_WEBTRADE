import { KEYS_COLOR } from "../../../../../configs/headerPriceBoard";
import type {
  FlashClass,
  FlashResult,
  SnapshotData,
} from "../../../../../types";
import { getColumnValue } from "../../../../../utils/priceboard";

self.onmessage = (
  e: MessageEvent<{
    type: "batch";
    data: Array<{ snapshot: SnapshotData; prevSnapshot: SnapshotData | null }>;
  }>
) => {
  if (e.data.type !== "batch") return;

  const flashResults: FlashResult[] = [];

  for (const { snapshot, prevSnapshot } of e.data.data) {
    if (!prevSnapshot) continue;

    for (const key of KEYS_COLOR) {
      const newVal = getColumnValue(snapshot, key);
      const oldVal = getColumnValue(prevSnapshot, key);

      // BỎ QUA nếu không đổi
      if (newVal == null || oldVal == null || newVal === oldVal) continue;

      let flashClass: FlashClass | null = null;

      // GIÁ: dùng priceCompare
      if (key.includes("price") || key.includes("Price")) {
        const cmp =
          snapshot.trade?.priceCompare ??
          snapshot.orderBook?.bids?.[0]?.priceCompare ??
          snapshot.orderBook?.asks?.[0]?.priceCompare;

        if (cmp === "u") flashClass = "flash-up";
        else if (cmp === "d") flashClass = "flash-down";
        else if (cmp === "c") flashClass = "flash-ceil";
        else if (cmp === "f") flashClass = "flash-floor";
        else if (cmp === "r") flashClass = "flash-reference";
      }
      // KHỐI LƯỢNG: so sánh số
      else if (key.includes("volume") || key.includes("Volume")) {
        const n = parseInt(newVal.replace(/,/g, ""));
        const o = parseInt(oldVal.replace(/,/g, ""));
        flashClass = n > o ? "flash-up" : "flash-down";
      }

      if (flashClass) {
        flashResults.push({ symbol: snapshot.symbol, key, flashClass });
      }
    }
  }

  self.postMessage({ type: "flash", data: flashResults });
};
