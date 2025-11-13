import type { Favorite } from "../types";

const STORAGE_KEY = "favorites";

// Đảm bảo luôn có pinned[]
const normalizeGroup = (group: Favorite): Favorite => {
  return {
    key: group.key,
    label: group.label,
    id: group.id,
    symbols: Array.isArray(group.symbols) ? group.symbols : [],
    pinned: Array.isArray(group.pinned) ? group.pinned : [],
  };
};

export const getFavorites = (): Favorite[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    // Chuẩn hóa: thêm pinned[] nếu chưa có
    const normalized = parsed.map(normalizeGroup);

    // Nếu có thay đổi -> lưu lại
    if (parsed.some((g: Favorite) => !Array.isArray(g.pinned))) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }

    return normalized;
  } catch (err) {
    console.error("Parse favorites error:", err);
    return [];
  }
};

export const saveFavorites = (groups: Favorite[]) => {
  const clean = groups.map((g) => ({
    key: g.key,
    label: g.label,
    id: g.id,
    symbols: g.symbols.filter(Boolean),
    pinned: g.pinned?.filter(Boolean) || [],
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
};

// Toggle pin: chuyển giữa pinned - symbols
export const togglePinSymbol = (symbol: string, groupId: string): boolean => {
  const groups = getFavorites();
  const group = groups.find((g) => g.id === groupId);
  if (!group) return false;

  const isPinned = group.pinned!.includes(symbol);
  const inSymbols = group.symbols.includes(symbol);

  if (isPinned) {
    // Bỏ ghim -> chuyển về symbols (nếu chưa có)
    group.pinned = group.pinned!.filter((s) => s !== symbol);
    if (!inSymbols) group.symbols.unshift(symbol);
  } else {
    // Ghim -> vào pinned, ra khỏi symbols
    if (inSymbols) {
      group.symbols = group.symbols.filter((s) => s !== symbol);
    }
    group.pinned!.unshift(symbol); // lên đầu
  }

  saveFavorites(groups);
  return !isPinned; // true = đang pinned
};

export const isSymbolPinned = (symbol: string, groupId: string): boolean => {
  const groups = getFavorites();
  const group = groups.find((g) => g.id === groupId);
  return group?.pinned?.includes(symbol) ?? false;
};

export const getPinnedSymbols = (groupId: string): string[] => {
  const groups = getFavorites();
  const group = groups.find((g) => g.id === groupId);
  return group?.pinned || [];
};

export const getNormalSymbols = (groupId: string): string[] => {
  const groups = getFavorites();
  const group = groups.find((g) => g.id === groupId);
  return group?.symbols || [];
};
