import { useAppSelector } from "../../../../../store/hook";
import { selectDealData } from "../../../../../store/slices/stock/selector";
import TableAsk from "./TableAsk";
import TableBid from "./TableBid";
import TableMatch from "./TableMatch";

export default function PriceBoardDeal() {
  const dealData = useAppSelector(selectDealData);

  return (
    <div className="grid grid-cols-4 gap-5">
      {/* Bên mua */}
      <div className="col-span-1">
        <TableBid />
      </div>

      {/* Khớp lệnh */}
      <div className="col-span-2">
        <TableMatch data={dealData ? dealData["38"] : []} />
      </div>

      {/* Bên bán */}
      <div className="col-span-1">
        <TableAsk />
      </div>
    </div>
  );
}
