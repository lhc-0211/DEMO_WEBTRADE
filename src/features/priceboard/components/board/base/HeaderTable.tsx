import { useState } from "react";
import { ALL_COLUMNS } from "../../../../../configs/headerPriceBoard";
import type { Column } from "../../../../../types";

export default function HeaderColumns() {
  const [columns] = useState<Column[]>(() => {
    const saved = localStorage.getItem("clientConfig");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ALL_COLUMNS;
      }
    }
    return ALL_COLUMNS;
  });

  return (
    <div className="flex border-x border-b border-border divide-x divide-border w-full">
      {columns.map((col) => {
        const hasChildren = !!col.children?.length;

        // Cột không draggable: mark, symbol
        if (col.key === "mark" || col.key === "symbol") {
          return (
            <div
              key={col.key}
              className={`h-14 grid place-items-center text-text-body text-xs font-medium select-none bg-gray-300/50`}
              style={{ minWidth: col.width }}
            >
              <div className="flex flex-col w-full">
                {/* Dòng 1: cột cha */}
                <div
                  className={`flex items-center justify-center ${
                    col.children ? "border-b border-border" : ""
                  } ${col.children ? "h-7" : "h-14"}`}
                  style={{ minWidth: col.width }}
                >
                  {col.label}
                </div>

                {/* Dòng 2: cột con */}
                {col.children && (
                  <div className="flex divide-x divide-border">
                    {col.children.map((child) => (
                      <div
                        key={child.key}
                        className={`flex-1 text-center h-7 grid place-items-center bg-gray-300/50`}
                        style={{ minWidth: child.width }}
                      >
                        {child.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }

        return (
          <div key={col.key} className="flex flex-col w-full">
            {/* --- Dòng 1: cha draggable riêng --- */}
            <div
              className={`flex items-center justify-center text-text-body text-xs font-medium select-none bg-gray-300/50 ${
                hasChildren ? "border-b border-border" : ""
              } ${hasChildren ? "h-7" : "h-14"}`}
              style={{ minWidth: col.width }}
              key={`${col.key}-parent`}
            >
              {col.label}
            </div>

            {/* --- Dòng 2: con draggable riêng --- */}
            {hasChildren && (
              <div className="flex divide-x divide-border text-text-body text-xs font-medium select-none ">
                {col.children?.map((child: Column) => (
                  <div
                    className="flex-1 text-center h-7 grid place-items-center bg-gray-300/50"
                    style={{ minWidth: child.width }}
                    key={child.key}
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
