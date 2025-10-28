import { useEffect } from "react";

type FlashMessage = {
  type: "flash";
  data: Array<{
    symbol: string;
    key: string;
    flashClass: "flash-up" | "flash-down";
  }>;
};

export const useFlashEffect = () => {
  useEffect(() => {
    const worker = window.flashWorker;
    if (!worker) return;

    const handler = (e: MessageEvent<FlashMessage>) => {
      if (e.data.type !== "flash") return;

      e.data.data.forEach(({ symbol, key, flashClass }) => {
        const cell = document.querySelector<HTMLElement>(
          `[data-symbol="${symbol}"][data-key="${key}"]`
        );
        if (!cell) return;

        cell.classList.remove("flash-up", "flash-down");
        void cell.offsetWidth;
        cell.classList.add(flashClass);

        setTimeout(() => {
          cell.classList.remove(flashClass);
        }, 300);
      });
    };

    worker.addEventListener("message", handler);
    return () => worker.removeEventListener("message", handler);
  }, []);
};
