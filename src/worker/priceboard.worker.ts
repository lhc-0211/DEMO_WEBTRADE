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

    // Nếu không visible → chỉ lưu prev, không xử lý
    if (!visibleSymbols.has(symbol)) {
      prevSnapshots.set(symbol, snapshot);
      continue;
    }

    const prev = prevSnapshots.get(symbol);
    if (!prev) {
      prevSnapshots.set(symbol, snapshot);
      continue;
    }

    // === FLASH LOGIC ===
    const cacheNew: Record<string, string | null> = {};
    const cacheOld: Record<string, string | null> = {};

    for (const key of KEYS_COLOR) {
      cacheNew[key] = getColumnValueCompact(snapshot, key);
      cacheOld[key] = getColumnValueCompact(prev, key);
    }

    for (const key of KEYS_COLOR) {
      const newVal = cacheNew[key];
      const oldVal = cacheOld[key];
      if (!newVal || !oldVal || newVal === oldVal) continue;

      let flashClass: PriceCompare | null = null;

      if (key.includes("price") || key.includes("Price")) {
        flashClass = snapshot.trade?.[13] ?? prev.trade?.[13] ?? null;
      } else if (key.includes("volume") || key.includes("Volume")) {
        const n = parseInt(newVal.replace(/,/g, ""), 10);
        const o = parseInt(oldVal.replace(/,/g, ""), 10);
        if (!isNaN(n) && !isNaN(o)) {
          flashClass = n > o ? "u" : "d";
        }
      } else if (key === "high") {
        flashClass =
          (snapshot.orderBook?.[24]?.split("|")[1] as PriceCompare) ?? null;
      } else if (key === "low") {
        flashClass =
          (snapshot.orderBook?.[25]?.split("|")[1] as PriceCompare) ?? null;
      } else if (key === "avg") {
        flashClass =
          (snapshot.orderBook?.[28]?.split("|")[1] as PriceCompare) ?? null;
      }

      if (flashClass) {
        flashResults.push({ symbol, key, flashClass });
      }
    }

    // // === COLOR LOGIC ===
    // const colorMap: Record<string, PriceCompare | "t"> = {};
    // const tradeCmp = snapshot.trade?.[13] ?? "t";
    // const orderBook = snapshot.orderBook;

    // const getArr = (value: OrderBookValue): string[] => {
    //   if (typeof value === "string") {
    //     return value.split("|");
    //   }
    //   if (Array.isArray(value)) {
    //     // Kiểm tra phần tử có phải string không (an toàn)
    //     return value.every((item): item is string => typeof item === "string")
    //       ? value
    //       : [];
    //   }
    //   return [];
    // };

    // const bids = getArr(orderBook?.[22]);
    // const asks = getArr(orderBook?.[23]);

    // for (const key of KEYS_COLOR) {
    //   let cmp: PriceCompare | "t" = "t";

    //   if (
    //     ["lastPrice", "change", "changePercent", "lastVolume", "symbol"].some(
    //       (k) => key.includes(k)
    //     )
    //   ) {
    //     cmp = tradeCmp;
    //   } else if (orderBook) {
    //     if (key.startsWith("priceBuy") || key.startsWith("volumeBuy")) {
    //       const i = parseInt(key.slice(-1), 10) - 1;
    //       cmp = (bids[i * 3 + 2] as PriceCompare) ?? "t";
    //     } else if (
    //       key.startsWith("priceSell") ||
    //       key.startsWith("volumeSell")
    //     ) {
    //       const i = parseInt(key.slice(-1), 10) - 1;
    //       cmp = (asks[i * 3 + 2] as PriceCompare) ?? "t";
    //     } else if (key === "high") {
    //       cmp = (orderBook[24]?.split("|")[1] as PriceCompare) ?? "t";
    //     } else if (key === "low") {
    //       cmp = (orderBook[25]?.split("|")[1] as PriceCompare) ?? "t";
    //     } else if (key === "avg") {
    //       cmp = (orderBook[28]?.split("|")[1] as PriceCompare) ?? "t";
    //     }
    //   }

    //   colorMap[key] = cmp;
    // }

    // if (visibleSymbols.has(symbol)) {
    //   colors[symbol] = colorMap;
    // }

    // colors[symbol] = colorMap;
    prevSnapshots.set(symbol, snapshot);
  }

  // Gửi kết quả
  if (flashResults.length > 0 || Object.keys(colors).length > 0) {
    self.postMessage({
      type: "update",
      data: { flashes: flashResults, colors },
    } satisfies WorkerOutputMessage);
  }

  isProcessing = false;

  // Tiếp tục xử lý nếu còn
  if (queue.length > 0) {
    queueMicrotask(processQueue);
  }
};

// === XỬ LÝ TIN NHẮN ===
self.onmessage = (e: MessageEvent<WorkerInputMessage>) => {
  const { type, data } = e.data;

  switch (type) {
    case "batch":
      queue.push(...data);
      if (queue.length > CACHE_LIMIT) {
        queue = queue.slice(-CACHE_LIMIT);
      }
      processQueue();
      break;

    case "visible":
      {
        const oldVisible = visibleSymbols;
        visibleSymbols = new Set(data);

        // Xóa prev của symbol không còn visible
        for (const sym of oldVisible) {
          if (!visibleSymbols.has(sym)) {
            prevSnapshots.delete(sym);
          }
        }
      }
      break;

    case "clear":
      data.forEach((sym) => prevSnapshots.delete(sym));
      break;
  }
};
