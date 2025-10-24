import IMask, { InputMask, type MaskedNumberOptions } from "imask";
import { memo, useCallback, useEffect, useRef } from "react";
import type { FieldError } from "react-hook-form";
import { FiMinus, FiPlus } from "react-icons/fi";

export interface InputOrderPriceProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  label?: string;
  error?: FieldError;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  step?: number;
  min?: number;
  max?: number;
}

function InputOrderPrice({
  label,
  type = "text",
  placeholder,
  error,
  value: externalValue,
  onChange,
  className,
  required,
  step = 0.05, // Mặc định bước là 0.05
  min = 0,
  max = Infinity,
  name,
  id,
}: InputOrderPriceProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const maskRef = useRef<InputMask<MaskedNumberOptions> | null>(null);

  // Khởi tạo IMask
  useEffect(() => {
    if (inputRef.current) {
      maskRef.current = IMask(inputRef.current, {
        mask: Number,
        thousandsSeparator: ",",
        radix: ".",
        scale: 2,
        signed: false,
        min: min,
        max: max,
      });

      // Đồng bộ giá trị ban đầu từ externalValue
      if (externalValue) {
        maskRef.current.value = externalValue;
      }

      maskRef.current.on("accept", () => {
        const rawValue = maskRef.current!.unmaskedValue;
        onChange?.({
          target: { value: rawValue },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      return () => {
        maskRef.current?.destroy();
      };
    }
  }, [min, max, externalValue, onChange]);

  // Hàm tăng giá trị
  const handleIncrement = useCallback(() => {
    if (!maskRef.current) return;

    const currentValue = Number(maskRef.current.unmaskedValue) || 0;
    const newValue = Math.min(currentValue + step, max);

    const formattedValue = newValue.toFixed(2);
    maskRef.current.unmaskedValue = formattedValue;
    maskRef.current.updateValue();

    onChange?.({
      target: { value: formattedValue },
    } as React.ChangeEvent<HTMLInputElement>);
  }, [step, max, onChange]);

  // Hàm giảm giá trị
  const handleDecrement = useCallback(() => {
    if (!maskRef.current) return;

    const currentValue = Number(maskRef.current.unmaskedValue) || 0;
    const newValue = Math.max(currentValue - step, min);

    const formattedValue = newValue.toFixed(2);
    maskRef.current.unmaskedValue = formattedValue;
    maskRef.current.updateValue();

    onChange?.({
      target: { value: formattedValue },
    } as React.ChangeEvent<HTMLInputElement>);
  }, [step, min, onChange]);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-medium text-sm text-text-title">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <div className="flex flex-row items-center justify-between gap-2">
        <input
          ref={inputRef}
          id={id ?? name}
          name={name}
          type={type}
          placeholder={placeholder}
          className={`${
            className ?? ""
          } px-1 bg-input text-sm font-medium text-text-title placeholder:text-text-subtitle w-3/4 ${
            error ? "!border !border-red-500" : ""
          }`}
          autoComplete="off"
        />

        <div className="flex flex-row gap-2 w-1/4 items-center justify-end">
          <button
            type="button"
            onClick={handleDecrement}
            className="h-7 w-7 bg-gray-300 hover:bg-gray-400 rounded-lg flex justify-center items-center cursor-pointer transition-colors"
            disabled={Number(maskRef.current?.unmaskedValue || 0) <= min}
          >
            <FiMinus className="text-text-title" />
          </button>

          <button
            type="button"
            onClick={handleIncrement}
            className="h-7 w-7 bg-gray-300 hover:bg-gray-400 rounded-lg flex justify-center items-center cursor-pointer transition-colors"
            disabled={Number(maskRef.current?.unmaskedValue || 0) >= max}
          >
            <FiPlus className="text-text-title" />
          </button>
        </div>
      </div>

      {error && (
        <span className="text-red-500 text-xs font-medium">
          * {error.message}
        </span>
      )}
    </div>
  );
}

export default memo(InputOrderPrice);
