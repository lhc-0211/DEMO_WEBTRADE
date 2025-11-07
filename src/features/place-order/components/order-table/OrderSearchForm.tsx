import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { RiResetLeftLine } from "react-icons/ri";
import Button from "../../../../components/common/Button";
import InputSearchField from "../../../../components/inputs/InputSearchField";
import SelectField from "../../../../components/inputs/SelectField";
import { ArrStatusOrderBook } from "../../../../configs";
import { useDebounce } from "../../../../hooks/useDebounce";
import { useAppDispatch, useAppSelector } from "../../../../store/hook";
import { selectAccountProfile } from "../../../../store/slices/client/selector";
import { fetchListOrdersIndayRequest } from "../../../../store/slices/place-order/slice";
import type {
  FetchOrdersIndayParams,
  typeTableActive,
} from "../../../../types/placeOrder";

type FormValues = {
  stockId: string;
  status: string;
};

export default function OrderSearchForm({
  tabActive,
}: {
  tabActive: typeTableActive;
}) {
  const dispatch = useAppDispatch();

  const accountProfile = useAppSelector(selectAccountProfile);

  const { handleSubmit, setValue, watch, control } = useForm<FormValues>({
    defaultValues: {
      stockId: "",
      status: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    const payload: FetchOrdersIndayParams = {
      accountCode: accountProfile?.cAccountDefault || "",
      type: tabActive === "ORDER_OVERTIME" ? "4" : "1",
    };

    if (data.stockId) payload.symbol = data.stockId;
    if (data.status) payload.orderStatus = data.status;

    dispatch(fetchListOrdersIndayRequest(payload));
  };

  const stockId = watch("stockId");
  const status = watch("status");

  const debouncedKeyword = useDebounce(stockId, 400);
  const debouncedStatus = useDebounce(status, 400);

  useEffect(() => {
    const values = { stockId: debouncedKeyword, status: debouncedStatus };
    onSubmit(values);
  }, [debouncedKeyword, debouncedStatus, handleSubmit]);

  const handleResetForm = () => {
    setValue("stockId", "");
    setValue("status", "");
  };

  return (
    <form className="flex flex-row gap-1 items-center">
      {(stockId || status) && (
        <Button
          variant="close"
          className="h-9 px-2! rounded-md! bg-input!"
          onClick={() => {
            handleResetForm();
          }}
        >
          <RiResetLeftLine className="w-4 h-4" />
        </Button>
      )}
      {/* --- Ô tìm kiếm --- */}
      <div className="flex-1">
        <Controller
          name="stockId"
          control={control}
          rules={{ required: "Vui lòng chọn mã chứng khoán" }}
          render={({ field }) => (
            <div>
              <InputSearchField
                onChange={field.onChange}
                placeholder="Nhập mã tìm kiếm..."
                className="placeholder:text-xs!"
                value={field.value}
              />
            </div>
          )}
        />
      </div>

      {/* --- Select trạng thái --- */}
      <div className="w-40">
        <SelectField
          value={status}
          onChange={(val) => setValue("status", val, { shouldValidate: true })}
          options={ArrStatusOrderBook}
          placeholder="Trạng thái"
          className="h-9!"
        />
      </div>
    </form>
  );
}
