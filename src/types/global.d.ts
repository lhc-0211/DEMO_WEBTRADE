import type { SocketClient } from "./socketClient";

declare global {
  interface Window {
    flashWorker?: Worker;
    colorWorker?: Worker;
    priceboardWorker?: Worker;
    socketClient?: SocketClient;
    updateCellColors?: (colors: Record<string, Record<string, string>>) => void;
  }
}

export {};
