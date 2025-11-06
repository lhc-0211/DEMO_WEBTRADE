import { useForm } from "react-hook-form";
import InputSearchField from "../../../../components/inputs/InputSearchField";
import SelectField from "../../../../components/inputs/SelectField";
import { getColorTypeAcc } from "../../../../utils";

type FormValues = {
  keyword: string;
  account: string;
};

export default function OrderSearchForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      keyword: "",
      account: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Tìm kiếm:", data);
  };

  const account = watch("account");

  const accountOptions = [
    {
      value: "001",
      label: "TK-001",
      subLabel: "Margin",
      colorClass: getColorTypeAcc("MARGIN"),
    },
    {
      value: "002",
      label: "TK-002",
      subLabel: "Thường",
      colorClass: getColorTypeAcc("NORMAL"),
    },
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-row gap-1 items-center"
    >
      {/* --- Select tài khoản --- */}
      <div className="w-40">
        <SelectField
          value={account}
          onChange={(val) => setValue("account", val)}
          options={accountOptions}
          placeholder="Trạng thái"
          className="h-9!"
        />
      </div>

      {/* --- Ô tìm kiếm --- */}
      <div className="flex-1">
        <InputSearchField
          placeholder="Nhập mã tìm kiếm..."
          registration={register("keyword", {
            required: "Vui lòng nhập từ khóa tìm kiếm",
          })}
          error={errors.keyword}
          className="placeholder:text-xs!"
        />
      </div>
    </form>
  );
}
