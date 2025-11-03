import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { type FieldError, type UseFormRegisterReturn } from "react-hook-form";
import { LuSearch, LuX } from "react-icons/lu";

type InputSearchProps = {
  label?: string;
  placeholder?: string;
  error?: FieldError;
  registration?: UseFormRegisterReturn;
  className?: string;
  defaultValue?: string;
  onSearch?: (value: string) => void; // callback khi Enter hoặc click icon
  debounceTime?: number; // thời gian chờ khi nhập
};

export default function InputSearchField({
  placeholder,
  error,
  registration,
  className,
  defaultValue = "",
  onSearch,
  debounceTime = 0,
}: InputSearchProps) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  // debounce search khi gõ
  useEffect(() => {
    if (!debounceTime || !onSearch) return;
    const handler = setTimeout(() => {
      onSearch(value.trim());
    }, debounceTime);
    return () => clearTimeout(handler);
  }, [value, debounceTime, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSearch) {
        onSearch(value.trim());
      }
    },
    [onSearch, value]
  );

  const handleClear = useCallback(() => {
    setValue("");
    onSearch?.("");
  }, [onSearch]);

  return (
    <motion.div
      animate={{ width: open ? 250 : 30 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`px-2 h-9! p-0.5 flex items-center justify-center bg-input  rounded-md ${
        open
          ? "focus-within:border! focus-within:border-yellow-500! focus-within:shadow-[0_0_0_2px_rgba(250,204,21,0.3)]!"
          : "p-2 hover:bg-gray-300/60"
      }  ${error ? "border! border-red-500!" : ""}`}
    >
      {open && (
        <motion.input
          type="text"
          placeholder={placeholder ?? "Nhập từ khóa tìm kiếm..."}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`${
            className ?? ""
          } border-none bg-input text-sm font-medium text-text-title placeholder:text-text-subtitle w-full caret-DTND-200`}
          {...registration}
          autoComplete="off"
          autoFocus
        />
      )}

      {/* icon search */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          onSearch?.(value.trim());
        }}
        className=" text-text-title hover:text-yellow-500"
      >
        {value ? (
          <LuX onClick={handleClear} />
        ) : (
          <LuSearch className="cursor-pointer" />
        )}
      </button>

      {/* hiển thị lỗi */}
      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium">{error.message}</p>
      )}
    </motion.div>
  );
}
