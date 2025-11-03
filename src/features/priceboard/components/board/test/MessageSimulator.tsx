import React, { useEffect, useRef, useState } from "react";
import { store } from "../../../../../store";
import { updateSnapshots } from "../../../../../store/slices/stock/slice";
import type { SnapshotData, WorkerInputMessage } from "../../../../../types";

interface Stats {
  fps: number;
  jank: number;
  cpu: string;
  msgPerSec: number;
  totalMsgs: number;
  colorMsgs: number;
  flashMsgs: number;
}

export const MessageSimulator: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<Stats>({
    fps: 0,
    jank: 0,
    cpu: "Đang đo...",
    msgPerSec: 0,
    totalMsgs: 0,
    colorMsgs: 0,
    flashMsgs: 0,
  });

  const frameCount = useRef(0);
  const jankCount = useRef(0);
  const totalMsgs = useRef(0);
  const colorCount = useRef(0);
  const flashCount = useRef(0);
  const startTime = useRef(0);
  const intervalId = useRef<number | null>(null);

  // === SYMBOL THẬT ===
  const symbols = useRef<string[]>([]);

  useEffect(() => {
    const snapshots = store.getState().stock.snapshots;
    symbols.current = Object.keys(snapshots);

    if (symbols.current.length === 0) {
      // fallback khi bảng giá chưa có mã nào
      symbols.current = [
        "HPG:G1:STO",
        "VCB:G1:STO",
        "MWG:G1:STO",
        "SHB:G1:STX",
        "ACB:G1:STX",
        "CEO:G1:STX",
      ];
    }

    // Tạo dữ liệu ban đầu đúng cấu trúc mới
    const initial: any = symbols.current.map((s) => ({
      symbol: s,
      trade: {
        "8": 0, // giá
        "9": 0, // KL
        "11": 0, // Giá trị
        "12": 0, // %
        "13": "r", // màu
      },
      refPrices: {
        "4": 9500, // Tham chiếu
        "5": 11000, // Trần
        "6": 9000, // Sàn
      },
    }));

    store.dispatch(updateSnapshots(initial));
  }, []);

  // === TẠO SNAPSHOT + DTO + FLASH DATA ===
  const createData = (symbol: string, i: number) => {
    const prev = store.getState().stock.snapshots[symbol];
    const prevPrice = prev?.trade?.["8"] ?? 10000;

    const base = prevPrice + (Math.random() - 0.5) * 200;
    const change = base - prevPrice;
    const changePct = 1;
    const priceCompare = change > 0 ? "u" : change < 0 ? "d" : "r";

    const snapshot: any = {
      symbol,
      trade: {
        "8": Math.round(base), // giá
        "9": 100 + (i % 100), // KL
        "11": Math.round(base * (100 + (i % 100))), // Giá trị
        "12": changePct,
        "13": priceCompare,
      },
      foreignTrade: {
        "1": "ft",
        "14": Math.floor(Math.random() * 1000000),
        "15": Math.floor(Math.random() * 100000),
        "16": Math.floor(Math.random() * 1e8),
        "17": Math.floor(Math.random() * 1e8),
        "18": Math.floor(Math.random() * 1e8),
        symbol,
        recv_ts: Date.now(),
      },
      orderBook: {
        "1": "ob",
        "22": `${base - 100}|${base - 100}|r|${base - 200}|${base - 100}|d|${
          base - 300
        }|${base - 100}|d`,
        "23": `${base + 100}|${base - 100}|u|${base + 200}|${base - 100}|u|${
          base + 300
        }|${base - 100}|u`,
      },
    };

    const dto = {
      s: symbol,
      c: priceCompare,
      b: [base - 100, base - 200, base - 300],
      a: [base + 100, base + 200, base + 300],
      bc: [change > 0 ? "r" : "d", "d", "d"],
      ac: ["r", change > 0 ? "u" : "r", "u"],
    };

    const flashData = prev ? { snapshot, prevSnapshot: prev } : null;
    return { snapshot, dto, flashData };
  };

  // === GỬI TỚI WORKER ===
  const sendToWorker = (batch: any) => {
    const worker = (window as any).priceboardWorker;
    if (worker && batch.length > 0) {
      totalMsgs.current += batch.length;

      const flashInBatch = batch.filter((s) => {
        const prev: any = store.getState().stock.snapshots[s.symbol];
        return prev && s.trade?.price !== prev.trade?.price;
      }).length;

      colorCount.current += batch.length;
      flashCount.current += flashInBatch;

      // GỬI 1 LẦN DUY NHẤT
      worker.postMessage({
        type: "batch",
        data: batch,
      } satisfies WorkerInputMessage);
    }
  };
  // === BẮT ĐẦU GIẢ LẬP ===
  const start = () => {
    if (isRunning) return;
    setIsRunning(true);

    totalMsgs.current =
      colorCount.current =
      flashCount.current =
      frameCount.current =
      jankCount.current =
        0;
    startTime.current = performance.now();
    let lastFrame = startTime.current;

    intervalId.current = window.setInterval(() => {
      const now = performance.now();
      const delta = now - lastFrame;
      if (delta > 20) jankCount.current++;
      lastFrame = now;
      frameCount.current++;

      const batchSnapshots: SnapshotData[] = [];
      const batchDTOs: any[] = [];
      const batchFlash: any[] = [];

      for (let i = 0; i < 500; i++) {
        const symbol =
          symbols.current[Math.floor(Math.random() * symbols.current.length)];
        const { snapshot, dto, flashData } = createData(
          symbol,
          totalMsgs.current + i
        );
        batchSnapshots.push(snapshot);
        batchDTOs.push(dto);
        if (flashData) batchFlash.push(flashData);
        totalMsgs.current++;
      }

      // Cập nhật Redux
      store.dispatch(updateSnapshots(batchSnapshots));

      // Gọi workers
      sendToWorker(batchSnapshots);

      const elapsed = (now - startTime.current) / 1000;
      setStats({
        fps: Math.round((frameCount.current / elapsed) * 10) / 10,
        jank: jankCount.current,
        cpu: frameCount.current / elapsed > 58 ? "Thấp" : "Trung bình",
        msgPerSec: Math.round(totalMsgs.current / elapsed),
        totalMsgs: totalMsgs.current,
        colorMsgs: colorCount.current,
        flashMsgs: flashCount.current,
      });
    }, 100); // 10 lần / giây
  };

  // === DỪNG GIẢ LẬP ===
  const stop = () => {
    if (intervalId.current) clearInterval(intervalId.current);
    setIsRunning(false);
  };

  useEffect(() => {
    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, []);

  // === UI ===
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white rounded-lg shadow-2xl p-5 w-80 z-50 font-mono text-xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">GIẢ LẬP DỮ LIỆU + FLASH</h3>
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
            <span>{stats.msgPerSec.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>colorWorker:</span>
            <span className="text-yellow-300">
              {stats.colorMsgs.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>flashWorker:</span>
            <span className="text-cyan-300">
              {stats.flashMsgs.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="mt-3 text-[10px] opacity-70">
        Nháy màu + flash xanh/đỏ, dữ liệu cập nhật qua Redux & Worker.
      </div>
    </div>
  );
};
