import React, { useEffect, useRef, useState } from "react";
import type { FieldError } from "react-hook-form";
import { IoIosArrowDown } from "react-icons/io";

interface Option {
  value: string;
  label: string;
  subLabel?: string;
  colorClass?: string;
  disabled?: boolean;
}

interface Props {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: Option[];
  disabled?: boolean;
  className?: string;
  error?: FieldError;
}

const SelectField: React.FC<Props> = ({
  value,
  onChange,
  placeholder = "Chọn",
  options,
  disabled,
  className = "",
  error,
}) => {
  const [showSelect, setShowSelect] = useState(false);
  const [selected, setSelected] = useState<Option | null>(null);
  const showRef = useRef<HTMLDivElement>(null);

  // Click outside
  useEffect(() => {
    if (!showSelect) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (showRef.current && !showRef.current.contains(event.target as Node)) {
        setShowSelect(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [showSelect]);

  useEffect(() => {
    const opt = options.find((o) => o.value === value);
    setSelected(opt || null);
  }, [value, options]);

  const handleSelect = (opt: Option) => {
    if (opt.disabled) return;
    setShowSelect(false);
    onChange(opt.value);
  };

  return (
    <div ref={showRef} className={`relative ${className}`}>
      <div
        className={`h-full flex items-center justify-between gap-1 px-3 rounded-md border cursor-pointer text-text-body text-xs ${
          disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-neutral-800"
        } ${showSelect ? "border-yellow-500" : "border-neutral-700"} ${
          error ? "border-red-500!" : ""
        }`}
        onClick={() => !disabled && setShowSelect((s) => !s)}
      >
        <div className="flex items-center gap-2">
          <span className="text-text-body text-xs">
            {selected ? selected.label : placeholder}
          </span>
        </div>
        <IoIosArrowDown
          className={`transition-transform duration-200 ${
            showSelect ? "rotate-180" : ""
          }`}
        />
      </div>

      {showSelect && (
        <ul className="absolute left-0 top-full mt-1 w-full z-20 bg-dark-blue rounded-lg border border-none shadow-lg animate-fadeInDown">
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => handleSelect(opt)}
                className={`px-3 mt-1 py-2 rounded-md cursor-pointer flex items-center gap-3 text-text-body text-xs ${
                  value === opt.value
                    ? "bg-DTND-500"
                    : "hover:bg-DTND-500 hover:translate-x-0.5"
                } ${opt.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span>{opt.label}</span>
              </li>
            ))}
          </div>
        </ul>
      )}
    </div>
  );
};

export default SelectField;
