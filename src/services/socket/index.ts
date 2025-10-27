// src/lib/socketClient.ts
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
} from "../../types";
import { getOrCreateSessionId } from "../../utils";
import { apiClient } from "../apiClient";

// Union type cho tất cả message
type WebSocketMessage =
  | OrderBookMessage
  | TradeMessage
  | ForeignTradeMessage
  | ForeignRoomMessage;

type MessageHandler = (data: SnapshotData) => void;
type SubscribeOptions = { groupId?: string; symbols?: string[] };

/* --------------------------------------------------------------
   PRIVATE STATE (closure)
   -------------------------------------------------------------- */
let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000;

let subscribedSymbols: string[] = [];
let messageHandlers: MessageHandler[] = [];
const snapshots: Map<string, SnapshotData> = new Map();
let batchUpdates: SnapshotData[] = [];
let batchTimeout: ReturnType<typeof setTimeout> | null = null;
const BATCH_INTERVAL = 100; // ms

/* --------------------------------------------------------------
HELPERS
-------------------------------------------------------------- */
const buildUrl = (base: string): string => {
  const sid = getOrCreateSessionId();
  if (!sid) {
    console.warn("No sessionId - WebSocket will not connect.");
    return "";
  }
  return `${base}?sessionId=${sid}`;
};

const scheduleBatchUpdate = () => {
  if (batchTimeout) return;
  batchTimeout = setTimeout(() => {
    if (batchUpdates.length) {
      store.dispatch(updateSnapshots(batchUpdates));
      batchUpdates = [];
    }
    batchTimeout = null;
  }, BATCH_INTERVAL);
};

const closeSocket = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (batchTimeout) {
    clearTimeout(batchTimeout);
    batchTimeout = null;
  }
  if (socket) {
    try {
      socket.close();
    } catch (e) {
      console.error("Error closing socket:", e);
    }
    socket = null;
  }
  subscribedSymbols = [];
  snapshots.clear();
  batchUpdates = [];
  store.dispatch(resetSnapshots());
};

/* --------------------------------------------------------------
CORE – tạo / khởi động lại socket
-------------------------------------------------------------- */
const initSocket = (baseUrl: string) => {
  const url = buildUrl(baseUrl);
  if (!url) return;

  closeSocket(); // đảm bảo không có socket cũ

  try {
    socket = new WebSocket(url);

    socket.onopen = () => {
      console.log("WebSocket connected:", url);
      reconnectAttempts = 0;
      reSubscribe();
    };

    socket.onmessage = (ev) => {
      try {
        const msg: WebSocketMessage = JSON.parse(ev.data);
        if (!msg.symbol || !msg.type) {
          console.warn("Invalid message - missing symbol/type", msg);
          return;
        }

        const { symbol, type, recv_ts } = msg;
        const snapshot = snapshots.get(symbol) ?? { symbol };

        switch (type) {
          case "orderBook":
            snapshot.orderBook = { ...msg.data, recv_ts };
            break;
          case "trade": {
            const { price, volume, boardId, marketId, recv_ts } = msg;
            snapshot.trade = { price, volume, boardId, marketId, recv_ts };
            break;
          }
          case "foreignTrade": {
            const {
              foreignBuyVolume,
              foreignSellVolume,
              foreignBuyAmount,
              foreignSellAmount,
              foreignNetValue,
              boardId,
              marketId,
              recv_ts,
            } = msg;
            snapshot.foreignTrade = {
              foreignBuyVolume,
              foreignSellVolume,
              foreignBuyAmount,
              foreignSellAmount,
              foreignNetValue,
              boardId,
              marketId,
              recv_ts,
            };
            break;
          }
          case "foreignRoom": {
            const { currentRoom, totalRoom, marketId, recv_ts } = msg;
            snapshot.foreignRoom = {
              currentRoom,
              totalRoom,
              marketId,
              recv_ts,
            };
            break;
          }
          default:
            console.warn("Unknown type:", type);
            return;
        }

        snapshots.set(symbol, snapshot);
        batchUpdates.push(snapshot);
        scheduleBatchUpdate();
        messageHandlers.forEach((h) => h(snapshot));
      } catch (err) {
        console.error("Parse error:", ev.data, err);
      }
    };

    socket.onclose = (ev) => {
      console.warn("WebSocket closed:", ev.code, ev.reason);
      attemptReconnect(baseUrl);
    };

    socket.onerror = (ev) => console.error("WebSocket error:", ev);
  } catch (err) {
    console.error("Failed to create WebSocket:", err);
  }
};

/* --------------------------------------------------------------
RECONNECT
-------------------------------------------------------------- */
const attemptReconnect = (baseUrl: string) => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error("Max reconnect attempts reached.");
    return;
  }

  reconnectTimer = setTimeout(() => {
    console.log(
      `Reconnecting... (${++reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
    );
    initSocket(baseUrl);
  }, RECONNECT_INTERVAL);
};

/* --------------------------------------------------------------
RE-SUBSCRIBE (khi reconnect)
-------------------------------------------------------------- */
const reSubscribe = async () => {
  if (!subscribedSymbols.length) return;
  try {
    // await apiClient.post("/v1/priceboard/subscribe", {
    await axios.post("http://192.168.1.139:8083/v1/priceboard/subscribe", {
      type: "subscribe",
      sessionId: getOrCreateSessionId(),
      symbols: subscribedSymbols,
    });
    console.log("Re-subscribed:", subscribedSymbols);
  } catch (e) {
    console.error("Re-subscribe failed:", e);
  }
};

/* --------------------------------------------------------------
SUBSCRIBE / UNSUBSCRIBE (gửi qua HTTP API)
-------------------------------------------------------------- */
const sendSubscribeRequest = async (
  type: "subscribe" | "unsubscribe",
  options: SubscribeOptions
) => {
  try {
    // await apiClient.post("/v1/priceboard/subscribe", {
    await axios.post(`http://192.168.1.139:8083/v1/priceboard/${type}`, {
      type,
      sessionId: getOrCreateSessionId(),
      groupId: options.groupId,
      symbols: options.symbols,
    });
    console.log(`${type} sent:`, options);
  } catch (e) {
    console.error(`Failed to send ${type}:`, e);
    throw e;
  }
};

/* --------------------------------------------------------------
PUBLIC API
-------------------------------------------------------------- */
export const socketClient = (() => {
  const baseUrl =
    import.meta.env.VITE_WS_BASE_URL || "ws://192.168.1.139:8080/events";

  initSocket(baseUrl);

  return {
    subscribe: async (options: SubscribeOptions): Promise<void> => {
      if (options.symbols) {
        subscribedSymbols = Array.from(
          new Set([...subscribedSymbols, ...options.symbols])
        );
      }
      await sendSubscribeRequest("subscribe", options);
    },

    unsubscribe: async (options: SubscribeOptions): Promise<void> => {
      if (options.symbols) {
        subscribedSymbols = subscribedSymbols.filter(
          (s) => !options.symbols!.includes(s)
        );
        options.symbols.forEach((sym) => snapshots.delete(sym));
        store.dispatch(clearSnapshot(options.symbols));
      }
      await sendSubscribeRequest("unsubscribe", options);
    },

    onMessage: (handler: MessageHandler): (() => void) => {
      messageHandlers.push(handler);
      return () => {
        messageHandlers = messageHandlers.filter((h) => h !== handler);
      };
    },

    getSnapshot: (symbol: string): SnapshotData | undefined =>
      snapshots.get(symbol),

    getAllSnapshots: (): SnapshotData[] => Array.from(snapshots.values()),

    close: () => {
      closeSocket();
    },
  };
})();

declare global {
  interface Window {
    socketClient: typeof socketClient;
    apiClient: typeof apiClient;
  }
}

window.socketClient = socketClient;
window.apiClient = apiClient;
