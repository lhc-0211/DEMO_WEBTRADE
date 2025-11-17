import { useContext } from "react";
import { WindowContext, type WindowContextValue } from "../types/windowContext";

const SESSION_KEY = "priceboard_inactive_at";

export const useWindowActive = (): WindowContextValue & {
  /** Kiểm tra có cần refresh dữ liệu sau khi tab inactive không */
  shouldRefreshAfterInactive: (thresholdMs?: number) => boolean;

  /** Xóa trạng thái inactive */
  clearInactiveState: () => void;
} => {
  const ctx = useContext(WindowContext);
  if (!ctx) {
    throw new Error(
      "useWindowActive must be used within WindowContextProvider"
    );
  }

  const { windowIsActive, inactiveAt } = ctx;

  const shouldRefreshAfterInactive = (thresholdMs = 60_000): boolean => {
    // Nếu đang active và chưa từng inactive → không cần
    if (windowIsActive && inactiveAt === null) return false;

    const lastInactiveTime =
      inactiveAt ?? Number(sessionStorage.getItem(SESSION_KEY) || "0");

    if (!lastInactiveTime) return false;

    return Date.now() - lastInactiveTime > thresholdMs;
  };

  const clearInactiveState = () => {
    sessionStorage.removeItem(SESSION_KEY);
  };

  return {
    ...ctx,
    shouldRefreshAfterInactive,
    clearInactiveState,
  };
};
