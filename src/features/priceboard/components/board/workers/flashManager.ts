import type { FlashResult } from "../../../../../types";

const visibleCells = new Map<string, Map<string, HTMLElement>>();

export const registerVisibleCell = (
  symbol: string,
  key: string,
  el: HTMLElement
): void => {
  let keyMap = visibleCells.get(symbol);
  if (!keyMap) {
    keyMap = new Map<string, HTMLElement>();
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

let rafId: number | null = null;
const flashQueue: FlashResult[] = [];

const applyFlash = (): void => {
  for (const { symbol, key, flashClass } of flashQueue) {
    const keyMap = visibleCells.get(symbol);
    const cell = keyMap?.get(key);
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
      cell.classList.remove(flashClass);
    }, 300);
  }

  flashQueue.length = 0;
  rafId = null;
};

export const queueFlash = (results: readonly FlashResult[]): void => {
  flashQueue.push(...results);
  if (rafId === null) {
    rafId = requestAnimationFrame(applyFlash);
  }
};
