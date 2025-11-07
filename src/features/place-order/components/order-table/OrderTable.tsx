import { useState } from "react";
import type { typeTableActive } from "../../../../types/placeOrder";
import OrderHisOvertime from "./OrderHisOvertime";
import OrderHisTable from "./OrderHisTable";
import OrderSearchForm from "./OrderSearchForm";

export default function OrderTable() {
  const [tabActive, setTabActive] = useState<typeTableActive>("ORDER");

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex">
        <div className="flex mr-auto">
          <div
            className={`flex items-center h-9 py-1 px-3 cursor-pointer ml-2 gap-2 text-sm rounded-lg hover:bg-input ${
              tabActive === "ORDER" ? "bg-input" : ""
            }`}
            onClick={() => setTabActive("ORDER")}
          >
            Sổ lệnh
          </div>
          <div
            className={`flex items-center h-9 py-1 px-3 cursor-pointer ml-2 gap-2 text-sm rounded-lg hover:bg-input ${
              tabActive === "ORDER_OVERTIME" ? "bg-input" : ""
            }`}
            onClick={() => setTabActive("ORDER_OVERTIME")}
          >
            Sổ lệnh ngoài giờ
          </div>
          {/* <div
            className={`flex items-center h-9 py-1 px-3 cursor-pointer ml-2 gap-2 text-sm rounded-lg hover:bg-input ${
              tabActive === "CONDITIONAL_ORDER" ? "bg-input" : ""
            }`}
            onClick={() => setTabActive("CONDITIONAL_ORDER")}
          >
            Sổ lệnh điều kiện
          </div>
          <div
            className={`flex items-center h-9 py-1 px-3 cursor-pointer ml-2 gap-2 text-sm rounded-lg hover:bg-input ${
              tabActive === "INVESTMENT_LIST" ? "bg-input" : ""
            }`}
            onClick={() => setTabActive("INVESTMENT_LIST")}
          >
            Danh mục đầu tư
          </div> */}
        </div>
        <OrderSearchForm tabActive={tabActive} />
      </div>
      <div className="h-[calc(100%-52px)]">
        {tabActive === "ORDER" && <OrderHisTable />}
        {tabActive === "ORDER_OVERTIME" && <OrderHisOvertime />}
      </div>
    </div>
  );
}
