import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { type FieldError, type UseFormRegisterReturn } from "react-hook-form";
import { LuSearch } from "react-icons/lu";

type InputProps = {
  label?: string;
  type?: string;
  placeholder?: string;
  error?: FieldError;
  registration?: UseFormRegisterReturn;
  className?: string;
};

export default function InputFieldSearchMaster({
  type = "text",
  placeholder,
  error,
  registration,
  className,
}: InputProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // click ngoài để đóng dropdown + input
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative flex flex-col w-max">
      <motion.div
        animate={{ width: open ? 160 : 30 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`px-2 h-9 flex items-center bg-input rounded-md ${
          open
            ? "focus-within:border focus-within:border-yellow-500 focus-within:shadow-[0_0_0_2px_rgba(250,204,21,0.3)]"
            : "hover:bg-gray-300/60"
        } ${error ? "border border-red-500" : ""}`}
      >
        {open && (
          <input
            type={type}
            placeholder={placeholder}
            className={`${
              className ?? ""
            } border-none text-sm font-medium text-text-title placeholder:text-text-subtitle w-full`}
            {...registration}
            autoFocus
            onFocus={() => setOpen(true)} // mở dropdown khi input focus
          />
        )}
        <button
          type="button"
          onClick={() => setOpen(!open)} // click icon toggle dropdown
          className="text-text-title hover:text-yellow-500"
        >
          <LuSearch />
        </button>
      </motion.div>

      {/* Dropdown list */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute grid place-items-center top-10 w-[500px] min-h-60 right-0 bg-dark-blue border border-gray-300 rounded-md shadow-lg z-50  overflow-auto"
          >
            Đang bí ý tưởng cho chức năng này
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
