import { usePerfectScrollbar } from "../../hooks/usePerfectScrollbar.ts";
import OrderForm from "./components/order-form/OrderForm.tsx";
import OrderTable from "./components/order-table/OrderTable.tsx";

export default function PlaceOrder() {
  const { containerRef } = usePerfectScrollbar();

  return (
    <div
      className="flex flex-col w-full h-[calc(var(--app-height)-64px)] relative gap-4 hide-scrollbar"
      ref={containerRef}
    >
      <div className="w-full flex items-stretch max-h-[728px]">
        <div className="flex-1 min-w-0 "></div>
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
