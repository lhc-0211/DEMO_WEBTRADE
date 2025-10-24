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
  return (
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        className={`${
          className ?? ""
        } pl-4 pr-6 py-3 rounded-xl bg-input text-sm font-medium text-text-title placeholder:text-text-subtitle focus:outline-none focus:!border focus:!border-yellow-500 focus:!shadow-[0_0_0_2px_rgba(250,204,21,0.3)] caret-DTND-200 ${
          error ? "!border !border-red-500" : ""
        }`}
        {...registration}
        autoComplete="off"
      />
      <LuSearch className="absolute right-1 top-1/2 -translate-y-1/2" />
    </div>
  );
}
