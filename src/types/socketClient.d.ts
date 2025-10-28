import type { SnapshotData } from "./snapshot";

export interface SubscribeOptions {
  groupId?: string;
  symbols?: string[];
}

export interface SocketClient {
  subscribe: (options: SubscribeOptions) => Promise<void>;
  unsubscribe: (options: SubscribeOptions) => Promise<void>;
  onMessage: (handler: (data: SnapshotData) => void) => () => void;
  getSnapshot: (symbol: string) => SnapshotData | undefined;
  getAllSnapshots: () => SnapshotData[];
  close: () => void;
  setVisibleSymbols: (symbols: string[]) => void;
}
