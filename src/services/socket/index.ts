import axios from "axios";
import { store } from "../../store";
import {
  clearSnapshot,
  resetSnapshots,
  updateSnapshots,
} from "../../store/slices/stock/slice";
import type {
  ForeignRoomMessage,
  ForeignTradeMessage,
  OrderBookMessage,
  SnapshotData,
  TradeMessage,
  WebSocketMessage,
} from "../../types";
import type { SocketClient, SubscribeOptions } from "../../types/socketClient";
import { getOrCreateSessionId } from "../../utils";

type MessageHandler = (data: SnapshotData) => void;

/* --------------------------------------------------------------
   PRIVATE STATE
   -------------------------------------------------------------- */
let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000;

let subscribedSymbols: string[] = [];
let messageHandlers: MessageHandler[] = [];
const snapshots: Map<string, SnapshotData> = new Map();
const pendingMap = new Map<string, SnapshotData>();
let rafPending = false;

let visibleSymbols = new Set<string>();
const prevSnapshots: Map<string, SnapshotData> = new Map();

/* --------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------- */
const buildUrl = (base: string): string => {
  const sid = getOrCreateSessionId();
  return sid ? `${base}?sessionId=${sid}` : "";
};

const hasChanged = (a: SnapshotData, b: SnapshotData): boolean => {
  if (a.trade?.price !== b.trade?.price) return true;
  if (a.trade?.volume !== b.trade?.volume) return true;
  if (a.trade?.changePct !== b.trade?.changePct) return true;

  const compareLevel = (i: number) => {
    const aBid = a.orderBook?.bids?.[i],
      bBid = b.orderBook?.bids?.[i];
    const aAsk = a.orderBook?.asks?.[i],
      bAsk = b.orderBook?.asks?.[i];
    return aBid?.price !== bBid?.price || aAsk?.price !== bAsk?.price;
  };

  for (let i = 0; i < 3; i++) if (compareLevel(i)) return true;
  return false;
};

const processBatch = () => {
  if (pendingMap.size === 0) {
    rafPending = false;
    return;
  }

  const batchUpdates = Array.from(pendingMap.values());
  pendingMap.clear();

  const changedUpdates = batchUpdates.filter((curr) => {
    const prev = prevSnapshots.get(curr.symbol);
    return !prev || hasChanged(curr, prev);
  });

  if (changedUpdates.length > 0) {
    store.dispatch(updateSnapshots(changedUpdates));

    const visibleUpdates = changedUpdates.filter((s) =>
      visibleSymbols.has(s.symbol)
    );
    if (visibleUpdates.length > 0) {
      // Gửi cho colorWorker
      window.colorWorker?.postMessage({
        type: "batch",
        data: visibleUpdates,
      });

      // Gửi cho flashWorker
      const batchWithPrev = visibleUpdates.map((s) => ({
        snapshot: s,
        prevSnapshot: prevSnapshots.get(s.symbol) || null,
      }));
      window.flashWorker?.postMessage({
        type: "batch",
        data: batchWithPrev,
      });
    }

    // Cập nhật prevSnapshots
    changedUpdates.forEach((s) => {
      prevSnapshots.set(s.symbol, {
        symbol: s.symbol,
        trade: s.trade ? { ...s.trade } : undefined,
        foreignTrade: s.foreignTrade ? { ...s.foreignTrade } : undefined,
        foreignRoom: s.foreignRoom ? { ...s.foreignRoom } : undefined,
        orderBook: s.orderBook
          ? {
              bids: s.orderBook.bids.slice(0, 3),
              asks: s.orderBook.asks.slice(0, 3),
              recv_ts: s.orderBook.recv_ts,
            }
          : undefined,
      });
    });
  }

  rafPending = false;
};

const scheduleBatchUpdate = () => {
  if (rafPending || pendingMap.size === 0) return;
  rafPending = true;
  requestAnimationFrame(processBatch);
};

const closeSocket = () => {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (socket) socket.close();
  socket = null;
  subscribedSymbols = [];
  snapshots.clear();
  prevSnapshots.clear();
  pendingMap.clear();
  store.dispatch(resetSnapshots());
};

/* --------------------------------------------------------------
   CORE – WebSocket
   -------------------------------------------------------------- */
const initSocket = (baseUrl: string) => {
  const url = buildUrl(baseUrl);
  if (!url) return;

  closeSocket();
  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log("WS Connected");
    reconnectAttempts = 0;
    reSubscribe();
  };

  socket.onmessage = (ev) => {
    try {
      const msg: WebSocketMessage = JSON.parse(ev.data);
      if (!msg.symbol || !msg.type) return;

      const { symbol, type } = msg;
      const snapshot = snapshots.get(symbol) ?? { symbol };

      let shouldBatch = false;

      switch (type) {
        case "trade": {
          const m = msg as TradeMessage;
          snapshot.trade = {
            price: m.price,
            volume: m.volume,
            boardId: m.boardId,
            marketId: m.marketId,
            changePct: m.changePct,
            changeAbs: m.changeAbs,
            priceCompare: m.priceCompare,
            recv_ts: m.recv_ts,
          };
          shouldBatch = true;
          break;
        }
        case "orderBook": {
          const m = msg as OrderBookMessage;
          snapshot.orderBook = {
            bids: m.data.bids,
            asks: m.data.asks,
            recv_ts: m.recv_ts,
          };
          shouldBatch = true;
          break;
        }
        case "foreignTrade": {
          const m = msg as ForeignTradeMessage;
          snapshot.foreignTrade = {
            foreignBuyVolume: m.foreignBuyVolume,
            foreignSellVolume: m.foreignSellVolume,
            foreignBuyAmount: m.foreignBuyAmount,
            foreignSellAmount: m.foreignSellAmount,
            foreignNetValue: m.foreignNetValue,
            boardId: m.boardId,
            marketId: m.marketId,
            recv_ts: m.recv_ts,
          };
          shouldBatch = true;
          break;
        }
        case "foreignRoom": {
          const m = msg as ForeignRoomMessage;
          snapshot.foreignRoom = {
            currentRoom: m.currentRoom,
            totalRoom: m.totalRoom,
            marketId: m.marketId,
            recv_ts: m.recv_ts,
          };
          shouldBatch = true;
          break;
        }
      }

      if (shouldBatch) {
        snapshots.set(symbol, snapshot);
        pendingMap.set(symbol, snapshot);
        scheduleBatchUpdate();
        messageHandlers.forEach((h) => h(snapshot));
      }
    } catch (err) {
      console.error("Parse error:", err);
    }
  };

  socket.onclose = () => attemptReconnect(baseUrl);
  socket.onerror = () => console.error("WS error");
};

/* --------------------------------------------------------------
   RECONNECT & RESUBSCRIBE
   -------------------------------------------------------------- */
const attemptReconnect = (baseUrl: string) => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;
  reconnectTimer = setTimeout(() => {
    console.log(`Reconnect #${++reconnectAttempts}`);
    initSocket(baseUrl);
  }, RECONNECT_INTERVAL);
};

const reSubscribe = async () => {
  if (!subscribedSymbols.length) return;
  try {
    await axios.post("http://192.168.1.139:8083/v1/priceboard/subscribe", {
      type: "subscribe",
      sessionId: getOrCreateSessionId(),
      symbols: subscribedSymbols,
    });
  } catch (e) {
    console.error("Re-subscribe failed:", e);
  }
};

/* --------------------------------------------------------------
   SUBSCRIBE / UNSUBSCRIBE
   -------------------------------------------------------------- */
const sendSubscribeRequest = async (
  type: "subscribe" | "unsubscribe",
  options: SubscribeOptions
) => {
  try {
    await axios.post(`http://192.168.1.139:8083/v1/priceboard/${type}`, {
      type,
      sessionId: getOrCreateSessionId(),
      groupId: options.groupId,
      symbols: options.symbols,
    });
  } catch (e) {
    console.error(`Failed to ${type}:`, e);
    throw e;
  }
};

/* --------------------------------------------------------------
   PUBLIC API – TYPE-SAFE
   -------------------------------------------------------------- */
export const socketClient: SocketClient = (() => {
  const baseUrl =
    import.meta.env.VITE_WS_BASE_URL || "ws://192.168.1.139:8080/events";
  initSocket(baseUrl);

  return {
    subscribe: async (options: SubscribeOptions) => {
      if (options.symbols) {
        subscribedSymbols = Array.from(
          new Set([...subscribedSymbols, ...options.symbols])
        );
      }
      await sendSubscribeRequest("subscribe", options);
    },
    unsubscribe: async (options: SubscribeOptions) => {
      if (options.symbols) {
        subscribedSymbols = subscribedSymbols.filter(
          (s) => !options.symbols!.includes(s)
        );
        options.symbols.forEach((sym) => {
          snapshots.delete(sym);
          prevSnapshots.delete(sym);
          pendingMap.delete(sym);
        });
        store.dispatch(clearSnapshot(options.symbols));
      }
      await sendSubscribeRequest("unsubscribe", options);
    },
    onMessage: (handler: MessageHandler) => {
      messageHandlers.push(handler);
      return () => {
        messageHandlers = messageHandlers.filter((h) => h !== handler);
      };
    },
    getSnapshot: (symbol: string) => snapshots.get(symbol),
    getAllSnapshots: () => Array.from(snapshots.values()),
    close: () => closeSocket(),
    setVisibleSymbols: (symbols: string[]) => {
      visibleSymbols = new Set(symbols);
    },
  };
})();

window.socketClient = socketClient;
