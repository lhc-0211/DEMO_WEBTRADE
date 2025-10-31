const visibleCells = new Map<string, Map<string, HTMLElement>>();
let rafId: number | null = null;
let pendingColors: Record<string, Record<string, string>> = {};

// Đăng ký / huỷ đăng ký cell
export const registerVisibleCellColor = (
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

  // Nếu có màu đang chờ, apply luôn
  if (pendingColors[symbol]?.[key]) {
    el.classList.remove("u", "d", "c", "f", "r");
    el.classList.add(pendingColors[symbol][key]);
  }
};

export const unregisterVisibleCellColor = (
  symbol: string,
  key?: string
): void => {
  if (!key) {
    visibleCells.delete(symbol);
  } else {
    const keyMap = visibleCells.get(symbol);
    keyMap?.delete(key);
    if (keyMap?.size === 0) visibleCells.delete(symbol);
  }
};

// Áp dụng màu từ pendingColors
const applyColors = (): void => {
  const remaining: Record<string, Record<string, string>> = {};

  for (const [symbol, cols] of Object.entries(pendingColors)) {
    const keyMap = visibleCells.get(symbol);
    for (const [key, colorClass] of Object.entries(cols)) {
      const el = keyMap?.get(key);
      if (el) {
        el.classList.remove("u", "d", "c", "f", "r");
        if (colorClass) el.classList.add(colorClass);
      } else {
        // Nếu cell chưa có DOM, giữ lại để apply lần sau
        if (!remaining[symbol]) remaining[symbol] = {};
        remaining[symbol][key] = colorClass;
      }
    }
  }

  pendingColors = remaining;

  // Nếu còn màu chờ, requestAnimationFrame lại
  if (Object.keys(pendingColors).length > 0) {
    rafId = requestAnimationFrame(applyColors);
  } else {
    rafId = null;
  }
};

// Queue màu mới
export const queueColors = (
  colors: Record<string, Record<string, string>>
): void => {
  pendingColors = { ...pendingColors, ...colors };
  if (rafId === null) rafId = requestAnimationFrame(applyColors);
};
