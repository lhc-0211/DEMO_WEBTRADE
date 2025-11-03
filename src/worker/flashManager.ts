import type { FlashResult } from "../types";

const FLASH_MAP: Record<string, string> = {
  u: "up",
  d: "down",
  c: "ceil",
  f: "floor",
  r: "ref",
};
const visibleCells = new Map<string, Map<string, HTMLElement>>();
const pendingFlashes = new Map<string, FlashResult>();
const lastFlashTime = new Map<string, number>();
let rafId: number | null = null;

const FLASH_DURATION = 400;
const MIN_FLASH_INTERVAL = 450;

const applyFlash = (): void => {
  const now = performance.now();

  for (const [cellKey, { symbol, key, flashClass }] of pendingFlashes) {
    const lastTime = lastFlashTime.get(cellKey) || 0;
    if (now - lastTime < MIN_FLASH_INTERVAL) continue;

    const cell = visibleCells.get(symbol)?.get(key);
    if (!cell) continue;

    const flashType = flashClass ? FLASH_MAP[flashClass] : undefined;
    if (!flashType) continue;

    cell.dataset.flash = flashType;
    lastFlashTime.set(cellKey, now);

    setTimeout(() => {
      if (cell.isConnected && cell.dataset.flash === flashType) {
        delete cell.dataset.flash;
      }
    }, FLASH_DURATION);
  }

  pendingFlashes.clear();
  rafId = null;
};

export const queueFlash = (results: readonly FlashResult[]): void => {
  const now = performance.now();

  for (const r of results) {
    const cellKey = `${r.symbol}:${r.key}`;
    const lastTime = lastFlashTime.get(cellKey) || 0;
    if (now - lastTime >= MIN_FLASH_INTERVAL) {
      pendingFlashes.set(cellKey, r);
    }
  }

  if (rafId === null && pendingFlashes.size > 0) {
    rafId = requestAnimationFrame(applyFlash);
  }
};

export const registerVisibleCell = (
  symbol: string,
  key: string,
  el: HTMLElement
): void => {
  let map = visibleCells.get(symbol);
  if (!map) {
    map = new Map();
    visibleCells.set(symbol, map);
  }
  map.set(key, el);
};

export const unregisterVisibleCell = (symbol: string, key?: string): void => {
  if (!key) {
    visibleCells.delete(symbol);
    for (const k of lastFlashTime.keys()) {
      if (k.startsWith(`${symbol}:`)) lastFlashTime.delete(k);
    }
  } else {
    visibleCells.get(symbol)?.delete(key);
  }
};
