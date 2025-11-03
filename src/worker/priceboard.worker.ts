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

// ---- Giảm khởi tạo tạm ----
const FLASH_LIMIT = 50;
const CACHE_LIMIT = 300;

// ==================== PROCESS QUEUE ====================

const processQueue = (): void => {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;

  const batch = queue.splice(0, FLASH_LIMIT);
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
    for (const key of KEYS_COLOR) {
      const newVal = getColumnValueCompact(snapshot, key);
      const oldVal = getColumnValueCompact(prev, key);
      if (newVal == null || oldVal == null || newVal === oldVal) continue;

      let flashClass: PriceCompare | null = null;

      // Giá thay đổi thì dùng priceCompare trong trade
      if (key.includes("price") || key.includes("Price")) {
        flashClass = snapshot.trade?.[13] ?? prev.trade?.[13] ?? null;
      }
      // Volume thay đổi thì tự so sánh lớn hơn / nhỏ hơn
      else if (key.includes("volume") || key.includes("Volume")) {
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

    for (const key of KEYS_COLOR) {
      let cmp: PriceCompare | undefined;

      if (
        ["lastPrice", "change", "changePercent", "lastVolume", "symbol"].some(
          (k) => key.includes(k)
        )
      ) {
        cmp = tradeCmp;
      } else if (orderBook) {
        const bids = orderBook[22]?.split("|") ?? [];
        const asks = orderBook[23]?.split("|") ?? [];

        if (key.startsWith("priceBuy")) {
          const i = parseInt(key[8], 10) - 1;
          cmp = (bids[i * 3 + 2] as PriceCompare) || undefined;
        } else if (key.startsWith("priceSell")) {
          const i = parseInt(key[9], 10) - 1;
          cmp = (asks[i * 3 + 2] as PriceCompare) || undefined;
        } else if (key.startsWith("volumeBuy")) {
          const i = parseInt(key[9], 10) - 1;
          cmp = (bids[i * 3 + 2] as PriceCompare) || undefined;
        } else if (key.startsWith("volumeSell")) {
          const i = parseInt(key[10], 10) - 1;
          cmp = (asks[i * 3 + 2] as PriceCompare) || undefined;
        }
      }

      colorMap[key] = cmp ?? "t";
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

// ==================== MESSAGE HANDLER ====================

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
