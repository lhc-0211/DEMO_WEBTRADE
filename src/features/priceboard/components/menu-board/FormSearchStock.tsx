import { Controller, useForm } from "react-hook-form";
import { IoSearchOutline } from "react-icons/io5";
import AsyncSelect from "react-select/async";

type FormSearchStockValues = {
  stock: {
    label: string;
    value: string;
  } | null;
};

type StockSelect = {
  label: string;
  value: string;
};

const FormSearchStock = () => {
  const { control, handleSubmit } = useForm<FormSearchStockValues>();

  const stockOptions: any = [];

  const onSubmit = (data: FormSearchStockValues) => {
    console.log(data);
  };

  const filterColors = (inputValue: string) => {
    return stockOptions.filter((i: any) =>
      i.value.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const promiseOptions = (inputValue: string) =>
    new Promise<StockSelect[]>((resolve) => {
      setTimeout(() => {
        resolve(filterColors(inputValue));
      }, 1000);
    });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="h-full flex items-center"
    >
      <Controller
        name="stock"
        control={control}
        render={({ field }) => (
          <AsyncSelect
            {...field}
            cacheOptions
            defaultOptions
            loadOptions={promiseOptions}
            placeholder="Nhập mã tìm kiếm"
            noOptionsMessage={() => "Không có dữ liệu!"}
            loadingMessage={() => ""}
            formatOptionLabel={(option) => (
              <div className="grid grid-cols-[40px_auto] gap-1 items-center">
                <span className="font-semibold">{option.value}</span>
                <span className="text-gray-400">{option.label}</span>
              </div>
            )}
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
            onChange={() => {
              field.onChange(null);
            }}
            classNames={{
              control: ({ isFocused }) =>
                `!bg-surface !rounded-xl !min-h-10 !h-10 !text-text-title !text-sm w-[210px] ${
                  isFocused
                    ? "!border !border-yellow-400 !shadow-[0_0_0_2px_rgba(250,204,21,0.3)]"
                    : "!border !border-transparent"
                }`,
              placeholder: () => "!text-text-sutitle !text-sm",
              singleValue: () => "!text-text-title !text-sm ",
              menu: () =>
                " !z-[9999] !bg-surface !rounded-md !mt-1 transition-all duration-200 ease-out !opacity-100 !translate-y-0 animate-fadeInDown",
              option: ({ isFocused }) =>
                `px-2 !py-[2px] !text-xs !cursor-pointer ${
                  isFocused
                    ? "!bg-gray-700 !text-text-title"
                    : "!bg-surface !text-text-subtitle"
                }`,
              input: () => "!m-0 !p-0 !text-text-title !uppercase",
              valueContainer: () => "!h-7",
              noOptionsMessage: () =>
                "!text-text-title !text-xs !text-center !py-2",
              loadingMessage: () =>
                "!text-text-title !text-xs !text-center !py-2",
            }}
          />
        )}
      />
    </form>
  );
};

export default FormSearchStock;
