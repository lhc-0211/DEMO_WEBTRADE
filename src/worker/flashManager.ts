import type { FlashResult } from "../types";

const visibleCells = new Map<string, Map<string, HTMLElement>>();
const pendingFlashes = new Map<string, FlashResult>();
let rafId: number | null = null;

export const registerVisibleCell = (
  symbol: string,
  key: string,
  el: HTMLElement
): void => {
  let keyMap = visibleCells.get(symbol);
  if (!keyMap) {
    keyMap = new Map();
    visibleCells.set(symbol, keyMap);
  }
  keyMap.set(key, el);
};

export const unregisterVisibleCell = (symbol: string, key?: string): void => {
  if (!key) {
    visibleCells.delete(symbol);
  } else {
    const keyMap = visibleCells.get(symbol);
    keyMap?.delete(key);
    if (keyMap?.size === 0) visibleCells.delete(symbol);
  }
};

const applyFlash = (): void => {
  for (const { symbol, key, flashClass } of pendingFlashes.values()) {
    const cell = visibleCells.get(symbol)?.get(key);
    if (!cell) continue;

    cell.classList.remove(
      "flash-up",
      "flash-down",
      "flash-ceil",
      "flash-floor",
      "flash-reference"
    );
    void cell.offsetWidth;
    cell.classList.add(flashClass);

    setTimeout(() => {
      if (cell.isConnected) cell.classList.remove(flashClass);
    }, 300);
  }

  pendingFlashes.clear();
  rafId = null;
};

export const queueFlash = (results: readonly FlashResult[]): void => {
  for (const result of results) {
    const id = `${result.symbol}:${result.key}`;
    pendingFlashes.set(id, result);
  }

  if (rafId === null) {
    rafId = requestAnimationFrame(applyFlash);
  }
};
