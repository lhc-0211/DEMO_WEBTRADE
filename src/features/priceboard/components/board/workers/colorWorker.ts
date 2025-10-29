import { KEYS_COLOR } from "../../../../../configs/headerPriceBoard";
import type { ColorDTO } from "../../../../../types";

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

// Hàng đợi để xử lý lần lượt
let queue: ColorDTO[][] = [];
let isProcessing = false;

// Giới hạn queue tối đa để tránh đầy RAM
const MAX_QUEUE_LENGTH = 100;

function processQueue() {
  if (isProcessing || queue.length === 0) return;

  isProcessing = true;
  const batch = queue.shift();
  if (!batch) {
    isProcessing = false;
    return;
  }

  try {
    const colors: Record<string, Record<string, string>> = {};

    for (const item of batch) {
      const { s, c, bc, ac } = item;
      colors[s] = {};

      for (const key of KEYS_COLOR) {
        let cmp: string | undefined;

        if (
          key === "lastPrice" ||
          key === "lastVolume" ||
          key.includes("change") ||
          key === "symbol"
        ) {
          cmp = c;
        } else if (key.startsWith("priceBuy")) {
          cmp = bc[parseInt(key[8]) - 1];
        } else if (key.startsWith("priceSell")) {
          cmp = ac[parseInt(key[9]) - 1];
        } else if (key.startsWith("volumeBuy")) {
          cmp = bc[parseInt(key[9]) - 1];
        } else if (key.startsWith("volumeSell")) {
          cmp = ac[parseInt(key[10]) - 1];
        }

        colors[s][key] = getTextColor(cmp);
      }
    }

    // Gửi kết quả về main thread
    self.postMessage({ type: "colors", data: colors });
  } catch (err) {
    console.error("[Worker] processQueue error:", err);
  } finally {
    isProcessing = false;

    // Dọn biến tạm để giảm RAM
    if (queue.length > 0) {
      setTimeout(processQueue, 0);
    }
  }
}

self.onmessage = (e: MessageEvent<{ type: "batch"; data: ColorDTO[] }>) => {
  if (e.data.type !== "batch") return;

  // Thêm batch mới vào queue
  queue.push(e.data.data);

  // Nếu queue quá dài → bỏ batch cũ nhất (đã lỗi thời)
  if (queue.length > MAX_QUEUE_LENGTH) {
    queue = queue.slice(-MAX_QUEUE_LENGTH);
  }

  processQueue();
};
