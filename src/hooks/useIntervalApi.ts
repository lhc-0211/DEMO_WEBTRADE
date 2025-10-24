import { useEffect, useRef } from "react";

type UseIntervalApiOptions = {
  enabled?: boolean; // Có bật interval không
  immediate?: boolean; // Gọi ngay lần đầu khi mount
};

export function useIntervalApi(
  callback: () => Promise<void> | void,
  delay: number,
  options: UseIntervalApiOptions = {}
) {
  const { enabled = true, immediate = true } = options;
  const savedCallback = useRef<() => Promise<void> | void>(() => {});

  // Lưu callback mới nhất (tránh stale closure)
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || delay === null) return;

    // Nếu muốn gọi ngay lần đầu
    if (immediate && savedCallback.current) {
      savedCallback.current();
    }

    const id = setInterval(() => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }, delay);

    return () => clearInterval(id);
  }, [delay, enabled, immediate]);
}
