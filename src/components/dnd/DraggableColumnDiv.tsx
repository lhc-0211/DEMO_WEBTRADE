import { useRef, type ReactNode } from "react";
import { useDrag, useDrop } from "react-dnd";

export const DRAG_TYPE_PARENT = "PARENT_COLUMN" as const;

interface DraggableColumnDivProps {
  index: number;
  moveColumn: (fromIndex: number, toIndex: number) => void;
  children: ReactNode;
}

interface DragItemParent {
  type: typeof DRAG_TYPE_PARENT;
  index: number;
}

export function DraggableColumnDiv({
  index,
  moveColumn,
  children,
}: DraggableColumnDivProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [, drag] = useDrag<DragItemParent>({
    type: DRAG_TYPE_PARENT,
    item: { type: DRAG_TYPE_PARENT, index },
  });

  const [{ isOver }, drop] = useDrop<DragItemParent, void, { isOver: boolean }>(
    {
      accept: DRAG_TYPE_PARENT,
      drop: (item) => {
        if (item.index !== index) moveColumn(item.index, index);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }
  );

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="cursor-move select-none"
      style={{
        opacity: isOver ? 0.4 : 1,
        cursor: "grab",
      }}
    >
      {children}
    </div>
  );
}
