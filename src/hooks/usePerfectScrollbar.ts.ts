import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import { useEffect, useRef } from "react";

interface Options {
  wheelSpeed?: number;
  wheelPropagation?: boolean;
  minScrollbarLength?: number;
}

export const usePerfectScrollbar = (options?: Options) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const psRef = useRef<PerfectScrollbar | null>(null);

  // Khởi tạo PerfectScrollbar
  useEffect(() => {
    if (containerRef.current) {
      psRef.current = new PerfectScrollbar(containerRef.current, options);
    }

    return () => {
      psRef.current?.destroy();
      psRef.current = null;
    };
  }, []);

  // Hàm update scrollbar nếu nội dung thay đổi
  const update = () => {
    psRef.current?.update();
  };

  return { containerRef, update };
};
