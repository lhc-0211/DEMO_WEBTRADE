import { type FieldError, type UseFormRegisterReturn } from "react-hook-form";

type InputProps = {
  label?: string;
  type?: string;
  placeholder?: string;
  error?: FieldError;
  registration?: UseFormRegisterReturn;
  className?: string;
  requied?: boolean;
};

export default function InputField({
  label,
  type = "text",
  placeholder,
  error,
  registration,
  className,
  requied,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-medium text-sm text-text-title">
          {label}
          {requied && <span className="text-red-500"> *</span>}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        className={`${
          className ?? ""
        } px-4 py-3 rounded-xl bg-input text-sm font-medium text-text-title placeholder:text-text-subtitle focus:outline-none focus:!border focus:!border-yellow-500 focus:!shadow-[0_0_0_2px_rgba(250,204,21,0.3)] caret-DTND-200 ${
          error ? "!border !border-red-500" : ""
        }`}
        {...registration}
        autoComplete="off"
      />

      {error && (
        <span className="text-red-500 text-xs font-medium">
          * {error.message}
        </span>
      )}
    </div>
  );
}
