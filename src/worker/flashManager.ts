// src/queues/flashQueue.ts
import type { FlashResult, PriceCompare } from "../types";
import {
  registerCell,
  unregisterCell,
  visibleCells,
} from "../utils/visibleRegistry";

const FLASH_MAP: Record<PriceCompare, string> = {
  u: "up",
  d: "down",
  c: "ceil",
  f: "floor",
  r: "ref",
  x: "",
};

const pendingFlashes = new Map<string, FlashResult>();
const lastFlashTime = new Map<string, number>();
const timeoutIds = new Map<string, number>();
let rafId: number | null = null;

const FLASH_DURATION = 200;
const MIN_FLASH_INTERVAL = 450;
const KEY_SEPARATOR = ""; // NULL char - không bao giờ xuất hiện trong key

const getCellKey = (symbol: string, key: string): string =>
  `${symbol}${KEY_SEPARATOR}${key}`;

const applyFlashes = (): void => {
  const now = performance.now();

  for (const [cellKey, { symbol, key, flashClass }] of pendingFlashes) {
    const lastTime = lastFlashTime.get(cellKey) ?? 0;
    if (now - lastTime < MIN_FLASH_INTERVAL) continue;

    const cell = visibleCells.get(symbol)?.get(key);
    if (!cell) continue;

    const flashType = FLASH_MAP[flashClass];
    if (!flashType) continue;

    // Xóa timeout cũ
    const oldTid = timeoutIds.get(cellKey);
    if (oldTid) clearTimeout(oldTid);

    cell.dataset.flash = flashType;
    lastFlashTime.set(cellKey, now);

    const tid = setTimeout(() => {
      if (cell.isConnected && cell.dataset.flash === flashType) {
        delete cell.dataset.flash;
      }
      timeoutIds.delete(cellKey);
    }, FLASH_DURATION) as unknown as number;

    timeoutIds.set(cellKey, tid);
  }

  pendingFlashes.clear();
  rafId = null;
};

export const queueFlash = (results: readonly FlashResult[]): void => {
  const now = performance.now();

  for (const r of results) {
    const cellKey = getCellKey(r.symbol, r.key);
    const lastTime = lastFlashTime.get(cellKey) ?? 0;
    if (now - lastTime >= MIN_FLASH_INTERVAL) {
      pendingFlashes.set(cellKey, r);
    }
  }

  if (rafId === null && pendingFlashes.size > 0) {
    rafId = requestAnimationFrame(applyFlashes);
  }
};

export {
  registerCell as registerVisibleCell,
  unregisterCell as unregisterVisibleCell,
};
