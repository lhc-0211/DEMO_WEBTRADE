import React, { useEffect, useRef, useState } from "react";
import { store } from "../../../store";
import { updateSnapshots } from "../../../store/slices/stock/slice";
import type { WorkerInputMessage } from "../../../types";

interface Stats {
  fps: number;
  jank: number;
  cpu: string;
  msgPerSec: number;
  totalMsgs: number;
}

export const MessageSimulator: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<Stats>({
    fps: 0,
    jank: 0,
    cpu: "Đang đo...",
    msgPerSec: 0,
    totalMsgs: 0,
  });

  const frameCount = useRef(0);
  const jankCount = useRef(0);
  const totalMsgs = useRef(0);
  const startTime = useRef(0);
  const intervalId = useRef<number | null>(null);
  const reduxBatch = useRef<any[]>([]);

  const symbols = useRef<string[]>([]);

  // === KHỞI TẠO SYMBOL ===
  useEffect(() => {
    const snapshots = store.getState().stock.snapshots;
    symbols.current = Object.keys(snapshots);
    if (symbols.current.length === 0) {
      symbols.current = [
        "ACB:G1:STO",
        "BCM:G1:STO",
        "BID:G1:STO",
        "CTG:G1:STO",
        "FPT:G1:STO",
        "HPG:G1:STO",
        "MBB:G1:STO",
        "MSN:G1:STO",
        "MWG:G1:STO",
        "VCB:G1:STO",
        "VHM:G1:STO",
        "VIC:G1:STO",
        "VNM:G1:STO",
        "VPB:G1:STO",
        "VRE:G1:STO",
      ];
    }
    const initial = symbols.current.map((s) => ({
      symbol: s,
      trade: { "8": 10000, "9": 100, "11": 1000000, "12": 0, "13": "r" },
      refPrices: { "4": 9500, "5": 11000, "6": 9000 },
    }));
    store.dispatch(updateSnapshots(initial));
  }, []);

  // === TẠO DỮ LIỆU ===
  const createData = (symbol: string) => {
    const prev = store.getState().stock.snapshots[symbol];
    const prevPrice = prev?.trade?.["8"] ?? 10000;
    const base = prevPrice + (Math.random() - 0.5) * 200;
    const change = base - prevPrice;
    const priceCompare = change > 0 ? "u" : change < 0 ? "d" : "r";

    const snapshot: any = {
      symbol,
      trade: {
        "8": Math.round(base),
        "9": 100 + (totalMsgs.current % 100),
        "11": Math.round(base * 1000),
        "12": 1,
        "13": priceCompare,
      },
      orderBook: {
        "22": `${base - 100}|100|r|${base - 200}|100|d|${base - 300}|100|d`,
        "23": `${base + 100}|100|u|${base + 200}|100|u|${base + 300}|100|u`,
      },
    };

    return { snapshot };
  };

  // === GỬI WORKER ===
  const sendToWorker = (batch: any[]) => {
    const worker = (window as any).priceboardWorker;
    if (worker && batch.length > 0) {
      worker.postMessage({
        type: "batch",
        data: batch,
      } satisfies WorkerInputMessage);
    }
  };

  // === BẮT ĐẦU ===
  const start = () => {
    if (isRunning) return;
    setIsRunning(true);
    totalMsgs.current = frameCount.current = jankCount.current = 0;
    startTime.current = performance.now();
    let lastFrame = startTime.current;

    // Gửi dữ liệu mỗi 100ms
    intervalId.current = window.setInterval(() => {
      const now = performance.now();
      const delta = now - lastFrame;
      if (delta > 20) jankCount.current++;
      lastFrame = now;
      frameCount.current++;

      const batch: any[] = [];
      const workerBatch: any[] = [];

      // CHỈ 30 MÃ MỖI LẦN
      for (let i = 0; i < 30; i++) {
        const symbol =
          symbols.current[Math.floor(Math.random() * symbols.current.length)];
        const { snapshot } = createData(symbol);
        batch.push(snapshot);
        workerBatch.push(snapshot);
        totalMsgs.current++;
      }

      // Gửi worker
      sendToWorker(workerBatch);

      // Gom cho Redux (1 lần/giây)
      reduxBatch.current.push(...batch);
    }, 100); // 10 lần/giây → 300 msg/giây

    // Cập nhật Redux 1 lần/giây
    const reduxInterval = setInterval(() => {
      if (reduxBatch.current.length > 0) {
        store.dispatch(updateSnapshots(reduxBatch.current));
        reduxBatch.current = [];
      }
    }, 1000);

    // Cập nhật UI 2 lần/giây
    const statsInterval = setInterval(() => {
      const elapsed = (performance.now() - startTime.current) / 1000;
      setStats({
        fps: Math.round((frameCount.current / elapsed) * 10) / 10,
        jank: jankCount.current,
        cpu: frameCount.current / elapsed > 58 ? "Cao" : "Thấp",
        msgPerSec: Math.round(totalMsgs.current / elapsed),
        totalMsgs: totalMsgs.current,
      });
    }, 500);

    // Lưu để cleanup
    (window as any).cleanupSimulator = () => {
      clearInterval(intervalId.current!);
      clearInterval(reduxInterval);
      clearInterval(statsInterval);
    };
  };

  const stop = () => {
    if (intervalId.current) clearInterval(intervalId.current);
    if ((window as any).cleanupSimulator) (window as any).cleanupSimulator();
    setIsRunning(false);
  };

  useEffect(() => {
    return () => stop();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white rounded-lg shadow-2xl p-5 w-80 z-50 font-mono text-xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">GIẢ LẬP DỮ LIỆU</h3>
        <button
          onClick={isRunning ? stop : start}
          className={`px-3 py-1 rounded font-bold transition ${
            isRunning
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isRunning ? "DỪNG" : "BẮT ĐẦU"}
        </button>
      </div>
      {isRunning && (
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>FPS:</span>
            <span>{stats.fps}</span>
          </div>
          <div className="flex justify-between">
            <span>Jank:</span>
            <span>{stats.jank}</span>
          </div>
          <div className="flex justify-between">
            <span>CPU:</span>
            <span>{stats.cpu}</span>
          </div>
          <div className="flex justify-between">
            <span>Msg/s:</span>
            <span>{stats.msgPerSec}</span>
          </div>
          <div className="flex justify-between">
            <span>Tổng:</span>
            <span>{stats.totalMsgs}</span>
          </div>
        </div>
      )}
    </div>
  );
};
