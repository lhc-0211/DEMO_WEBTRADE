import type { SnapshotData } from "../../../../../types";

type ColumnValue = string | number | undefined;

const getColumnValue = (snapshot: SnapshotData, key: string): ColumnValue => {
  if (key === "lastPrice") return snapshot.trade?.price;
  if (key === "lastVolume") return snapshot.trade?.volume;
  if (key === "priceBuy1") return snapshot.orderBook?.bids?.[0]?.price;
  if (key === "volumeBuy1") return snapshot.orderBook?.bids?.[0]?.volume;
  if (key === "priceBuy2") return snapshot.orderBook?.bids?.[1]?.price;
  if (key === "volumeBuy2") return snapshot.orderBook?.bids?.[1]?.volume;
  if (key === "priceBuy3") return snapshot.orderBook?.bids?.[2]?.price;
  if (key === "volumeBuy3") return snapshot.orderBook?.bids?.[2]?.volume;
  if (key === "priceSell1") return snapshot.orderBook?.asks?.[0]?.price;
  if (key === "volumeSell1") return snapshot.orderBook?.asks?.[0]?.volume;
  if (key === "priceSell2") return snapshot.orderBook?.asks?.[1]?.price;
  if (key === "volumeSell2") return snapshot.orderBook?.asks?.[1]?.volume;
  if (key === "priceSell3") return snapshot.orderBook?.asks?.[2]?.price;
  if (key === "volumeSell3") return snapshot.orderBook?.asks?.[2]?.volume;
  return undefined;
};

// Xử lý message từ main thread
self.onmessage = (
  e: MessageEvent<{ snapshot: SnapshotData; prevSnapshot: SnapshotData | null }>
) => {
  const { snapshot, prevSnapshot } = e.data;
  if (!prevSnapshot) {
    self.postMessage({ key: null, flashClass: null });
    return;
  }

  const compareAndFlash = (key: string) => {
    const newValue = getColumnValue(snapshot, key);
    const prevValue = getColumnValue(prevSnapshot, key);

    if (
      newValue === prevValue ||
      newValue === undefined ||
      prevValue === undefined
    ) {
      return;
    }

    let flashClass: string | null = null;

    // Các key giá: Flash dựa trên priceCompare
    if (
      key === "lastPrice" ||
      key === "priceBuy1" ||
      key === "priceBuy2" ||
      key === "priceBuy3" ||
      key === "priceSell1" ||
      key === "priceSell2" ||
      key === "priceSell3"
    ) {
      let priceCompare: string | undefined;
      if (key === "lastPrice") {
        // priceCompare = snapshot.trade?.priceCompare;
        // Fallback: So sánh price nếu priceCompare không có
        if (
          !priceCompare &&
          snapshot.trade?.price &&
          prevSnapshot.trade?.price
        ) {
          priceCompare =
            snapshot.trade.price > prevSnapshot.trade.price ? "u" : "d";
        }
      } else if (key === "priceBuy1") {
        priceCompare = snapshot.orderBook?.bids?.[0]?.priceCompare;
      } else if (key === "priceBuy2") {
        priceCompare = snapshot.orderBook?.bids?.[1]?.priceCompare;
      } else if (key === "priceBuy3") {
        priceCompare = snapshot.orderBook?.bids?.[2]?.priceCompare;
      } else if (key === "priceSell1") {
        priceCompare = snapshot.orderBook?.asks?.[0]?.priceCompare;
      } else if (key === "priceSell2") {
        priceCompare = snapshot.orderBook?.asks?.[1]?.priceCompare;
      } else if (key === "priceSell3") {
        priceCompare = snapshot.orderBook?.asks?.[2]?.priceCompare;
      }

      flashClass =
        priceCompare === "u"
          ? "flash-up"
          : priceCompare === "d"
          ? "flash-down"
          : null;
    }
    // Các key khối lượng: Flash dựa trên so sánh volume
    else if (
      key === "lastVolume" ||
      key === "volumeBuy1" ||
      key === "volumeBuy2" ||
      key === "volumeBuy3" ||
      key === "volumeSell1" ||
      key === "volumeSell2" ||
      key === "volumeSell3"
    ) {
      // So sánh khối lượng: newValue > prevValue → flash-up, ngược lại → flash-down
      flashClass =
        typeof newValue === "number" && typeof prevValue === "number"
          ? newValue > prevValue
            ? "flash-up"
            : "flash-down"
          : null;
    }

    if (flashClass) {
      self.postMessage({ key, flashClass });
    }
  };

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

  keys.forEach(compareAndFlash);
};

// Định nghĩa type cho self
declare const self: Worker;
