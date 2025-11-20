import _ from "lodash";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import InputSearchFieldStock from "../../../../components/inputs/InputSearchFieldStock";
import { usePrevious } from "../../../../hooks/usePrevious";
import { socketClient } from "../../../../services/socket";
import { useAppDispatch } from "../../../../store/hook";
import {
  setListStockByIdFromCache,
  setScrollToSymbol,
} from "../../../../store/slices/priceboard/slice";
import type { Favorite } from "../../../../types";

type FormSearchStockValues = {
  stock: {
    label: string;
    value: string;
    post_to: string;
  } | null;
};

const FormSearchStock = ({ active }: { active: string }) => {
  const dispatch = useAppDispatch();
  const { control, setValue, watch } = useForm<FormSearchStockValues>();

  const stock = watch("stock");

  const preStock = usePrevious(stock);

  useEffect(() => {
    if (stock && active.startsWith("fav_") && !_.isEqual(stock, preStock)) {
      const stored = localStorage.getItem("favorites");
      if (!stored) return;

      const favorites = JSON.parse(stored) as Favorite[];
      const favorite = favorites.find((f) => f.id === active);

      if (favorite) {
        // Nếu symbol chưa có trong danh mục
        if (!favorite.symbols.includes(stock.value)) {
          const symbol = `${stock.value}:G1:${stock.post_to}`;

          const newSymbols = [...favorite.symbols, symbol];
          favorite.symbols = newSymbols;

          // Cập nhật lại localStorage
          localStorage.setItem("favorites", JSON.stringify(favorites));

          // Gửi symbols lên Redux
          dispatch(setListStockByIdFromCache(active, newSymbols));

          // Subscribe socket
          socketClient.subscribe({
            symbols: [symbol],
          });
        }
      }
    }
    if (stock) {
      // Bắn thông báo cho bảng giá scroll
      const symbol = `${stock.value}:G1:${stock.post_to}`;

      dispatch(setScrollToSymbol(symbol));
    }

    setValue("stock", null);
  }, [stock, active, preStock, setValue, dispatch]);

  return (
    <form className="h-full flex items-center">
      <Controller
        name="stock"
        control={control}
        rules={{ required: "Vui lòng chọn mã chứng khoán" }}
        render={({ field, fieldState }) => (
          <div>
            <InputSearchFieldStock
              value={field.value}
              onChange={field.onChange}
              placeholder="Tìm kiếm mã"
              className="w-70!"
            />
            {fieldState.error && (
              <p className="text-red-500 text-xs mt-1">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
    </form>
  );
};

export default FormSearchStock;
