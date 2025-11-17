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
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const now = Date.now();
        setWindowIsActive(false);
        setInactiveAt(now);
        sessionStorage.setItem(SESSION_KEY, now.toString());
      } else {
        setWindowIsActive(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <WindowContext.Provider value={{ windowIsActive, inactiveAt }}>
      {children}
    </WindowContext.Provider>
  );
};
