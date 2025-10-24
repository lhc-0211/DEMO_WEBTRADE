import { useState } from "react";
import DndProviderWrapper from "../../../../components/dnd/DndProviderWrapper";

import { DraggableColumnChildDiv } from "../../../../components/dnd/DraggableColumnChildDiv";
import { DraggableColumnDiv } from "../../../../components/dnd/DraggableColumnDiv";
import { ALL_COLUMNS } from "../../../../configs/headerPriceBoard";
import type { Column } from "../../../../types";

export default function HeaderColumns() {
  const [columns, setColumns] = useState<Column[]>(() => {
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

  function moveParentColumn(fromIndex: number, toIndex: number) {
    setColumns((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }

  function moveChildColumn(
    parentKey: string,
    fromIndex: number,
    toIndex: number
  ) {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.key !== parentKey || !col.children) return col;
        const updatedChildren = [...col.children];
        const [moved] = updatedChildren.splice(fromIndex, 1);
        updatedChildren.splice(toIndex, 0, moved);
        return { ...col, children: updatedChildren };
      })
    );
  }

  return (
    <DndProviderWrapper>
      <div className="flex border border-background-primary divide-x divide-background-primary w-full">
        {columns.map((col, index) => {
          const hasChildren = !!col.children?.length;

          // Cột không draggable: mark, symbol
          if (col.key === "mark" || col.key === "symbol") {
            return (
              <div
                key={col.key}
                className={`h-14 grid place-items-center text-text-body text-xs font-medium select-none bg-DTND-1000`}
                style={{ minWidth: col.width }}
              >
                <div className="flex flex-col w-full">
                  {/* Dòng 1: cột cha */}
                  <div
                    className={`flex items-center justify-center ${
                      col.children ? "border-b border-background-primary" : ""
                    } ${col.children ? "h-7" : "h-14"}`}
                    style={{ minWidth: col.width }}
                  >
                    {col.label}
                  </div>

                  {/* Dòng 2: cột con */}
                  {col.children && (
                    <div className="flex divide-x divide-background-primary ">
                      {col.children.map((child) => (
                        <div
                          key={child.key}
                          className={`flex-1 text-center h-7 grid place-items-center`}
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
              <DraggableColumnDiv
                key={`${col.key}-parent`}
                index={index}
                moveColumn={moveParentColumn}
              >
                <div
                  className={`flex items-center justify-center text-text-body text-xs font-medium select-none bg-DTND-1000 ${
                    hasChildren ? "border-b border-background-primary" : ""
                  } ${hasChildren ? "h-7" : "h-14"}`}
                  style={{ minWidth: col.width }}
                >
                  {col.label}
                </div>
              </DraggableColumnDiv>

              {/* --- Dòng 2: con draggable riêng --- */}
              {hasChildren && (
                <div className="flex divide-x divide-background-primary text-text-body text-xs font-medium select-none ">
                  {col.children?.map((child: Column, idxChild: number) => (
                    <DraggableColumnChildDiv
                      key={child.key}
                      parentKey={col.key}
                      index={idxChild}
                      moveColumn={moveChildColumn}
                    >
                      <div
                        className="flex-1 text-center h-7 grid place-items-center"
                        style={{ minWidth: child.width }}
                      >
                        {child.label}
                      </div>
                    </DraggableColumnChildDiv>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DndProviderWrapper>
  );
}
