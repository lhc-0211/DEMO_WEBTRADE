import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../store/hook";

import { setListStockByIdFromCache } from "../../../store/slices/priceboard/slice";
import { fetchListStockById } from "../../../store/slices/priceboard/thunks";
import Board from "../components/board";
import MenuDashboard from "../components/menu-board";
import SynAnalysisPriceBoard from "../components/synthetic-analysis";

export default function PriceBoard() {
  const dispatch = useAppDispatch();

  const [active, setActive] = useState<string>("vn30");

  useEffect(() => {
    if (!active) return;

    const cacheKey = `stocks_${active}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      dispatch(setListStockByIdFromCache(parsed));
    } else {
      dispatch(fetchListStockById(active))
        .unwrap()
        .then((data) => {
          localStorage.setItem(cacheKey, JSON.stringify(data));
        })
        .catch((error) => console.error("Lỗi lấy data:", error));
    }
  }, [active, dispatch]);

  const onChange = (id: string) => {
    setActive(id);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="w-full h-[148px] flex flex-col gap-3">
        <SynAnalysisPriceBoard />
      </div>
      <div className="flex flex-col gap-3">
        <MenuDashboard active={active} onChange={onChange} />

        {/* Bảng giá */}
        <Board />
      </div>
    </div>
  );
}
