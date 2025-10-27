import { useEffect, useRef } from "react";
import { socketClient } from "../services/socket";
import { useAppSelector } from "../store/hook";
import { selectSnapshotsBySymbols } from "../store/slices/stock/selector";
import type { SnapshotData } from "../types";

const areSymbolsEqual = (prev: string[], next: string[]): boolean => {
  if (prev.length !== next.length) return false;
  return prev.every((s, i) => s === next[i]);
};

export const useWebSocket = (options: {
  symbols?: string[];
  groupId?: string;
}): Record<string, SnapshotData> => {
  const { symbols = [], groupId } = options;
  const prevSymbolsRef = useRef<string[]>([]);
  const prevGroupIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (
      !areSymbolsEqual(prevSymbolsRef.current, symbols) ||
      prevGroupIdRef.current !== groupId
    ) {
      if (symbols.length || groupId) {
        socketClient.subscribe({ symbols, groupId });
      }

      return () => {
        if (prevSymbolsRef.current.length || prevGroupIdRef.current) {
          socketClient.unsubscribe({
            symbols: prevSymbolsRef.current,
            groupId: prevGroupIdRef.current,
          });
        }
      };
    }

    prevSymbolsRef.current = symbols;
    prevGroupIdRef.current = groupId;
  }, [symbols, groupId]);

  return useAppSelector((state) => selectSnapshotsBySymbols(state, symbols));
};
