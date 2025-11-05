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
let subscribedGroups: string[] = [];

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
      const msg = JSON.parse(ev.data) as WebSocketMessageCompact;
      if (!msg.symbol || !msg[1]) return;

      const symbol = msg.symbol;
      const snapshot = snapshots.get(symbol) ?? { symbol };
      let shouldUpdate = false;

      switch (msg[1]) {
        case "r":
          snapshot.refPrices = {
            1: "r",
            4: msg["4"],
            5: msg["5"],
            6: msg["6"],
          };
          shouldUpdate = true;
          break;

        case "t":
          snapshot.trade = {
            1: "t",
            8: msg["8"],
            9: msg["9"],
            11: msg["11"],
            12: msg["12"],
            13: msg["13"],
          };
          shouldUpdate = true;
          break;

        case "ob":
          snapshot.orderBook = {
            1: "ob",
            22: msg["22"],
            23: msg["23"],
            24: msg["24"],
            25: msg["25"],
            26: msg["26"],
            28: msg["28"],
          };
          shouldUpdate = true;
          break;

        case "ft":
          snapshot.foreignTrade = {
            1: "ft",
            15: msg["15"],
            17: msg["17"],
          };
          shouldUpdate = true;
          break;

        case "fr":
          snapshot.foreignRoom = {
            1: "fr",
            21: msg["21"],
          };
          shouldUpdate = true;
          break;
      }

      if (shouldUpdate) {
        snapshots.set(symbol, snapshot);
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

// const reSubscribe = async () => {
//   if (subscribedSymbols.length === 0) return;
//   try {
//     await apiClient.post("/priceboard/subscriptions", {
//       type: "subscribe",
//       sessionId: getOrCreateSessionId(),
//       symbols: subscribedSymbols,
//     });
//   } catch (e) {
//     console.error("Re-subscribe failed:", e);
//   }
// };

const reSubscribe = () => {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;

  const sessionId = getOrCreateSessionId();

  // Re-sub theo symbols
  if (subscribedSymbols.length) {
    const msg = {
      type: "subscriptions",
      data: {
        action: "subscribe",
        sessionId,
        symbols: subscribedSymbols,
      },
    };
    try {
      socket.send(JSON.stringify(msg));
      console.log("Re-subscribed symbols:", subscribedSymbols);
    } catch (error) {
      console.error("Re-subscribe symbols failed:", error);
    }
  }

  // Re-sub theo group
  for (const groupId of subscribedGroups) {
    const msg = {
      type: "subscriptions",
      data: {
        action: "subscribe",
        sessionId,
        groupId,
      },
    };
    try {
      socket.send(JSON.stringify(msg));
      console.log("Re-subscribed group:", groupId);
    } catch (error) {
      console.error("Re-subscribe group failed:", error);
    }
  }
};

// ==================== SUBSCRIBE API ====================
// const sendSubscribeRequest = async (
//   action: "subscribe" | "unsubscribe",
//   options: SubscribeOptions
// ) => {
//   await apiClient.post("/priceboard/subscriptions", {
//     type: action,
//     sessionId: getOrCreateSessionId(),
//     groupId: options.groupId,
//     symbols: options.symbols,
//   });
// };

// ==================== SUB/UNSUB ====================
const sendSubscribeRequest = (
  action: "subscribe" | "unsubscribe",
  options: SubscribeOptions
) => {
  console.log("action", action, "options", options);

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("Socket not ready, skip", action, options);
    return;
  }

  if (!options.groupId && (!options.symbols || options.symbols.length === 0)) {
    console.warn("No groupId or symbols to subscribe/unsubscribe");
    return;
  }

  const msg = {
    type: "subscriptions",
    data: {
      action,
      sessionId: getOrCreateSessionId(),
      groupId: options.groupId,
      symbols: options.symbols,
    },
  };

  try {
    socket.send(JSON.stringify(msg));
    console.log(`Socket ${action} sent`, msg);
  } catch (error) {
    console.error(`Socket ${action} send failed:`, error);
  }
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
    // subscribe: async (options: SubscribeOptions) => {
    //   subscribedSymbols = Array.from(
    //     new Set([...subscribedSymbols, ...(options.symbols ?? [])])
    //   );
    //   await sendSubscribeRequest("subscribe", options);
    // },

    subscribe: async (options: SubscribeOptions) => {
      const { groupId, symbols } = options;

      if (groupId) {
        if (!subscribedGroups.includes(groupId)) {
          subscribedGroups.push(groupId);
        }
      }

      if (symbols?.length) {
        subscribedSymbols = Array.from(
          new Set([...subscribedSymbols, ...symbols])
        );
      }

      await sendSubscribeRequest("subscribe", options);
    },

    unsubscribe: async (options: SubscribeOptions) => {
      const { groupId, symbols } = options;

      if (groupId) {
        subscribedGroups = subscribedGroups.filter((g) => g !== groupId);
      }

      if (symbols?.length) {
        subscribedSymbols = subscribedSymbols.filter(
          (s) => !symbols.includes(s)
        );
        symbols.forEach((sym) => {
          snapshots.delete(sym);
          worker.postMessage({
            type: "clear",
            data: [sym],
          } satisfies WorkerInputMessage);
        });
        store.dispatch(clearSnapshot(symbols));
      }

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
