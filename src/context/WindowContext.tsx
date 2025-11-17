import * as React from "react";
import { WindowContext } from "../types/windowContext";

const SESSION_KEY = "priceboard_inactive_at";

export const WindowContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [windowIsActive, setWindowIsActive] = React.useState(!document.hidden);
  const [inactiveAt, setInactiveAt] = React.useState<number | null>(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? parseInt(saved, 10) : null;
  });

  React.useEffect(() => {
    let isInactive = document.hidden;

    const markInactive = () => {
      if (isInactive) return;
      isInactive = true;

      const now = Date.now();
      setWindowIsActive(false);
      setInactiveAt(now);
      sessionStorage.setItem(SESSION_KEY, now.toString());
    };

    const markActive = () => {
      if (!isInactive) return;
      isInactive = false;

      setWindowIsActive(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        markInactive();
      } else {
        markActive();
      }
    };

    const handleBlur = () => markInactive();
    const handleFocus = () => markActive();
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) markActive(); // bfcache restore
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handlePageShow);

    // Khởi tạo đúng trạng thái ban đầu
    if (document.hidden) {
      markInactive();
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return (
    <WindowContext.Provider value={{ windowIsActive, inactiveAt }}>
      {children}
    </WindowContext.Provider>
  );
};
