import { store } from "../../store";
import { setListStockByIdFromCache } from "../../store/slices/priceboard/slice";
import {
  clearSnapshot,
  clearSnapshotAll,
  resetSnapshots,
  setDealMessage,
  updateIndex,
  updateSnapshots,
} from "../../store/slices/stock/slice";
import type {
  FullSnapshotMessage,
  SnapshotDataCompact,
  SubscribeMessage,
  SubscribeOptions,
  WebSocketMessageCompact,
  WorkerInputMessage,
  WorkerOutputMessage,
} from "../../types";
import { getOrCreateSessionId } from "../../utils";
import { queueFlash } from "../../worker/flashManager";

// ==================== WORKER ====================
const worker = new Worker(
  new URL("../../worker/priceboard.worker.ts", import.meta.url),
  { type: "module" }
);

worker.onmessage = (e: MessageEvent<WorkerOutputMessage>) => {
  if (e.data.type !== "update") return;
  if (e.data.data.flashes?.length) queueFlash(e.data.data.flashes);
};

// ==================== CONST ====================
const BASE_URL =
  import.meta.env.VITE_WS_BASE_URL || "wss://event.dtnd.vn/events";
const MAX_RECONNECT = 8;
const BASE_DELAY = 1500;

// ==================== STATE ====================
let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
const subscribedSymbols = new Set<string>();
const subscribedGroups = new Set<string>();
let messageHandlers: ((data: SnapshotDataCompact) => void)[] = [];
const snapshots = new Map<string, SnapshotDataCompact>();
let pendingBatch: SnapshotDataCompact[] = [];
let rafId: number | null = null;
let offlineQueue: {
  action: "subscribe" | "unsubscribe" | "getSymbolList";
  options: SubscribeOptions;
}[] = [];

// ==================== BATCH UPDATE ====================
const flushBatch = () => {
  if (!pendingBatch.length) return;
  const batch = pendingBatch;
  pendingBatch = [];
  store.dispatch(updateSnapshots(batch));
  worker.postMessage({
    type: "batch",
    data: batch,
  } satisfies WorkerInputMessage);
  rafId = null;
};

const scheduleBatch = () => {
  if (rafId !== null || !pendingBatch.length) return;
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(flushBatch, { timeout: 100 });
  } else {
    rafId = requestAnimationFrame(flushBatch);
  }
};

// ==================== MESSAGE PARSER ====================
const parseMessage = (raw: string): void => {
  let msg: WebSocketMessageCompact;
  try {
    msg = JSON.parse(raw);
  } catch (err) {
    console.error("JSON parse error:", err);
    return;
  }

  //Snapshot listSymbol by groupId
  if ("type" in msg && msg.type === "symbolList") {
    const { groupId, symbols } = msg;
    const cacheKey = `stocks_${groupId}`;

    localStorage.setItem(cacheKey, JSON.stringify({ groupId, symbols }));
    store.dispatch(setListStockByIdFromCache(groupId, symbols));

    if (subscribedGroups.has(groupId)) {
      const sessionId = getOrCreateSessionId();
      send({ type: "subscribe", sessionId, groupId });
    }
    return;
  }

  // INDEX: "1" === "nego"
  if ("1" in msg && msg["1"] === "nego") {
    store.dispatch(setDealMessage(msg));
    return;
  }

  // INDEX: "1" === "mi"
  if ("1" in msg && msg["1"] === "mi") {
    store.dispatch(
      updateIndex([
        {
          id: msg[35],
          value: +msg[29],
          up: +msg[30],
          down: +msg[31],
          noChange: +msg[32],
          totalVol: +msg[33],
          time: msg[10],
          change: +msg[11],
          changePct: +msg[12],
          totalAmountTraded: +msg[34],
          openIndex: +msg[36],
          indexCompare: msg[37],
          status: msg[41],
        },
      ])
    );
    return;
  }

  if ("1" in msg && msg["1"] === "snapshot") {
    const m = msg as FullSnapshotMessage;

    const { symbol } = m;
    if (!symbol) return;

    const snapshot: SnapshotDataCompact = {
      symbol,
      refPrices: m.refPrices
        ? {
            1: "r",
            4: m.refPrices["4"],
            5: m.refPrices["5"],
            6: m.refPrices["6"],
          }
        : undefined,

      orderBook: m.orderBook
        ? {
            1: "ob",
            22: m.orderBook["22"],
            23: m.orderBook["23"],
            24: m.orderBook["24"],
            25: m.orderBook["25"],
            26: m.orderBook["26"],
            28: m.orderBook["28"],
          }
        : undefined,

      trade: m.trade
        ? {
            1: "t",
            8: m.trade["8"],
            9: m.trade["9"],
            10: m.trade["10"],
            11: m.trade["11"],
            12: m.trade["12"],
            13: m.trade["13"],
          }
        : undefined,

      foreignTrade: m.foreignTrade
        ? {
            1: "ft",
            15: m.foreignTrade[15],
            17: m.foreignTrade[17],
          }
        : undefined,

      foreignRoom: m.foreignRoom
        ? { 1: "fr", 21: m.foreignRoom[21] }
        : undefined,
    };

    snapshots.set(symbol, snapshot);
    pendingBatch.push(snapshot);
    scheduleBatch();
    messageHandlers.forEach((h) => h(snapshot));

    return;
  }

  if (!("symbol" in msg) || !msg.symbol || !msg[1]) return;

  const symbol = msg.symbol;
  const existing = snapshots.get(symbol);
  const snapshot: SnapshotDataCompact =
    existing ?? ({ symbol } as SnapshotDataCompact);
  let changed = false;

  switch (msg[1]) {
    case "r":
      snapshot.refPrices = { 1: "r", 4: msg[4], 5: msg[5], 6: msg[6] };
      changed = true;
      break;
    case "t":
      snapshot.trade = {
        1: "t",
        8: msg[8],
        9: msg[9],
        10: msg["10"],
        11: msg[11],
        12: msg[12],
        13: msg[13],
      };
      changed = true;
      break;
    case "ob":
      snapshot.orderBook = {
        1: "ob",
        22: msg[22],
        23: msg[23],
        24: msg[24],
        25: msg[25],
        26: msg[26],
        28: msg[28],
      };
      changed = true;
      break;
    case "ft":
      snapshot.foreignTrade = { 1: "ft", 15: msg[15], 17: msg[17] };
      changed = true;
      break;
    case "fr":
      snapshot.foreignRoom = { 1: "fr", 21: msg[21] };
      changed = true;
      break;
  }

  if (changed) {
    snapshots.set(symbol, snapshot);
    pendingBatch.push(snapshot);
    scheduleBatch();
    messageHandlers.forEach((h) => h(snapshot));
  }
};
// ==================== SOCKET LIFECYCLE ====================
const connect = () => {
  closeSocket();
  const url = `${BASE_URL}?sessionId=${getOrCreateSessionId()}`;
  socket = new WebSocket(url);

  socket.onopen = () => {
    reconnectAttempts = 0;
    processOfflineQueue();
    reSubscribe();
  };

  socket.onmessage = (e) => parseMessage(e.data);
  socket.onclose = socket.onerror = () => attemptReconnect();
};

const attemptReconnect = () => {
  if (reconnectAttempts >= MAX_RECONNECT) {
    console.error("Max reconnect attempts reached");
    return;
  }
  const delay = BASE_DELAY * Math.pow(1.5, reconnectAttempts++);
  reconnectTimer = setTimeout(connect, delay);
};

const closeSocket = () => {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (socket) socket.close();
  socket = null;
  reconnectAttempts = 0;
};

// ==================== SUBSCRIPTION ====================
const send = (msg: SubscribeMessage): boolean => {
  if (socket?.readyState === WebSocket.OPEN) {
    try {
      socket.send(JSON.stringify(msg));
      return true;
    } catch (err) {
      console.error("WebSocket send error:", err);
    }
  }
  return false;
};
const processOfflineQueue = () => {
  while (offlineQueue.length) {
    const job = offlineQueue.shift()!;
    if (job.action === "getSymbolList") {
      socketClient.getSymbolList(job.options);
    } else {
      sendSubscribeRequest(job.action, job.options);
    }
  }
};

const reSubscribe = () => {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  const sessionId = getOrCreateSessionId();

  // Resub symbols
  if (subscribedSymbols.size) {
    send({ type: "subscribe", sessionId, symbols: [...subscribedSymbols] });
  }

  // Resub groups + getSymbolList nếu chưa có cache
  subscribedGroups.forEach((groupId) => {
    send({ type: "subscribe", sessionId, groupId });

    const cacheKey = `stocks_${groupId}`;
    if (!localStorage.getItem(cacheKey)) {
      socketClient.getSymbolList({ groupId });
    }
  });
};

const sendSubscribeRequest = (
  action: "subscribe" | "unsubscribe",
  options: SubscribeOptions
) => {
  const sessionId = getOrCreateSessionId();
  const msg: SubscribeMessage = {
    type: action,
    sessionId,
    ...(options.groupId ? { groupId: options.groupId } : {}),
    ...(options.symbols && options.symbols.length > 0
      ? { symbols: options.symbols }
      : {}),
  };

  if (!send(msg)) {
    offlineQueue.push({ action, options });
    return;
  }

  if (action === "subscribe") {
    if (options.groupId) subscribedGroups.add(options.groupId);
    options.symbols?.forEach((sym) => subscribedSymbols.add(sym));
  } else {
    // unsubscribe
    if (options.groupId) subscribedGroups.delete(options.groupId);

    if (options.symbols?.length) {
      const symbolsToRemove = options.symbols;

      symbolsToRemove.forEach((sym) => {
        subscribedSymbols.delete(sym);
        snapshots.delete(sym);
        worker.postMessage({
          type: "clear",
          data: [sym],
        } satisfies WorkerInputMessage);
      });

      store.dispatch(clearSnapshot(symbolsToRemove));
    }
  }
};

// ==================== PUBLIC API ====================
export const socketClient = {
  subscribe: (options: SubscribeOptions) => {
    if (options.groupId) subscribedGroups.add(options.groupId);
    if (options.symbols?.length) {
      options.symbols.forEach((s) => subscribedSymbols.add(s));
    }
    sendSubscribeRequest("subscribe", options);
  },

  unsubscribe: (options: SubscribeOptions) => {
    if (options.groupId) {
      subscribedGroups.delete(options.groupId);

      //Lấy danh sách symbol của group từ localStorage
      const cacheKey = `stocks_${options.groupId}`;
      const cached = localStorage.getItem(cacheKey);
      let groupSymbols: string[] = [];

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          groupSymbols = parsed.symbols ?? [];
        } catch {
          console.warn("Invalid cache for", options.groupId);
        }
      }

      // Nếu có list symbol -> clear snapshot
      if (groupSymbols.length > 0) {
        groupSymbols.forEach((sym) => {
          subscribedSymbols.delete(sym);
          snapshots.delete(sym);
          worker.postMessage({
            type: "clear",
            data: [sym],
          } satisfies WorkerInputMessage);
        });

        store.dispatch(clearSnapshot(groupSymbols));
      }
    }

    if (options.symbols?.length) {
      options.symbols.forEach((s) => {
        subscribedSymbols.delete(s);
        snapshots.delete(s);
        worker.postMessage({
          type: "clear",
          data: [s],
        } satisfies WorkerInputMessage);
      });
      store.dispatch(clearSnapshot(options.symbols));
    }
    sendSubscribeRequest("unsubscribe", options);
  },

  unsubscribeAll: () => {
    const sessionId = getOrCreateSessionId();

    if (socket?.readyState === WebSocket.OPEN) {
      try {
        socket.send(
          JSON.stringify({
            type: "unsubscribe",
            sessionId,
          } satisfies SubscribeMessage)
        );
      } catch (err) {
        console.error("Failed to send unsubscribeAll:", err);
      }
    }

    // Xóa subscription sets
    subscribedSymbols.clear();
    subscribedGroups.clear();
    snapshots.clear();
    store.dispatch(clearSnapshotAll());
    worker.postMessage({
      type: "clearAll",
    } satisfies WorkerInputMessage);

    // Reset batch và các hàng đợi
    pendingBatch = [];
    if (rafId !== null) {
      if (
        typeof cancelIdleCallback === "function" &&
        typeof requestIdleCallback === "function"
      ) {
        cancelIdleCallback(rafId);
      } else {
        cancelAnimationFrame(rafId);
      }
      rafId = null;
    }

    // Xóa offline queue (nếu có)
    offlineQueue = offlineQueue.filter((job) => job.action !== "subscribe");
  },

  requestNego: (marketId: string) => {
    const sessionId = getOrCreateSessionId();
    send({
      type: "request_nego",
      sessionId: sessionId,
      marketId,
    });
  },

  onMessage: (handler: (data: SnapshotDataCompact) => void) => {
    messageHandlers.push(handler);
    return () => {
      messageHandlers = messageHandlers.filter((h) => h !== handler);
    };
  },

  getSymbolList: (options: SubscribeOptions) => {
    if (!options.groupId) return;

    const cacheKey = `stocks_${options.groupId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { symbols } = JSON.parse(cached);
        if (Array.isArray(symbols) && symbols.length > 0) {
          store.dispatch(setListStockByIdFromCache(options.groupId, symbols));
        }
      } catch {
        console.warn("Invalid cache for", options.groupId);
      }
      return;
    }

    const sessionId = getOrCreateSessionId();
    const msg = { type: "getSymbolList", sessionId, groupId: options.groupId };
    if (!send(msg as SubscribeMessage)) {
      offlineQueue.push({ action: "getSymbolList", options });
    }
  },

  setVisibleSymbols: (symbols: string[]) => {
    worker.postMessage({
      type: "visible",
      data: symbols,
    } satisfies WorkerInputMessage);
  },

  clearFlash: () => {
    worker.postMessage({
      type: "clearAll",
    } satisfies WorkerInputMessage);
  },

  clearQueue: () => {
    worker.postMessage({
      type: "clearQueue",
    } satisfies WorkerInputMessage);
  },

  setTabActive: (isActive: boolean) => {
    worker.postMessage({
      type: "active",
      data: isActive,
    } satisfies WorkerInputMessage);
  },

  close: () => {
    offlineQueue = [];
    subscribedSymbols.clear();
    subscribedGroups.clear();
    snapshots.clear();
    pendingBatch = [];
    store.dispatch(resetSnapshots());
    worker.postMessage({
      type: "clear",
      data: [...snapshots.keys()],
    } satisfies WorkerInputMessage);
    closeSocket();
  },
};

export { subscribedGroups };

connect();
