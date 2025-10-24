import { useRef, type ReactNode } from "react";
import { useDrag, useDrop } from "react-dnd";

export const DRAG_TYPE_CHILD = "CHILD_COLUMN" as const;

interface DraggableColumnChildDivProps {
  parentKey: string;
  index: number;
  moveColumn: (parentKey: string, fromIndex: number, toIndex: number) => void;
  children: ReactNode;
}

interface DragItemChild {
  type: typeof DRAG_TYPE_CHILD;
  parentKey: string;
  index: number;
}

export function DraggableColumnChildDiv({
  parentKey,
  index,
  moveColumn,
  children,
}: DraggableColumnChildDivProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [, drag] = useDrag<DragItemChild>({
    type: DRAG_TYPE_CHILD,
    item: { type: DRAG_TYPE_CHILD, parentKey, index },
  });

  const [{ isOver }, drop] = useDrop<DragItemChild, void, { isOver: boolean }>({
    accept: DRAG_TYPE_CHILD,
    drop: (item) => {
      if (item.parentKey === parentKey && item.index !== index) {
        moveColumn(parentKey, item.index, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="cursor-move select-none bg-DTND-1000"
      style={{
        opacity: isOver ? 0.4 : 1,
        cursor: "grab",
      }}
    >
      {children}
    </div>
  );
}
