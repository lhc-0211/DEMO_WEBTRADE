import { useContext } from "react";
import { WindowContext, type WindowContextValue } from "../types/WindowContext";

const SESSION_KEY = "priceboard_inactive_at";

export const useWindowActive = (): WindowContextValue & {
  shouldRefreshData: (thresholdMs?: number) => boolean;
} => {
  const ctx = useContext(WindowContext);
  if (!ctx) {
    throw new Error(
      "useWindowActive must be used within WindowContextProvider"
    );
  }

  const { inactiveAt } = ctx;

  const shouldRefreshData = (thresholdMs = 60_000) => {
    // Ưu tiên state, nếu null thì đọc từ sessionStorage
    const lastInactive =
      inactiveAt ?? parseInt(sessionStorage.getItem(SESSION_KEY) ?? "0", 10);
    if (!lastInactive) return false;
    const elapsed = Date.now() - lastInactive;
    return elapsed > thresholdMs;
  };

  return { ...ctx, shouldRefreshData };
};
