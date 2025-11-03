import type { PriceCompare } from "../types";

const visibleCells = new Map<string, Map<string, HTMLElement>>();
let rafId: number | null = null;
let pendingColors: Record<string, Record<string, string>> = {};

const applyColorToElement = (el: HTMLElement, colorClass: string): void => {
  el.classList.remove("u", "d", "c", "f", "r", "t");
  if (colorClass && colorClass !== "t") el.classList.add(colorClass);
};

const applyPendingColors = (): void => {
  const remaining: Record<string, Record<string, string>> = {};

  for (const [symbol, colMap] of Object.entries(pendingColors)) {
    const cellMap = visibleCells.get(symbol);
    if (!cellMap) continue;

    for (const [key, color] of Object.entries(colMap)) {
      const el = cellMap.get(key);
      if (el) {
        applyColorToElement(el, color);
      } else {
        if (!remaining[symbol]) remaining[symbol] = {};
        remaining[symbol][key] = color;
      }
    }
  }

  pendingColors = remaining;
  if (Object.keys(pendingColors).length > 0) {
    rafId = requestAnimationFrame(applyPendingColors);
  } else {
    rafId = null;
  }
};

export const queueColors = (
  colors: Record<string, Record<string, PriceCompare | "t">>
): void => {
  for (const [symbol, colMap] of Object.entries(colors)) {
    if (!pendingColors[symbol]) pendingColors[symbol] = {};
    for (const [key, cmp] of Object.entries(colMap)) {
      pendingColors[symbol][key] = cmp === "t" ? "" : cmp;
    }
  }

  if (rafId === null) rafId = requestAnimationFrame(applyPendingColors);
};

export const registerVisibleCellColor = (
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

  const color = pendingColors[symbol]?.[key];
  if (color !== undefined) applyColorToElement(el, color);
};

export const unregisterVisibleCellColor = (
  symbol: string,
  key?: string
): void => {
  if (!key) {
    visibleCells.delete(symbol);
    delete pendingColors[symbol];
  } else {
    const map = visibleCells.get(symbol);
    map?.delete(key);
    if (map?.size === 0) visibleCells.delete(symbol);
  }
};
