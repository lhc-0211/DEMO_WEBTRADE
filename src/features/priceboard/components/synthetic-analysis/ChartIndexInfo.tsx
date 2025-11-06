import { FaSquare } from "react-icons/fa";
import { FaArrowUpLong } from "react-icons/fa6";
import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import type { IndexData } from "../../../../types";
import { mapIdToNameIndex, numberFormat } from "../../../../utils";

interface Props {
  dataIndex: IndexData | undefined;
}

export default function ChartIndexInfo(props: Props) {
  const { dataIndex } = props;

  return (
    <div className="flex flex-col gap-2 w-2/5 p-1">
      {/* Name, change, changePC */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold text-text-title uppercase">
          {dataIndex && mapIdToNameIndex(dataIndex.id)}
        </span>
        <div
          // className={`flex flex-row gap-2 items-center whitespace-nowrap ${dataIndex.status}`}
          className={`flex flex-row gap-2 items-center whitespace-nowrap`}
        >
          <div className="p-0.5 rounded grid place-items-center bg-status-index">
            <FaArrowUpLong className=" w-3 h-3" />
          </div>{" "}
          <div className="flex flex-row gap-[5px] items-center">
            <span className="text-[10px] font-semibold">
              {dataIndex && numberFormat(dataIndex.value)}
            </span>
            <span className="text-[10px] font-semibold">
              {/* ({dataIndex.change} / {dataIndex.percentChange}%) */}({"-"} /{" "}
              {"-"}%)
            </span>
          </div>
        </div>
      </div>

      {/* value, volume */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-normal text-text-title">
          {/* {numberFormat(dataIndex.totalVolumeTraded)}{" "} */}
          {"-"} <span className="text-text-subtitle">CP</span>
        </span>
        <span className="text-xs font-normal text-text-title">
          {/* {numberFormat(dataIndex.grossTradeAmt / 10e8)}{" "} */}
          {"-"} <span className="text-text-subtitle">Tỷ</span>
        </span>
      </div>

      {/* Mã tăng giảm, phiên */}
      <div className="flex flex-col gap-1">
        <div className="grid grid-cols-3">
          <span className="text-[10px] font-semibold text-stock-text-green flex flex-row items-center justify-center whitespace-nowrap">
            <TiArrowSortedUp className="w-3 h-3" />
            <span>
              {dataIndex && dataIndex.up}{" "}
              <span className="text-stock-text-purple">
                {/* ( {dataIndex.fluctuationUpperLimitIssueCount}) */}( - )
              </span>
            </span>
          </span>
          <span className="text-[10px] font-semibold text-stock-text-yellow flex flex-row items-center justify-center whitespace-nowrap">
            <FaSquare className="w-[7px] h-[7px] mr-0.5" />
            <span>{dataIndex && dataIndex.noChange}</span>
          </span>
          <span className="text-[10px] font-semibold text-stock-text-red flex flex-row items-center justify-center whitespace-nowrap">
            <TiArrowSortedDown className="w-3 h-3" />
            <span>
              {dataIndex && dataIndex.down}{" "}
              <span className="text-stock-text-blue-100">
                {/* ({dataIndex.fluctuationLowerLimitIssueCount}) */}( - )
              </span>
            </span>
          </span>
        </div>
        <ul className="list-disc text-[10px] font-medium text-text-title ml-4">
          {/* <li className="">{getStatusIndex(dataIndex.tradingSessionId)}</li> */}
          <li className="">{"-"}</li>
        </ul>
      </div>
    </div>
  );
}
