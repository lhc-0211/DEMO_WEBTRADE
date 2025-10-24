import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import type { FieldError } from "react-hook-form";
import { IoIosArrowDown } from "react-icons/io";
import { getColorTypeAcc } from "../../utils";

interface Option {
  accCode: string;
  accType: string;
  type: string;
  isDisable?: boolean;
}

interface Props {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  opts: Option[];
  disabled?: boolean;
  className?: string;
  error?: FieldError;
}

const SelectAccount: React.FC<Props> = ({
  value,
  onChange,
  placeholder = "Chọn tài khoản",
  opts,
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
      console.time("mousedownHandler");
      if (
        showRef.current &&
        !showRef.current.contains(event.target as Node) &&
        showSelect
      ) {
        setShowSelect(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [showSelect]);

  // Update selected option
  useEffect(() => {
    const opt = _.find(opts, (o) => o.accCode === value);
    setSelected(opt || null);
  }, [value, opts]);

  const handleSelect = (val: string, isDisable?: boolean) => {
    if (isDisable) return;
    setShowSelect(false);
    onChange(val);
  };

  return (
    <div ref={showRef} className={`relative ${className}`}>
      <div
        className={`h-full flex items-center justify-between gap-1 px-3 rounded-2xl border cursor-pointer text-text-body text-xs ${
          disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-neutral-800"
        } ${showSelect ? "border-yellow-500" : "border-neutral-700"} ${
          error ? "!border !border-red-500" : ""
        }`}
        onClick={() => !disabled && setShowSelect((s) => !s)}
      >
        <div className="flex items-center gap-2">
          <span className={"text-text-body text-xs"}>
            {selected ? `TK-${selected.accCode}` : placeholder}
          </span>
          {selected && (
            <span
              className={`py-[2px] px-[6px] rounded-full text-[10px] ${getColorTypeAcc(
                selected.type
              )}`}
            >
              {selected.accType}
            </span>
          )}
        </div>
        <IoIosArrowDown
          className={`transition-transform duration-200 ${
            showSelect ? "rotate-180" : ""
          }`}
        />
      </div>

      {showSelect && (
        <ul
          className="absolute left-0 top-full mt-1 w-full z-20 bg-dark-blue rounded-lg border border-none shadow-lg animate-fadeInDown"
          ref={showRef}
        >
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
            {opts.map((item) => (
              <li
                key={item.accCode}
                onClick={() => handleSelect(item.accCode, item.isDisable)}
                className={`px-3 mt-1 py-2 rounded-md cursor-pointer flex items-center gap-3 text-text-body text-xs ${
                  value === item.accCode
                    ? "bg-DTND-500"
                    : "hover:bg-DTND-500 hover:translate-x-[2px]"
                } ${item.isDisable ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span>TK-{item.accCode}</span>
                <span
                  className={`py-[2px] px-[6px] rounded-full text-[10px] ${getColorTypeAcc(
                    item.type
                  )}`}
                >
                  {item.accType}
                </span>
              </li>
            ))}
          </div>
        </ul>
      )}
    </div>
  );
};

export default SelectAccount;
