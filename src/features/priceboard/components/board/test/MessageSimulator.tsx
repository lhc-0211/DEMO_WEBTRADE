// src/components/FullFlashSimulator.tsx
import React, { useEffect, useRef, useState } from "react";
import { store } from "../../../../../store";
import { updateSnapshots } from "../../../../../store/slices/stock/slice";
import type { SnapshotData } from "../../../../../types";

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
  const prevSnapshots = useRef<Map<string, SnapshotData>>(new Map());

  // === SYMBOL THẬT ===
  const symbols = useRef<string[]>([]);

  useEffect(() => {
    const snapshots = store.getState().stock.snapshots;
    symbols.current =
      Object.keys(snapshots).length > 0
        ? Object.keys(snapshots)
        : ["AAH:G1:UPX", "VCB:STO", "FPT:HOSE"].concat(
            Array.from(
              { length: 1000 },
              (_, i) => `SYM${i.toString().padStart(4, "0")}`
            )
          );

    // Khởi tạo
    const initial: any = symbols.current.slice(0, 500).map((s) => ({
      symbol: s,
      trade: { price: 10000, volume: 100, changePct: 0, priceCompare: "r" },
    }));
    store.dispatch(updateSnapshots(initial));
    initial.forEach((s) => prevSnapshots.current.set(s.symbol, s));
  }, []);

  // === TẠO SNAPSHOT + DTO + FLASH DATA ===
  const createData = (symbol: string, i: number) => {
    const prev = prevSnapshots.current.get(symbol);
    const base = (prev?.trade?.price || 10000) + (Math.random() - 0.5) * 200;
    const change = base - (prev?.trade?.price || 10000);
    const priceCompare = change > 50 ? "u" : change < -50 ? "d" : "r";

    const snapshot: any = {
      symbol,
      trade: {
        price: base,
        volume: 100 + (i % 100),
        changePct: (change / (prev?.trade?.price || 10000)) * 100,
        priceCompare,
      },
      orderBook: {
        bids: [
          {
            price: base - 100,
            volume: 46400,
            priceCompare: change > 0 ? "r" : "d",
          },
          { price: base - 200, volume: 787600, priceCompare: "d" },
          { price: base - 300, volume: 74700, priceCompare: "d" },
        ],
        asks: [
          { price: base + 100, volume: 133400, priceCompare: "r" },
          {
            price: base + 200,
            volume: 727900,
            priceCompare: change > 0 ? "u" : "r",
          },
          { price: base + 300, volume: 270900, priceCompare: "u" },
        ],
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

  // === GỌI CẢ HAI WORKER ===
  const sendToWorkers = (dtos: any[], flashData: any[]) => {
    if (window.colorWorker && dtos.length > 0) {
      colorCount.current += dtos.length;
      window.colorWorker.postMessage({ type: "batch", data: dtos });
    }
    if (window.flashWorker && flashData.length > 0) {
      flashCount.current += flashData.length;
      window.flashWorker.postMessage({ type: "batch", data: flashData });
    }
  };

  // === GIẢ LẬP ===
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

      for (let i = 0; i < 83; i++) {
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

      // GỌI CẢ HAI WORKER
      sendToWorkers(batchDTOs, batchFlash);

      // Cập nhật prev
      batchSnapshots.forEach((s) => prevSnapshots.current.set(s.symbol, s));

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
    }, 1000 / 60);
  };

  const stop = () => {
    if (intervalId.current) clearInterval(intervalId.current);
    setIsRunning(false);
  };

  useEffect(() => {
    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-2xl p-5 w-80 z-50 font-mono text-xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">GIẢ LẬP + FLASH</h3>
        <button
          onClick={isRunning ? stop : start}
          className={`px-3 py-1 rounded font-bold transition ${
            isRunning ? "bg-red-500" : "bg-green-500"
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

      <div className="mt-3 text-[10px] opacity-80">
        Nháy màu + flash đỏ/xanh
      </div>
    </div>
  );
};
