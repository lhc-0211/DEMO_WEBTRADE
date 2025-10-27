import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ALL_COLUMNS } from "../../../../configs/headerPriceBoard";
import { useAppSelector } from "../../../../store/hook";
import { selectSnapshotsBySymbols } from "../../../../store/slices/stock/selector";
import type { Column, SnapshotData } from "../../../../types";
import { getColumnValue } from "../../../../utils/priceboard";

function BodyTable({ symbol }: { symbol: string }) {
  const snapshot = useAppSelector(
    (state) => selectSnapshotsBySymbols(state, [symbol])[symbol]
  ) || { symbol };

  const [columns] = useState<Column[]>(() => {
    const saved = localStorage.getItem("clientConfig");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        console.warn("Failed to parse clientConfig, using default ALL_COLUMNS");
      }
    }
    return ALL_COLUMNS;
  });

  // Refs
  const prevSnapshotRef = useRef<SnapshotData | null>(null);
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const workerRef = useRef<Worker | null>(null);

  // Khởi tạo Web Worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL("./workers/snapshotWorker.ts", import.meta.url),
        {
          type: "module",
        }
      );
    } catch (error) {
      console.error("Failed to initialize Worker:", error);
    }
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Hàm xử lý flash effect
  const flashCell = useCallback((key: string, flashClass: string) => {
    const el = cellRefs.current[key];
    if (!el) {
      return;
    }
    if (!flashClass) return;
    requestAnimationFrame(() => {
      el.classList.add(flashClass);
      setTimeout(() => {
        requestAnimationFrame(() => {
          el.classList.remove(flashClass);
        });
      }, 400);
    });
  }, []);

  // Gửi snapshot đến Worker và nhận kết quả
  useEffect(() => {
    if (!workerRef.current) return;

    workerRef.current.onmessage = (
      e: MessageEvent<{ key: string | null; flashClass: string | null }>
    ) => {
      const { key, flashClass } = e.data;
      if (key && flashClass) {
        flashCell(key, flashClass);
      }
    };

    workerRef.current.postMessage({
      snapshot,
      prevSnapshot: prevSnapshotRef.current,
    });

    prevSnapshotRef.current = snapshot;
  }, [snapshot, flashCell]);

  // Hàm lấy text color class dựa trên priceCompare
  const getTextColorClass = useCallback(
    (key: string, snapshot: SnapshotData): string => {
      let priceCompare: string | undefined;

      if (key === "lastPrice" || key === "lastVolume") {
        // priceCompare = snapshot.trade?.priceCompare;
        // Fallback: So sánh price nếu priceCompare không có
        if (
          !priceCompare &&
          snapshot.trade?.price &&
          prevSnapshotRef.current?.trade?.price
        ) {
          priceCompare =
            snapshot.trade.price > prevSnapshotRef.current.trade.price
              ? "u"
              : "d";
        }
      } else if (key === "priceBuy1" || key === "volumeBuy1") {
        priceCompare = snapshot.orderBook?.bids?.[0]?.priceCompare;
      } else if (key === "priceBuy2" || key === "volumeBuy2") {
        priceCompare = snapshot.orderBook?.bids?.[1]?.priceCompare;
      } else if (key === "priceBuy3" || key === "volumeBuy3") {
        priceCompare = snapshot.orderBook?.bids?.[2]?.priceCompare;
      } else if (key === "priceSell1" || key === "volumeSell1") {
        priceCompare = snapshot.orderBook?.asks?.[0]?.priceCompare;
      } else if (key === "priceSell2" || key === "volumeSell2") {
        priceCompare = snapshot.orderBook?.asks?.[1]?.priceCompare;
      } else if (key === "priceSell3" || key === "volumeSell3") {
        priceCompare = snapshot.orderBook?.asks?.[2]?.priceCompare;
      }

      return priceCompare || "text-text-body";
    },
    []
  );

  // Cache text color classes
  const textColorClasses = useMemo(() => {
    const classes: Record<string, string> = {};
    const keys = [
      "lastPrice",
      "lastVolume",
      "priceBuy1",
      "volumeBuy1",
      "priceBuy2",
      "volumeBuy2",
      "priceBuy3",
      "volumeBuy3",
      "priceSell1",
      "volumeSell1",
      "priceSell2",
      "volumeSell2",
      "priceSell3",
      "volumeSell3",
    ] as const;

    keys.forEach((key) => {
      classes[key] = getTextColorClass(key, snapshot);
    });
    return classes;
  }, [snapshot, getTextColorClass]);

  return (
    <div>
      <div className="flex border-x border-b border-border divide-x divide-border w-full">
        {columns.map((col) => {
          const hasChildren = !!col.children?.length;

          if (col.key === "mark" || col.key === "symbol") {
            return (
              <div
                key={col.key}
                className="h-7 grid place-items-center text-text-body text-xs font-medium select-none"
                style={{ minWidth: col.width }}
              >
                <div className="flex flex-col w-full">
                  <div
                    ref={(el) => {
                      cellRefs.current[col.key] = el;
                    }}
                    className={`flex items-center justify-center h-7 ${
                      col.children ? "border-b border-border" : ""
                    }`}
                    style={{ minWidth: col.width }}
                  >
                    {getColumnValue(snapshot, col.key)}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={col.key} className="flex flex-col w-full">
              {!hasChildren ? (
                <div key={`${col.key}-parent`}>
                  <div
                    ref={(el) => {
                      cellRefs.current[col.key] = el;
                    }}
                    className={`flex items-center justify-center text-xs font-medium select-none h-7 transition-colors duration-300 ${
                      textColorClasses[col.key] || "text-text-body"
                    }`}
                    style={{ minWidth: col.width }}
                  >
                    {getColumnValue(snapshot, col.key)}
                  </div>
                </div>
              ) : (
                <div className="flex divide-x divide-border text-xs font-medium select-none">
                  {col.children?.map((child) => (
                    <div key={child.key}>
                      <div
                        ref={(el) => {
                          cellRefs.current[child.key] = el;
                        }}
                        className={`flex-1 text-center h-7 grid place-items-center transition-colors duration-300 ${
                          textColorClasses[child.key] || "text-text-body"
                        }`}
                        style={{ minWidth: child.width }}
                      >
                        {getColumnValue(snapshot, child.key)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(BodyTable);
