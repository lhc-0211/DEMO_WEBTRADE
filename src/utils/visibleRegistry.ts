export const visibleCells = new Map<string, Map<string, HTMLElement>>();

export const registerCell = (
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

export const unregisterCell = (symbol: string, key?: string): void => {
  if (!key) {
    visibleCells.delete(symbol);
  } else {
    const map = visibleCells.get(symbol);
    map?.delete(key);
    if (map && map.size === 0) visibleCells.delete(symbol);
  }
};
