// src/features/priceboard/components/board/workers/flashWorker.ts
import { KEYS_COLOR } from "../../../../../configs/headerPriceBoard";
import type {
  FlashClass,
  FlashResult,
  SnapshotData,
} from "../../../../../types";
import { getColumnValue } from "../../../../../utils/priceboard";

const FLUSH_INTERVAL = 50;
const MAX_BUFFER = 5000;

// ====== Bộ đệm ======
const buffer: FlashResult[] = [];
let flushing = false;

// ====== Hàm flush định kỳ ======
const flush = () => {
  if (flushing || buffer.length === 0) return;
  flushing = true;

  const data = buffer.splice(0, buffer.length); // copy & clear nhanh
  self.postMessage({ type: "flash", data });

  flushing = false;
};
setInterval(flush, FLUSH_INTERVAL);

// ====== Hàm xử lý batch ======
self.onmessage = (
  e: MessageEvent<{
    type: "batch";
    data: Array<{ snapshot: SnapshotData; prevSnapshot: SnapshotData | null }>;
  }>
) => {
  if (e.data.type !== "batch") return;

  const batch: FlashResult[] = [];

  for (const { snapshot, prevSnapshot } of e.data.data) {
    if (!prevSnapshot) continue;

    const newValues: Record<string, string | number | null> = {};
    const oldValues: Record<string, string | number | null> = {};

    // Cache lại giá trị để tránh gọi getColumnValue nhiều lần
    for (const key of KEYS_COLOR) {
      newValues[key] = getColumnValue(snapshot, key);
      oldValues[key] = getColumnValue(prevSnapshot, key);
    }

    for (const key of KEYS_COLOR) {
      const newVal = newValues[key];
      const oldVal = oldValues[key];

      if (newVal == null || oldVal == null || newVal === oldVal) continue;

      let flashClass: FlashClass | null = null;

      if (key.includes("price") || key.includes("Price")) {
        const cmp =
          snapshot.trade?.priceCompare ??
          snapshot.orderBook?.bids?.[0]?.priceCompare ??
          snapshot.orderBook?.asks?.[0]?.priceCompare;

        switch (cmp) {
          case "u":
            flashClass = "flash-up";
            break;
          case "d":
            flashClass = "flash-down";
            break;
          case "c":
            flashClass = "flash-ceil";
            break;
          case "f":
            flashClass = "flash-floor";
            break;
          case "r":
            flashClass = "flash-reference";
            break;
        }
      } else if (key.includes("volume") || key.includes("Volume")) {
        const n = Number(String(newVal).replace(/,/g, ""));
        const o = Number(String(oldVal).replace(/,/g, ""));
        if (Number.isFinite(n) && Number.isFinite(o))
          flashClass = n > o ? "flash-up" : "flash-down";
      }

      if (flashClass) batch.push({ symbol: snapshot.symbol, key, flashClass });
    }
  }

  // Gom batch vào buffer, tránh overflow
  if (buffer.length < MAX_BUFFER) {
    buffer.push(...batch);
  } else {
    buffer.splice(0, batch.length, ...batch.slice(-MAX_BUFFER)); // giữ lại phần mới nhất
  }
};
