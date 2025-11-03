import { useForm } from "react-hook-form";
import InputSearchField from "../../../../components/inputs/InputSearchField";

type FormValues = {
  keyword: string;
};

export default function OrderSearchForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    console.log("Tìm kiếm:", data.keyword);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      <InputSearchField
        placeholder="Nhập mã tìm kiếm..."
        registration={register("keyword", {
          required: "Vui lòng nhập từ khóa tìm kiếm",
        })}
        error={errors.keyword}
        className="placeholder:text-xs!"
      />
    </form>
  );
}
