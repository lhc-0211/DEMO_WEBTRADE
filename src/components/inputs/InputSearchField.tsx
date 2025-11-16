import { motion } from "framer-motion";
import { useState } from "react";
import { type FieldError, type UseFormRegisterReturn } from "react-hook-form";
import { LuSearch } from "react-icons/lu";
import type { ValueSelect } from "../../types";

type InputSearchProps = {
  placeholder?: string;
  name?: string;
  error?: FieldError;
  registration?: UseFormRegisterReturn;
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  typeTrans?: "left" | "right"; //left mở từ trái sang phải <-> right ngược lại;
  otp?: ValueSelect[];
};

export default function InputSearchField({
  placeholder,
  name,
  error,
  className,
  onChange,
  value,
  typeTrans = "right",
  registration,
}: InputSearchProps) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      animate={{ width: open ? 160 : 30 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`px-2 h-9! p-0.5 flex ${
        typeTrans === "left" ? "flex-row-reverse gap-1" : ""
      } items-center justify-center bg-input rounded-md ${
        open
          ? "focus-within:border! focus-within:border-yellow-500! focus-within:shadow-[0_0_0_2px_rgba(250,204,21,0.3)]!"
          : "p-2 hover:bg-gray-300/60"
      }  ${error ? "border! border-red-500!" : ""}`}
    >
      {open && (
        <motion.input
          type="text"
          name={name}
          {...registration}
          value={value}
          placeholder={placeholder ?? "Nhập từ khóa tìm kiếm..."}
          className={`${
            className ?? ""
          } border-none bg-input text-sm font-medium text-text-title placeholder:text-text-subtitle w-full caret-DTND-200`}
          onChange={onChange}
          autoComplete="off"
          autoFocus
        />
      )}

      {/* icon search */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
        }}
        className=" text-text-title hover:text-yellow-500"
      >
        <LuSearch className="cursor-pointer" />
      </button>

      {/* hiển thị lỗi */}
      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium">{error.message}</p>
      )}
    </motion.div>
  );
}
