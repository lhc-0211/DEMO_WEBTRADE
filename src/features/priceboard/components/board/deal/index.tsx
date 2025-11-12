import TableAsk from "./TableAsk";
import TableBid from "./TableBid";
import TableMatch from "./TableMatch";

// === PROPS ===
interface PriceBoardDealProps {
  boardId: string;
}

export default function PriceBoardDeal({ boardId }: PriceBoardDealProps) {
  console.log("boardId", boardId);

  return (
    <div className="grid grid-cols-4 gap-5">
      {/* Bên mua */}
      <div className="col-span-1">
        <TableBid />
      </div>

      {/* Khớp lệnh */}
      <div className="col-span-2">
        <TableMatch />
      </div>

      {/* Bên bán */}
      <div className="col-span-1">
        <TableAsk />
      </div>
    </div>
  );
}
