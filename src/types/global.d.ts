import type { ApiClient } from "./apiClient";
import type { SocketClient } from "./socketClient";

declare global {
  interface Window {
    flashWorker?: Worker;
    colorWorker?: Worker;
    socketClient?: SocketClient;
    apiClient?: ApiClient;
  }
}

export {};
