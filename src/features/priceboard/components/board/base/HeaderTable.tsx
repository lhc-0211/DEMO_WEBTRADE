import { useState } from "react";
import { ALL_COLUMNS_BASE } from "../../../../../configs/headerPriceBoard";
import type { Column } from "../../../../../types";

export default function HeaderColumnsBase() {
  const [columns] = useState<Column[]>(() => {
    const saved = localStorage.getItem("clientConfig");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ALL_COLUMNS_BASE;
      }
    }
    return ALL_COLUMNS_BASE;
  });

  return (
    <div className="flex border-x border-b border-border divide-x divide-border w-full">
      {columns.map((col) => {
        const hasChildren = !!col.children?.length;

        // Cột đặc biệt: mark, symbol
        if (col.key === "mark" || col.key === "symbol") {
          return (
            <div
              key={col.key}
              className="h-14 grid place-items-center text-text-body text-xs font-medium select-none bg-gray-300/50"
              style={{ width: col.width }}
            >
              <div className="flex flex-col w-full">
                {/* Dòng 1: cột cha */}
                <div
                  className={`flex items-center justify-center ${
                    hasChildren ? "border-b border-border h-7" : "h-14"
                  }`}
                >
                  {col.label}
                </div>
              </div>
            </div>
          );
        }

        // Cột bình thường
        return (
          <div
            key={col.key}
            className="flex flex-col"
            style={{ width: col.width }}
          >
            {/* Dòng 1: cha */}
            <div
              className={`flex items-center justify-center text-text-body text-xs font-medium select-none bg-gray-300/50 ${
                hasChildren ? "border-b border-border h-7" : "h-14"
              }`}
              key={`${col.key}-parent`}
            >
              {col.label}
            </div>

            {/* Dòng 2: con */}
            {hasChildren && (
              <div className="flex divide-x divide-border w-full text-text-body text-xs font-medium select-none">
                {col.children?.map((child) => (
                  <div
                    key={child.key}
                    className="text-center h-7 grid place-items-center bg-gray-300/50"
                    style={{
                      width: `${100 / (col.children?.length || 1)}%`,
                    }}
                  >
                    {child.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
