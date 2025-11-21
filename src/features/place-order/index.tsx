import OrderHisDetail from "../../components/stock/OrderHisDetail.tsx";
import { usePerfectScrollbar } from "../../hooks/usePerfectScrollbar.ts";
import OrderForm from "./components/order-form/OrderForm.tsx";
import OrderTable from "./components/order-table/OrderTable.tsx";

export default function PlaceOrder() {
  const { containerRef } = usePerfectScrollbar();
  const { containerRef: containerRef2 } = usePerfectScrollbar();

  return (
    <div
      className="flex flex-col w-full h-[calc(var(--app-height)-64px)] relative gap-4 hide-scrollbar"
      ref={containerRef}
    >
      <div className="w-full flex gap-1 items-stretch max-h-[728px]">
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-3 gap-1 w-full h-full">
            <div className="col-span-2 bg-surface rounded-md">
              <h2 className="text-sm font-medium text-text-title p-2">
                Chart stock
              </h2>
            </div>
            <div
              className="col-span-1 flex flex-col gap-1 h-full rounded-md"
              ref={containerRef2}
            >
              <div className="w-full bg-surface rounded-md p-2 h-[200px]">
                <h2 className="text-sm font-medium text-text-title">
                  Chờ mua / bán
                </h2>
              </div>
              <div className="w-full bg-surface rounded-md p-2 h-[200px]">
                <h2 className="text-sm font-medium text-text-title">
                  Bước giá
                </h2>
              </div>
              <div className="col-span-1 bg-surface rounded-md p-2 flex-1">
                <h2 className="text-sm font-medium text-text-title">
                  Chi tiết khớp lệnh
                </h2>
                <div className="h-[calc(var(--app-height)-320px-9px-8px-161px-161px)]">
                  <OrderHisDetail symbol={"ACB:G1:STO"} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-full min-h-[580px] min-w-[361px]">
          <OrderForm />
        </div>
      </div>
      <div className="w-full h-[500px] ">
        <OrderTable />
      </div>
    </div>
  );
}
