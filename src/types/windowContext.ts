import React from "react";

export interface WindowContextValue {
  windowIsActive: boolean;
  inactiveAt: number | null;
}

export const WindowContext = React.createContext<WindowContextValue | null>(
  null
);
