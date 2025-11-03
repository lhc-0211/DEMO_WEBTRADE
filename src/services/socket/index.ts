import { store } from "../../store";
import {
  clearSnapshot,
  resetSnapshots,
  updateSnapshots,
} from "../../store/slices/stock/slice";
import type {
  SnapshotDataCompact,
  SubscribeOptions,
  WebSocketMessageCompact,
  WorkerInputMessage,
  WorkerOutputMessage,
} from "../../types";
import { getOrCreateSessionId } from "../../utils";
import { queueColors } from "../../worker/colorManager";
import { queueFlash } from "../../worker/flashManager";
import { apiClient } from "../apiClient";

// ==================== SINGLE WORKER ====================
const worker = new Worker(
  new URL("../../worker/priceboard.worker.ts", import.meta.url),
  {
    type: "module",
  }
);

worker.onmessage = (e: MessageEvent<WorkerOutputMessage>) => {
  const { type, data } = e.data;
  if (type !== "update") return;

  const { flashes, colors } = data;

  if (colors && Object.keys(colors).length > 0) {
    queueColors(colors);
  }

  if (flashes.length > 0) {
    queueFlash(flashes);
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
let messageHandlers: ((data: SnapshotDataCompact) => void)[] = [];
const snapshots = new Map<string, SnapshotDataCompact>();
let pendingBatch: SnapshotDataCompact[] = [];
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
      // === Compact message ===
      const msg: WebSocketMessageCompact = JSON.parse(ev.data);
      if (!msg.symbol || !msg[1]) return;

      const snapshot = snapshots.get(msg.symbol) ?? { symbol: msg.symbol };
      let shouldUpdate = false;

      switch (msg[1]) {
        case "r": // RefPrices
          snapshot.refPrices = { ...msg };
          shouldUpdate = true;
          break;
        case "t": // Trade
          snapshot.trade = { ...msg };
          shouldUpdate = true;
          break;
        case "ob": // OrderBook
          snapshot.orderBook = { ...msg };
          shouldUpdate = true;
          break;
        case "ft": // ForeignTrade
          snapshot.foreignTrade = { ...msg };
          shouldUpdate = true;
          break;
        case "fr": // ForeignRoom
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
    await apiClient.post("/priceboard/subscriptions", {
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
  await apiClient.post("/priceboard/subscriptions", {
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
    import.meta.env.VITE_WS_BASE_URL || "wss://event.dtnd.vn/events";
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

    onMessage: (handler: (data: SnapshotDataCompact) => void) => {
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
