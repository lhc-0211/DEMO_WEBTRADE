import { queueFlash } from "../../features/priceboard/components/board/workers/flashManager";
import { store } from "../../store";
import { updateColors } from "../../store/slices/stock/slice";
import type { FlashResult } from "../../types";

let initialized = false;

export const initWorkers = () => {
  if (initialized) return;
  initialized = true;

  // Color Worker
  const colorWorker = new Worker(
    new URL(
      "../../features/priceboard/components/board/workers/colorWorker.ts",
      import.meta.url
    ),
    { type: "module" }
  );

  colorWorker.onmessage = (
    e: MessageEvent<{
      type: "colors";
      data: Record<string, Record<string, string>>;
    }>
  ) => {
    if (e.data.type === "colors") {
      Object.entries(e.data.data).forEach(([symbol, colors]) => {
        store.dispatch(updateColors({ symbol, colors }));
      });
    }
  };

  window.colorWorker = colorWorker;

  // Flash Worker
  const flashWorker = new Worker(
    new URL(
      "../../features/priceboard/components/board/workers/flashWorker.ts",
      import.meta.url
    ),
    { type: "module" }
  );

  flashWorker.onmessage = (
    e: MessageEvent<{ type: "flash"; data: readonly FlashResult[] }>
  ) => {
    if (e.data.type === "flash") {
      queueFlash(e.data.data);
    }
  };

  window.flashWorker = flashWorker;
};
