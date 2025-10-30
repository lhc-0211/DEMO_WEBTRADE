// src/worker/initPriceboardWorker.ts
import { store } from "../store";
import { updateColors } from "../store/slices/stock/slice";
import type { WorkerInputMessage, WorkerOutputMessage } from "../types";
import { queueFlash } from "./flashManager";

let worker: Worker | null = null;

export const initPriceboardWorker = (): Worker => {
  if (worker) return worker;

  worker = new Worker(new URL("./priceboard.worker.ts", import.meta.url), {
    type: "module",
  });

  worker.onmessage = (e: MessageEvent<WorkerOutputMessage>) => {
    const { type, data } = e.data;
    if (type !== "update") return;

    const { flash, colors } = data;

    // CẬP NHẬT MÀU
    Object.entries(colors).forEach(([symbol, keyColors]) => {
      store.dispatch(updateColors({ symbol, colors: keyColors }));
    });

    // FLASH
    if (flash.length > 0) {
      queueFlash(flash);
    }
  };

  worker.onerror = (err) => console.error("Worker error:", err);

  return worker;
};

export const postToWorker = (msg: WorkerInputMessage): void => {
  worker?.postMessage(msg);
};
