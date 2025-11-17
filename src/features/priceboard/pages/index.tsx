import { useState } from "react";

import { useAppDispatch, useAppSelector } from "../../../store/hook";
import { selectDetailSymbol } from "../../../store/slices/stock/selector";
import { setDetailSymbol } from "../../../store/slices/stock/slice";
import Board from "../components/board";
import MenuDashboard from "../components/menu-board";
import StockDetailModal from "../components/stock-detail";
import SynAnalysisPriceBoard from "../components/synthetic-analysis";

export default function PriceBoard() {
  const dispatch = useAppDispatch();

  const detailSymbol = useAppSelector(selectDetailSymbol);

  const [active, setActive] = useState<string>("vn30");

  const onChange = (id: string) => {
    setActive(id);
  };

  const handleCloseModalDetailSym = () => {
    dispatch(setDetailSymbol(""));
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="w-full h-[148px] flex flex-col gap-3">
        <SynAnalysisPriceBoard />
      </div>
      <div className="flex flex-col gap-3">
        <MenuDashboard active={active} onChange={onChange} />

        {/* Bảng giá */}
        <Board id={active} />
      </div>

      {/* Chi tiết mã chứng khoán */}
      {detailSymbol && (
        <StockDetailModal
          isOpen={detailSymbol ? true : false}
          onClose={() => handleCloseModalDetailSym()}
          symbol={detailSymbol || ""}
        />
      )}
    </div>
  );
}
