import type { FlashResult } from "../types";

const visibleCells = new Map<string, Map<string, HTMLElement>>();
const pendingFlashes = new Map<string, FlashResult>();
let rafId: number | null = null;

// --- Quản lý cell hiển thị ---
export const registerVisibleCell = (
  symbol: string,
  key: string,
  el: HTMLElement
): void => {
  if (!visibleCells.has(symbol)) visibleCells.set(symbol, new Map());
  visibleCells.get(symbol)!.set(key, el);
};

export const unregisterVisibleCell = (symbol: string, key?: string): void => {
  if (!key) {
    visibleCells.delete(symbol);
    return;
  }

  const keyMap = visibleCells.get(symbol);
  keyMap?.delete(key);
  if (keyMap && keyMap.size === 0) visibleCells.delete(symbol);
};

// --- Map flashClass → data-flash value ---
const FLASH_MAP: Record<string, string> = {
  u: "up",
  d: "down",
  c: "ceil",
  f: "floor",
  r: "ref",
};

// --- Áp hiệu ứng flash ---
const applyFlash = (): void => {
  const updates: (() => void)[] = [];

  for (const { symbol, key, flashClass } of pendingFlashes.values()) {
    const cell = visibleCells.get(symbol)?.get(key);
    if (!cell) continue;

    const flashType = flashClass ? FLASH_MAP[flashClass] : undefined;
    if (!flashType) continue;

    updates.push(() => {
      // Nếu đang có flash cũ, xóa trước để tránh animation chồng
      if (cell.dataset.flash) delete cell.dataset.flash;

      // Đặt flash mới
      cell.dataset.flash = flashType;

      // Xóa sau 500ms
      setTimeout(() => {
        if (cell.isConnected && cell.dataset.flash === flashType) {
          delete cell.dataset.flash;
        }
      }, 500);
    });
  }

  pendingFlashes.clear();
  rafId = null;

  requestAnimationFrame(() => {
    for (const fn of updates) fn();
  });
};

// --- Hàng đợi flash ---
export const queueFlash = (results: readonly FlashResult[]): void => {
  for (const r of results) {
    pendingFlashes.set(`${r.symbol}:${r.key}`, r);
  }

  if (rafId === null) {
    rafId = requestAnimationFrame(applyFlash);
  }
};
