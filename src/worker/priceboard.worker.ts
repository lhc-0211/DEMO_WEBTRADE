import { KEYS_COLOR } from "../configs/headerPriceBoard";
import type {
  FlashResult,
  PriceCompare,
  SnapshotDataCompact,
  WorkerInputMessage,
  WorkerOutputMessage,
} from "../types";
import { getColumnValueCompact } from "../utils/priceboard";

let queue: SnapshotDataCompact[] = [];
let isProcessing = false;
let visibleSymbols = new Set<string>();
const prevSnapshots = new Map<string, SnapshotDataCompact>();

const BATCH_LIMIT = 100;
const CACHE_LIMIT = 300;

const processQueue = (): void => {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;

  const batch = queue.splice(0, BATCH_LIMIT);
  const flashResults: FlashResult[] = [];
  const colors: Record<string, Record<string, PriceCompare | "t">> = {};

  for (const snapshot of batch) {
    const { symbol } = snapshot;
    if (!visibleSymbols.has(symbol)) {
      prevSnapshots.set(symbol, snapshot);
      continue;
    }

    const prev = prevSnapshots.get(symbol);
    if (!prev) {
      prevSnapshots.set(symbol, snapshot);
      continue;
    }

    // === FLASH ===
    const cacheNew: Record<string, string | null> = {};
    const cacheOld: Record<string, string | null> = {};

    for (const key of KEYS_COLOR) {
      cacheNew[key] = getColumnValueCompact(snapshot, key);
      cacheOld[key] = getColumnValueCompact(prev, key);
    }

    for (const key of KEYS_COLOR) {
      const newVal = cacheNew[key];
      const oldVal = cacheOld[key];
      if (newVal == null || oldVal == null || newVal === oldVal) continue;

      let flashClass: PriceCompare | null = null;
      if (key.includes("price") || key.includes("Price")) {
        flashClass = snapshot.trade?.[13] ?? prev.trade?.[13] ?? null;
      } else if (key.includes("volume") || key.includes("Volume")) {
        const n = parseInt(newVal.replace(/,/g, ""), 10);
        const o = parseInt(oldVal.replace(/,/g, ""), 10);
        if (!isNaN(n) && !isNaN(o)) flashClass = n > o ? "u" : "d";
      }

      if (flashClass) flashResults.push({ symbol, key, flashClass });
    }

    // === COLOR ===
    const colorMap: Record<string, PriceCompare | "t"> = {};
    const tradeCmp = snapshot.trade?.[13];
    const orderBook = snapshot.orderBook;

    const bids =
      typeof orderBook?.[22] === "string"
        ? orderBook[22].split("|")
        : Array.isArray(orderBook?.[22])
        ? orderBook[22]
        : [];
    const asks =
      typeof orderBook?.[23] === "string"
        ? orderBook[23].split("|")
        : Array.isArray(orderBook?.[23])
        ? orderBook[23]
        : [];

    for (const key of KEYS_COLOR) {
      let cmp: PriceCompare | "t" = "t";

      if (
        ["lastPrice", "change", "changePercent", "lastVolume", "symbol"].some(
          (k) => key.includes(k)
        )
      ) {
        cmp = tradeCmp ?? "t";
      } else if (orderBook) {
        if (key.startsWith("priceBuy") || key.startsWith("volumeBuy")) {
          const i = parseInt(key.slice(-1), 10) - 1;
          cmp = (bids[i * 3 + 2] as PriceCompare) ?? "t";
        } else if (
          key.startsWith("priceSell") ||
          key.startsWith("volumeSell")
        ) {
          const i = parseInt(key.slice(-1), 10) - 1;
          cmp = (asks[i * 3 + 2] as PriceCompare) ?? "t";
        }
      }

      colorMap[key] = cmp;
    }

    colors[symbol] = colorMap;
    prevSnapshots.set(symbol, snapshot);
  }

  if (flashResults.length || Object.keys(colors).length) {
    self.postMessage({
      type: "update",
      data: { flashes: flashResults, colors },
    } satisfies WorkerOutputMessage);
  }

  isProcessing = false;
  if (queue.length > 0) queueMicrotask(processQueue);
};

self.onmessage = (e: MessageEvent<WorkerInputMessage>) => {
  const { type, data } = e.data;
  switch (type) {
    case "batch":
      queue.push(...data);
      if (queue.length > CACHE_LIMIT) queue = queue.slice(-CACHE_LIMIT);
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
