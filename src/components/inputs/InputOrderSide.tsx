import { memo } from "react";
import { useController, type Control, type Path } from "react-hook-form";
import type { OrderForm } from "../../types/placeOrder";

interface InputOrderSideProps {
  control: Control<OrderForm>;
  name: Path<OrderForm>;
}

function InputOrderSide({ control, name }: InputOrderSideProps) {
  const {
    field: { value, onChange },
  } = useController({ control, name });

  return (
    <div className="w-max grid grid-cols-2 gap-2">
      <div
        className={`flex items-center justify-center cursor-pointer rounded-3xl text-text-subtitle w-[64px] py-1 text-sm hover:bg-green-300 ${
          value === "B" ? "bg-green-400 !text-text-title" : "bg-input"
        }`}
        onClick={() => onChange("B")}
      >
        Mua
      </div>
      <div
        className={`flex items-center justify-center cursor-pointer rounded-3xl text-text-subtitle w-[64px] text-sm hover:bg-red-300 ${
          value === "S" ? "bg-red-400 !text-text-title" : "bg-input"
        }`}
        onClick={() => onChange("S")}
      >
        Bán
      </div>
    </div>
  );
}

export default memo(InputOrderSide);
