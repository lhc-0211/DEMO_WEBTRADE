import type { PriceCompare } from "../types";
import { visibleCells } from "../utils/visibleRegistry";

type ColorMap = Record<string, Record<string, PriceCompare | "t">>;

let pendingColors: Record<string, Record<string, string | undefined>> = {};
let rafId: number | null = null;

const applyColorToElement = (
  el: HTMLElement,
  colorClass: string | undefined
): void => {
  el.classList.remove("u", "d", "c", "f", "r");
  if (colorClass) el.classList.add(colorClass);
};

const applyPendingColors = (): void => {
  const remaining: typeof pendingColors = {};

  for (const [symbol, colMap] of Object.entries(pendingColors)) {
    const cellMap = visibleCells.get(symbol);

    // Nếu symbol chưa có cell nào visible → GIỮ NGUYÊN
    if (!cellMap || cellMap.size === 0) {
      remaining[symbol] = colMap;
      continue;
    }

    const symbolRemaining: Record<string, string | undefined> = {};

    for (const [key, color] of Object.entries(colMap)) {
      const el = cellMap.get(key);
      if (el) {
        applyColorToElement(el, color);
      } else {
        symbolRemaining[key] = color; // giữ lại
      }
    }

    // Chỉ lưu lại nếu còn cell chưa apply
    if (Object.keys(symbolRemaining).length > 0) {
      remaining[symbol] = symbolRemaining;
    }
    // Nếu đã apply hết → không lưu → sẽ bị xóa ở lần sau
  }

  pendingColors = remaining;

  if (Object.keys(pendingColors).length > 0) {
    rafId = requestAnimationFrame(applyPendingColors);
  } else {
    rafId = null;
  }
};

export const queueColors = (colors: ColorMap): void => {
  for (const [symbol, colMap] of Object.entries(colors)) {
    if (!pendingColors[symbol]) pendingColors[symbol] = {};
    for (const [key, cmp] of Object.entries(colMap)) {
      pendingColors[symbol][key] = cmp === "t" ? undefined : cmp;
    }
  }

  if (rafId === null) {
    rafId = requestAnimationFrame(applyPendingColors);
  }
};
