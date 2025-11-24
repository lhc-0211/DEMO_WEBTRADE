import _ from "lodash";
import { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import AsyncSelect from "react-select/async";
import { usePrevious } from "../../hooks/usePrevious";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { selectListBank } from "../../store/slices/client/selector";
import { fetchListBankRequest } from "../../store/slices/client/slice";
import type { BankDetail } from "../../types";
import { getBankLogo } from "../../utils";

export type OptionTypeBank = {
  label: string;
  value: string;
  bankCode?: string;
};

type InputSearchFieldProps = {
  value?: OptionTypeBank | null;
  onChange: (value: OptionTypeBank | null) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

export default function InputSearchFieldBank({
  value,
  onChange,
  placeholder = "Nhập ngân hàng tìm kiếm",
  className,
  autoFocus,
}: InputSearchFieldProps) {
  const dispatch = useAppDispatch();

  const listBank = useAppSelector(selectListBank);
  const prevListBank = usePrevious(listBank);

  const [bankOptions, setBankOptions] = useState<OptionTypeBank[]>([]);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    dispatch(fetchListBankRequest());
  }, [dispatch]);

  // Convert bank list -> OptionTypeBank
  const convertBankList = (data: BankDetail[]): OptionTypeBank[] =>
    data.map((item) => ({
      value: item.bankKey,
      label: item.bankName,
      bankCode: item.bankCode,
    }));

  useEffect(() => {
    if (!listBank || listBank.length === 0) return;
    if (_.isEqual(listBank, prevListBank)) return;

    setBankOptions(convertBankList(listBank));
  }, [listBank, prevListBank]);

  // Lọc ngân hàng
  const filterBanks = (inputValue: string) => {
    if (!inputValue) return bankOptions;
    return bankOptions.filter(
      (item) =>
        (item.value &&
          item.value?.toLowerCase().includes(inputValue.toLowerCase())) ||
        (item.label &&
          item.label?.toLowerCase().includes(inputValue.toLowerCase())) ||
        (item.bankCode &&
          item.bankCode?.toLowerCase().includes(inputValue.toLowerCase()))
    );
  };

  // Async search
  const promiseOptions = (inputValue: string) =>
    new Promise<OptionTypeBank[]>((resolve) => {
      setSearchInput(inputValue);
      setTimeout(() => {
        resolve(filterBanks(inputValue));
      }, 200);
    });

  // Highlight match
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${_.escapeRegExp(query)})`, "gi");
    const parts = text && text.split(regex);

    return parts
      ? parts.map((part, index) =>
          regex.test(part) ? (
            <span key={index} className="bg-yellow-400 text-black">
              {part}
            </span>
          ) : (
            part
          )
        )
      : "";
  };

  return (
    <AsyncSelect
      value={value}
      onChange={onChange}
      cacheOptions
      autoFocus={autoFocus}
      defaultOptions={bankOptions}
      loadOptions={promiseOptions}
      inputValue={searchInput}
      onInputChange={(val) => setSearchInput(val)}
      placeholder={placeholder}
      noOptionsMessage={() => "Không có dữ liệu!"}
      loadingMessage={() => ""}
      formatOptionLabel={(option, { context }) =>
        context === "value" ? (
          <span className="text-text-title uppercase px-2">{option.label}</span>
        ) : (
          <div className="flex flex-row gap-2 items-center">
            <div
              className="w-8 h-8 min-w-8 rounded-full bg-center bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url(${getBankLogo(option.bankCode || "")})`,
              }}
            />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-text-title">
                {highlightMatch(option.label, searchInput)}
              </span>
              <span className="text-text-subtitle text-xs flex gap-2">
                <span>Mã: {highlightMatch(option.value, searchInput)}</span>
                {option.bankCode && (
                  <span className="text-text-subtitle">
                    ({option.bankCode})
                  </span>
                )}
              </span>
            </div>
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
          `!bg-input !rounded-xl !min-h-9 !h-9 !text-xs ${
            isFocused
              ? "!border !border-yellow-400 !shadow-[0_0_0_2px_rgba(250,204,21,0.3)]"
              : "!border !border-transparent"
          } ${className ?? ""}`,
        placeholder: () => "!text-text-subtitle !text-sm px-2!",
        singleValue: () => "!text-text-title !text-sm",
        menu: () =>
          "!z-[9999] !bg-surface !rounded-md !mt-1 transition-all duration-200 ease-out animate-fadeInDown",
        option: ({ isFocused, isSelected }) =>
          `!cursor-pointer !text-xs !flex !items-center !px-3 !py-2.5 ${
            isSelected
              ? "!bg-DTND-500 !text-white"
              : isFocused
              ? "!bg-DTND-500/80 !text-white"
              : "!bg-surface !text-text-title hover:!bg-DTND-500 hover:!text-white"
          }`,
        input: () => "!m-0 !p-0 !text-text-title !px-2",
        valueContainer: () => "!h-7",
        noOptionsMessage: () => "!text-text-title !text-xs !text-center !py-2",
        loadingMessage: () => "!text-text-title !text-xs !text-center !py-2",
      }}
    />
  );
}
