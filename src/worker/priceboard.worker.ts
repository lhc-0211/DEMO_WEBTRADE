import { KEYS_COLOR } from "../configs";
import type {
  FlashResult,
  PriceCompare,
  SnapshotDataCompact,
  WorkerInputMessage,
  WorkerOutputMessage,
} from "../types";
import { getColumnValueCompact } from "../utils/priceboard";

const CACHE_LIMIT = 8000;
const BATCH_LIMIT = 800;
const MAX_MS_PER_FRAME = 14;

let queue: SnapshotDataCompact[] = [];
let isProcessing = false;
let visibleSymbols = new Set<string>();

const pendingUpdates = new Map<string, SnapshotDataCompact[]>();
const prevSnapshots = new Map<string, SnapshotDataCompact>();

let isTabActive = true;

// =====================================================
const processQueue = (): void => {
  if (isProcessing) return;
  isProcessing = true;

  const processBatch = () => {
    const start = performance.now();

    let processedCount = 0;
    const flashResults: FlashResult[] = [];

    // Duyệt từng symbol có update đang chờ
    outer: while (
      processedCount < BATCH_LIMIT &&
      performance.now() - start < MAX_MS_PER_FRAME
    ) {
      for (const [symbol, updates] of pendingUpdates.entries()) {
        if (updates.length === 0) continue;

        const snapshot = updates.shift()!; // lấy update tiếp theo
        if (updates.length === 0) pendingUpdates.delete(symbol);

        const prev = prevSnapshots.get(symbol);

        // === LUÔN tính flash nếu symbol đang visible ===
        if (visibleSymbols.has(symbol) && prev) {
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

            let flashClass: PriceCompare | "u" | "d" | "t" | null = null;

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
                (snapshot.orderBook?.[24]?.split("|")[1] as PriceCompare) ??
                null;
            } else if (key === "low") {
              flashClass =
                (snapshot.orderBook?.[25]?.split("|")[1] as PriceCompare) ??
                null;
            } else if (key === "avg") {
              flashClass =
                (snapshot.orderBook?.[28]?.split("|")[1] as PriceCompare) ??
                null;
            }

            if (flashClass && isTabActive) {
              flashResults.push({ symbol, key, flashClass });
            }
          }
        }

        // Luôn cập nhật prev mới nhất
        prevSnapshots.set(symbol, snapshot);
        processedCount++;

        // Chỉ xử lý 1 update
        break;
      }

      // Nếu không còn update nào nữa thì thoát
      if (pendingUpdates.size === 0) break outer;
    }

    // Gửi flash nếu có
    if (flashResults.length > 0) {
      self.postMessage({
        type: "update",
        data: { flashes: flashResults, colors: {} },
      } satisfies WorkerOutputMessage);
    }

    // Tiếp tục xử lý trong frame này nếu còn thời gian và còn dữ liệu
    if (
      pendingUpdates.size > 0 &&
      performance.now() - start < MAX_MS_PER_FRAME
    ) {
      requestAnimationFrame(processBatch);
    } else {
      isProcessing = false;
      if (pendingUpdates.size > 0) {
        requestAnimationFrame(processBatch);
      }
    }
  };

  requestAnimationFrame(processBatch);
};

// ==================== NHẬN TIN NHẮN ====================
self.onmessage = (e: MessageEvent<WorkerInputMessage>) => {
  const { type, data } = e.data;

  switch (type) {
    case "batch":
      // Đưa toàn bộ batch vào pendingUpdates theo từng symbol
      for (const snap of data) {
        const arr = pendingUpdates.get(snap.symbol) || [];
        arr.push(snap);
        pendingUpdates.set(snap.symbol, arr);
      }

      // Giữ queue tổng không quá giới hạn
      if (queue.length > CACHE_LIMIT) {
        // Giữ lại phần mới nhất
        const excess = queue.length - CACHE_LIMIT;
        queue.splice(0, excess);
      }

      processQueue();
      break;

    case "visible": {
      const oldVisible = visibleSymbols;
      visibleSymbols = new Set(data);

      // Xóa prev của symbol không còn visible để tiết kiệm RAM
      for (const sym of oldVisible) {
        if (!visibleSymbols.has(sym)) {
          prevSnapshots.delete(sym);
          pendingUpdates.delete(sym);
        }
      }
      processQueue(); // có thể có flash mới khi symbol vừa được visible
      break;
    }

    case "clear":
      data.forEach((sym) => {
        prevSnapshots.delete(sym);
        pendingUpdates.delete(sym);
      });
      break;

    case "clearAll":
      queue = [];
      pendingUpdates.clear();
      prevSnapshots.clear();
      isProcessing = false;
      self.postMessage({ type: "clearedAll" });
      break;

    case "clearQueue":
      queue = [];
      pendingUpdates.clear();
      isProcessing = false;
      break;

    case "active":
      isTabActive = data;
      break;
  }
};
