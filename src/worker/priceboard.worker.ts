import { KEYS_COLOR } from "../configs/headerPriceBoard";
import type {
  FlashClass,
  FlashResult,
  SnapshotData,
  WorkerInputMessage,
  WorkerOutputMessage,
} from "../types";
import { getColumnValue } from "../utils/priceboard";

const getTextColor = (cmp?: string): string => {
  switch (cmp) {
    case "u":
      return "text-green-500";
    case "d":
      return "text-red-500";
    case "r":
      return "text-yellow-500";
    case "c":
      return "text-violet-500";
    case "f":
      return "text-blue-500";
    default:
      return "text-text-body";
  }
};

const toFlashClass = (cmp?: string): FlashClass | null => {
  const map: Record<string, FlashClass> = {
    u: "flash-up",
    d: "flash-down",
    c: "flash-ceil",
    f: "flash-floor",
    r: "flash-reference",
  };
  return cmp ? map[cmp] ?? null : null;
};

let queue: SnapshotData[] = [];
let isProcessing = false;
let visibleSymbols = new Set<string>();
const prevSnapshots = new Map<string, SnapshotData>();

const processQueue = (): void => {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;

  const batch = queue.splice(0, 50);
  const flashResults: FlashResult[] = [];
  const colors: Record<string, Record<string, string>> = {};

  for (const snapshot of batch) {
    const { symbol } = snapshot;

    // Bỏ qua symbol không visible
    if (!visibleSymbols.has(symbol)) {
      prevSnapshots.set(symbol, snapshot);
      continue;
    }

    const prev = prevSnapshots.get(symbol);

    // Lần đầu chỉ cache, không diff
    if (!prev) {
      prevSnapshots.set(symbol, snapshot);
      continue;
    }

    // === FLASH ===
    for (const key of KEYS_COLOR) {
      const newVal = getColumnValue(snapshot, key);
      const oldVal = getColumnValue(prev, key);
      if (newVal == null || oldVal == null || newVal === oldVal) continue;

      let flashClass: FlashClass | null = null;

      if (key.includes("price") || key.includes("Price")) {
        flashClass = toFlashClass(
          snapshot.trade?.priceCompare ?? prev.trade?.priceCompare
        );
      } else if (key.includes("volume") || key.includes("Volume")) {
        const n = parseInt(newVal.replace(/,/g, ""), 10);
        const o = parseInt(oldVal.replace(/,/g, ""), 10);
        if (!isNaN(n) && !isNaN(o)) {
          flashClass = n > o ? "flash-up" : "flash-down";
        }
      }

      if (flashClass) flashResults.push({ symbol, key, flashClass });
    }

    // === COLOR ===
    const colorMap: Record<string, string> = {};
    for (const key of KEYS_COLOR) {
      let cmp: string | undefined;
      if (
        ["lastPrice", "change", "changePercent", "lastVolume", "symbol"].some(
          (k) => key.includes(k)
        )
      ) {
        cmp = snapshot.trade?.priceCompare;
      } else if (key.startsWith("priceBuy")) {
        const i = parseInt(key[8], 10) - 1;
        cmp = snapshot.orderBook?.bids?.[i]?.priceCompare;
      } else if (key.startsWith("priceSell")) {
        const i = parseInt(key[9], 10) - 1;
        cmp = snapshot.orderBook?.asks?.[i]?.priceCompare;
      } else if (key.startsWith("volumeBuy")) {
        const i = parseInt(key[9], 10) - 1;
        cmp = snapshot.orderBook?.bids?.[i]?.priceCompare;
      } else if (key.startsWith("volumeSell")) {
        const i = parseInt(key[10], 10) - 1;
        cmp = snapshot.orderBook?.asks?.[i]?.priceCompare;
      }
      colorMap[key] = getTextColor(cmp);
    }
    colors[symbol] = colorMap;

    // Cập nhật cache nhẹ
    prevSnapshots.set(symbol, snapshot);
  }

  if (flashResults.length > 0 || Object.keys(colors).length > 0) {
    self.postMessage({
      type: "update",
      data: { flash: flashResults, colors },
    } satisfies WorkerOutputMessage);
  }

  isProcessing = false;
  if (queue.length > 0) queueMicrotask(processQueue);
};

// ==================== MESSAGE HANDLER ====================
self.onmessage = (e: MessageEvent<WorkerInputMessage>) => {
  const { type, data } = e.data;

  switch (type) {
    case "batch":
      queue.push(...data);
      if (queue.length > 300) queue = queue.slice(-300);
      processQueue();
      break;
    case "visible":
      visibleSymbols = new Set(data);
      break;
    case "clear":
      data.forEach((s) => prevSnapshots.delete(s));
      break;
  }
};
