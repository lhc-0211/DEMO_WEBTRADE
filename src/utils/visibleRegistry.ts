export const visibleCells = new Map<string, Map<string, HTMLElement>>();

export const registerVisibleCell = (
  symbol: string,
  key: string,
  el: HTMLElement
) => {
  if (!visibleCells.has(symbol)) visibleCells.set(symbol, new Map());
  visibleCells.get(symbol)!.set(key, el);
};

export const unregisterVisibleCell = (symbol: string, key?: string) => {
  if (!key) {
    visibleCells.delete(symbol);
  } else {
    visibleCells.get(symbol)?.delete(key);
  }
};
