import axios from "axios";
import { store } from "../../store";
import {
  clearSnapshot,
  resetSnapshots,
  updateColors,
  updateSnapshots,
} from "../../store/slices/stock/slice";
import type {
  SnapshotData,
  SubscribeOptions,
  WebSocketMessage,
  WorkerInputMessage,
  WorkerOutputMessage,
} from "../../types";
import { getOrCreateSessionId } from "../../utils";
import { queueFlash } from "../../worker/flashManager";

// ==================== SINGLE WORKER ====================
const worker = new Worker(
  new URL("../../worker/priceboard.worker.ts", import.meta.url),
  {
    type: "module",
  }
);

// TYPE-SAFE: không dùng any
worker.onmessage = (e: MessageEvent<WorkerOutputMessage>) => {
  const { type, data } = e.data;
  if (type !== "update") return;

  const { flash, colors } = data;

  Object.entries(colors).forEach(([symbol, keyColors]) => {
    store.dispatch(updateColors({ symbol, colors: keyColors }));
  });

  if (flash.length > 0) {
    queueFlash(flash);
  }
};

// ==================== PUBLIC: setVisibleSymbols ====================
const setVisibleSymbols = (symbols: string[]) => {
  worker.postMessage({
    type: "visible",
    data: symbols,
  } satisfies WorkerInputMessage);
};

// ==================== PRIVATE STATE ====================
let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000;

let subscribedSymbols: string[] = [];
let messageHandlers: ((data: SnapshotData) => void)[] = [];
const snapshots = new Map<string, SnapshotData>();
let pendingBatch: SnapshotData[] = [];
let rafId: number | null = null;

// ==================== WEBSOCKET CORE ====================
const initSocket = (baseUrl: string) => {
  const url = `${baseUrl}?sessionId=${getOrCreateSessionId()}`;
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

      const snapshot = snapshots.get(msg.symbol) ?? { symbol: msg.symbol };
      let shouldUpdate = false;

      switch (msg.type) {
        case "trade":
          snapshot.trade = { ...msg };
          shouldUpdate = true;
          break;
        case "orderBook":
          snapshot.orderBook = { ...msg.data };
          shouldUpdate = true;
          break;
        case "foreignTrade":
          snapshot.foreignTrade = { ...msg };
          shouldUpdate = true;
          break;
        case "foreignRoom":
          snapshot.foreignRoom = { ...msg };
          shouldUpdate = true;
          break;
      }

      if (shouldUpdate) {
        snapshots.set(msg.symbol, snapshot);
        pendingBatch.push(snapshot);
        scheduleBatch();
        messageHandlers.forEach((h) => h(snapshot));
      }
    } catch (err) {
      console.error("Parse error:", err);
    }
  };

  socket.onclose = () => attemptReconnect(baseUrl);
};

// ==================== BATCH PROCESSING ====================
const scheduleBatch = () => {
  if (rafId !== null || pendingBatch.length === 0) return;
  rafId = requestAnimationFrame(() => {
    const batch = [...pendingBatch];
    pendingBatch = [];

    store.dispatch(updateSnapshots(batch));

    worker.postMessage({
      type: "batch",
      data: batch,
    } satisfies WorkerInputMessage);

    rafId = null;
  });
};

// ==================== RECONNECT & RESUBSCRIBE ====================
const attemptReconnect = (baseUrl: string) => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;
  reconnectTimer = setTimeout(() => {
    console.log(`Reconnect #${++reconnectAttempts}`);
    initSocket(baseUrl);
  }, RECONNECT_INTERVAL);
};

const reSubscribe = async () => {
  if (subscribedSymbols.length === 0) return;
  try {
    await axios.post("http://192.168.1.139:8083/v1/priceboard/subsciptions", {
      type: "subscribe",
      sessionId: getOrCreateSessionId(),
      symbols: subscribedSymbols,
    });
  } catch (e) {
    console.error("Re-subscribe failed:", e);
  }
};

// ==================== SUBSCRIBE API ====================
const sendSubscribeRequest = async (
  action: "subscribe" | "unsubscribe",
  options: SubscribeOptions
) => {
  await axios.post(`http://192.168.1.139:8083/v1/priceboard/subsciptions`, {
    type: action,
    sessionId: getOrCreateSessionId(),
    groupId: options.groupId,
    symbols: options.symbols,
  });
};

// ==================== CLEANUP ====================
const closeSocket = () => {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (socket) socket.close();

  socket = null;
  subscribedSymbols = [];
  snapshots.clear();
  pendingBatch = [];
  store.dispatch(resetSnapshots());

  const allSymbols = Array.from(snapshots.keys());
  worker.postMessage({
    type: "clear",
    data: allSymbols,
  } satisfies WorkerInputMessage);
};

// ==================== PUBLIC API ====================
export const socketClient = (() => {
  const baseUrl =
    import.meta.env.VITE_WS_BASE_URL || "ws://192.168.1.139:8080/events";
  initSocket(baseUrl);

  return {
    subscribe: async (options: SubscribeOptions) => {
      subscribedSymbols = Array.from(
        new Set([...subscribedSymbols, ...(options.symbols ?? [])])
      );
      await sendSubscribeRequest("subscribe", options);
    },

    unsubscribe: async (options: SubscribeOptions) => {
      const symbols = options.symbols ?? [];
      subscribedSymbols = subscribedSymbols.filter((s) => !symbols.includes(s));
      symbols.forEach((sym) => {
        snapshots.delete(sym);
        worker.postMessage({
          type: "clear",
          data: [sym],
        } satisfies WorkerInputMessage);
      });
      store.dispatch(clearSnapshot(symbols));
      await sendSubscribeRequest("unsubscribe", options);
    },

    onMessage: (handler: (data: SnapshotData) => void) => {
      messageHandlers.push(handler);
      return () => {
        messageHandlers = messageHandlers.filter((h) => h !== handler);
      };
    },

    getSnapshot: (symbol: string) => snapshots.get(symbol),
    getAllSnapshots: () => Array.from(snapshots.values()),

    close: () => closeSocket(),
    setVisibleSymbols,
  };
})();

window.priceboardWorker = worker;
