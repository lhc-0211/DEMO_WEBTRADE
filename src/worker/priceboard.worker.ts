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
      return "text-purple-500";
    case "f":
      return "text-blue-500";
    default:
      return "text-text-body";
  }
};

let queue: SnapshotData[] = [];
let isProcessing = false;
let visibleSymbols = new Set<string>();
const prevSnapshots = new Map<string, SnapshotData>();

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

const processQueue = (): void => {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;

  const batch = queue.splice(0, 50);
  const flashResults: FlashResult[] = [];
  const colors: Record<string, Record<string, string>> = {};

  for (const snapshot of batch) {
    const symbol = snapshot.symbol;
    const prev = prevSnapshots.get(symbol);

    // === FLASH ===
    if (prev && visibleSymbols.has(symbol)) {
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

        if (flashClass) {
          flashResults.push({ symbol, key, flashClass } satisfies FlashResult);
        }
      }
    }

    // === COLOR ===
    if (visibleSymbols.has(symbol)) {
      colors[symbol] = {};
      for (const key of KEYS_COLOR) {
        let cmp: string | undefined;
        if (
          ["lastPrice", "change", "changePercent", "lastVolume"].some((k) =>
            key.includes(k)
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
        colors[symbol][key] = getTextColor(cmp);
      }
    }

    // Cập nhật prev
    prevSnapshots.set(symbol, {
      ...snapshot,
      orderBook: snapshot.orderBook
        ? {
            ...snapshot.orderBook,
            bids: [...(snapshot.orderBook.bids ?? [])],
            asks: [...(snapshot.orderBook.asks ?? [])],
          }
        : undefined,
    });
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

self.onmessage = (e: MessageEvent<WorkerInputMessage>) => {
  const { type, data } = e.data;

  if (type === "batch") {
    queue.push(...data);
    if (queue.length > 200) queue = queue.slice(-200);
    processQueue();
  } else if (type === "visible") {
    visibleSymbols = new Set(data);
  } else if (type === "clear") {
    data.forEach((s) => prevSnapshots.delete(s));
  }
};
