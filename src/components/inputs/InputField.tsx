import { useState } from "react";
import { type FieldError, type UseFormRegisterReturn } from "react-hook-form";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

type InputProps = {
  label?: string;
  type?: string;
  placeholder?: string;
  error?: FieldError;
  registration?: UseFormRegisterReturn;
  className?: string;
  requied?: boolean;
  typeInput?: "text" | "password";
  autoFocus?: boolean;
  disabled?: boolean;
};

export default function InputField({
  label,
  type = "text",
  placeholder,
  error,
  registration,
  className,
  requied,
  typeInput,
  autoFocus,
  disabled,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const renderType =
    typeInput === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1 relative">
      {label && (
        <label className="font-medium text-sm text-text-title">
          {label}
          {requied && <span className="text-red-500"> *</span>}
        </label>
      )}

      <input
        type={renderType}
        placeholder={placeholder}
        className={`${className ?? ""} 
          px-4 py-3 rounded-xl bg-input text-sm font-medium text-text-title placeholder:text-text-subtitle focus:outline-none focus:border! focus:border-yellow-500! focus:shadow-[0_0_0_2px_rgba(250,204,21,0.3)]! caret-DTND-200 ${
            error ? "border! border-red-500!" : ""
          }`}
        {...registration}
        autoComplete="off"
        autoFocus={autoFocus}
        disabled={disabled}
      />

      {/*  Icon toggle password */}
      {typeInput === "password" && (
        <span
          onClick={() => setShowPassword((v) => !v)}
          className="absolute top-2/3 right-3 -translate-y-1/2 cursor-pointer text-text-subtitle hover:text-text-body"
        >
          {!showPassword ? <IoMdEyeOff size={22} /> : <IoMdEye size={22} />}
        </span>
      )}

      {error && (
        <span className="text-red-500 text-xs font-medium">
          * {error.message}
        </span>
      )}
    </div>
  );
}
