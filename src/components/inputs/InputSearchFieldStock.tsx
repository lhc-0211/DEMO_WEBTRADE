import _ from "lodash";
import { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import AsyncSelect from "react-select/async";
import { usePrevious } from "../../hooks/usePrevious";
import { useAppSelector } from "../../store/hook";
import { selectListShareStock } from "../../store/slices/place-order/selector";
import type { FetchShareStockItem } from "../../types/placeOrder";

export type OptionType = {
  label?: string;
  value: string;
  post_to?: string;
};

type InputSearchFieldProps = {
  value: OptionType | null;
  onChange: (value: OptionType | null) => void;
  placeholder?: string;
  className?: string;
  typeInput?: string;
  autoFocus?: boolean;
};

export default function InputSearchFieldStock({
  value,
  onChange,
  placeholder = "Nhập mã tìm kiếm",
  className,
  autoFocus,
}: InputSearchFieldProps) {
  const listShareStock = useAppSelector(selectListShareStock);
  const preListShareStock = usePrevious(listShareStock);

  const [stockOptions, setStockOptions] = useState<OptionType[]>([]);
  const [searchInput, setSearchInput] = useState<string>(""); // lưu input để highlight

  // convert stock list
  const convertShareList = (data: FetchShareStockItem[]): OptionType[] =>
    data.map((item) => ({
      label: item.fullName,
      value: item.shareCode,
      post_to: item.tradeTable,
    }));

  useEffect(() => {
    if (!listShareStock || listShareStock.length === 0) return;
    if (_.isEqual(listShareStock, preListShareStock)) return;

    const converted = convertShareList(listShareStock);
    setStockOptions(converted);
  }, [listShareStock, preListShareStock]);

  // Filter stock theo input
  const filterStocks = (inputValue: string) => {
    if (!inputValue) return stockOptions;
    return stockOptions.filter(
      (i) =>
        i.value.toLowerCase().includes(inputValue.toLowerCase()) ||
        i.label?.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const promiseOptions = (inputValue: string) =>
    new Promise<OptionType[]>((resolve) => {
      setSearchInput(inputValue);
      setTimeout(() => {
        resolve(filterStocks(inputValue));
      }, 200);
    });

  // Hàm highlight chữ match
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${_.escapeRegExp(query)})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-400 text-black">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <AsyncSelect
      value={value}
      onChange={onChange}
      cacheOptions
      autoFocus={autoFocus}
      defaultOptions={stockOptions}
      loadOptions={promiseOptions}
      inputValue={searchInput}
      onInputChange={(val) => setSearchInput(val)}
      placeholder={placeholder}
      noOptionsMessage={() => "Không có dữ liệu!"}
      loadingMessage={() => ""}
      formatOptionLabel={(option, { context }) =>
        context === "value" ? (
          <span className="font-semibold text-text-title uppercase">
            {option.value}
          </span>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-text-title uppercase">
              {highlightMatch(option.value, searchInput)}
              {option.post_to && (
                <span className="ml-1 text-text-subtitle font-medium">
                  {option.post_to}
                </span>
              )}
            </span>
            <span className="text-text-subtitle text-xs">
              {option.label ? highlightMatch(option.label, searchInput) : ""}
            </span>
          </div>
        )
      }
      components={{
        DropdownIndicator: (props) => (
          <div
            {...props.innerProps}
            className="p-1 text-text-subtitle hover:text-text-title"
          >
            <IoSearchOutline size={20} />
          </div>
        ),
        IndicatorSeparator: () => null,
      }}
      classNames={{
        control: ({ isFocused }) =>
          `!bg-input !rounded-xl !min-h-9 !h-9 !text-text-title !text-xs !w-[10px] ${
            isFocused
              ? "!border !border-yellow-400 !shadow-[0_0_0_2px_rgba(250,204,21,0.3)]"
              : "!border !border-transparent"
          } ${className ?? ""}`,
        placeholder: () => "!text-text-subtitle !text-xs",
        singleValue: () => "!text-text-title !text-xs",
        menu: () =>
          "!z-[9999] !bg-surface !rounded-md !mt-1 transition-all duration-200 ease-out !w-[280px] !opacity-100 animate-fadeInDown",
        option: ({ isFocused, isSelected }) =>
          `!cursor-pointer !text-xs !flex !items-center !px-3 !py-2.5 transition-colors duration-150 ${
            isSelected
              ? "!bg-DTND-500 !text-white"
              : isFocused
              ? "!bg-DTND-500/80 !text-white"
              : "!bg-surface !text-text-title hover:!bg-DTND-500 hover:!text-white"
          }`,
        input: () => "!m-0 !p-0 !text-text-title !uppercase",
        valueContainer: () => "!h-7 !w-[130px]",
        noOptionsMessage: () => "!text-text-title !text-xs !text-center !py-2",
        loadingMessage: () => "!text-text-title !text-xs !text-center !py-2",
      }}
    />
  );
}
