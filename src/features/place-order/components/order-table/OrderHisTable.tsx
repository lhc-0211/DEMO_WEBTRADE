import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import _ from "lodash";
import { memo, useEffect, useState } from "react";
import { FaPen, FaTrash } from "react-icons/fa";
import { usePrevious } from "../../../../hooks/usePrevious";
import { useAppDispatch, useAppSelector } from "../../../../store/hook";
import { selectAccountProfile } from "../../../../store/slices/client/selector";
import {
  selectListOrdersInday,
  selectListOrdersIndayStatus,
} from "../../../../store/slices/place-order/selector";
import { fetchListOrdersIndayRequest } from "../../../../store/slices/place-order/slice";
import OrderHisTableSkeleton from "./OrderHisTableSkeleton";

type Order = {
  time: string | number;
  side: string;
  symbol: string;
  price: string;
  volume: string;
  total: string;
  status: string;
};

const columns: ColumnDef<Order>[] = [
  {
    header: "LOẠI LỆNH",
    columns: [
      { header: "Thời gian đặt", accessorKey: "time" },
      { header: "Lệnh", accessorKey: "side" },
      { header: "Mã", accessorKey: "symbol" },
    ],
  },
  {
    header: "CHI TIẾT LỆNH",
    columns: [
      { header: "Giá đặt", accessorKey: "price" },
      { header: "KL đặt", accessorKey: "volume" },
      { header: "Giá trị đặt (₫)", accessorKey: "total" },
      { header: "Trạng thái", accessorKey: "status" },
    ],
  },
  {
    header: "THAO TÁC",
    columns: [
      {
        header: "Thao tác",
        id: "action",
        cell: ({ row }) => {
          const order = row.original;
          const canEdit = order.status === "Chờ khớp";
          const canCancel = order.status !== "Đã khớp";

          return (
            <div className="flex items-center justify-center gap-4">
              {canEdit && (
                <button
                  onClick={() => console.log("Sửa:", order)}
                  className="text-text-title hover:text-text-subtitle"
                  title="Sửa lệnh"
                >
                  <FaPen size={14} />
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => console.log("Hủy:", order)}
                  className="text-red-400 hover:text-red-300"
                  title="Hủy lệnh"
                >
                  <FaTrash size={14} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
  },
];

function OrderHisTable() {
  const dispatch = useAppDispatch();

  const listOrdersInday = useAppSelector(selectListOrdersInday);
  const { loading } = useAppSelector(selectListOrdersIndayStatus);
  const accountProfile = useAppSelector(selectAccountProfile);

  const [tableData, setTableData] = useState<Order[]>([]);

  const preListOrdersInday = usePrevious(listOrdersInday);

  useEffect(() => {
    if (!accountProfile || !accountProfile?.cAccountDefault) return;

    dispatch(
      fetchListOrdersIndayRequest({
        accountCode: accountProfile?.cAccountDefault || "",
      })
    );
  }, [accountProfile, dispatch]);

  useEffect(() => {
    if (
      !listOrdersInday ||
      _.isEqual(listOrdersInday, preListOrdersInday) ||
      listOrdersInday.length < 0
    )
      return;

    const tableData = listOrdersInday.map((item) => ({
      time: new Date(item.orderTime).toLocaleTimeString(), // convert timestamp -> HH:MM:SS
      side: item.side === "B" ? "Mua" : "Bán",
      symbol: item.shareCode,
      price: item.orderShowPrice || item.orderPrice.toLocaleString(),
      volume: item.orderVolume.toString(),
      total: (item.orderPrice * item.orderVolume).toLocaleString(),
      status:
        item.orderStatus === "P"
          ? "Chờ khớp"
          : item.orderStatus === "M"
          ? "Đã khớp"
          : "Đã hủy",
    }));

    setTableData(tableData);
  }, [listOrdersInday, preListOrdersInday]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return <OrderHisTableSkeleton />;
  }

  return (
    <div className="w-full h-[448px] overflow-auto rounded-md text-text-title text-xs">
      <table className="w-full border-collapse">
        <thead>
          {/* --- Hàng đầu: nhóm header --- */}
          {table.getHeaderGroups().map((headerGroup, index) => (
            <tr
              key={headerGroup.id}
              className={index === 0 ? "mb-2.5" : "h-10 "}
            >
              {headerGroup.headers.map((header) => {
                const headerText = String(header.column.columnDef.header);
                const groupClass =
                  headerText === "LOẠI LỆNH"
                    ? "bg-surface text-text-title text-[10px] font-medium rounded-md h-[22px]"
                    : headerText === "CHI TIẾT LỆNH"
                    ? "bg-surface text-text-title text-[10px] font-medium rounded-md h-[22px]"
                    : headerText === "THAO TÁC"
                    ? "bg-surface text-text-title text-[10px] font-medium rounded-md h-[22px]"
                    : "";

                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={`border-none px-2 py-1 text-center`}
                  >
                    <div
                      className={`${groupClass} flex items-center justify-center`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className=" hover:bg-surface">
              {row.getVisibleCells().map((cell) => {
                const accessorKey = (
                  cell.column.columnDef as { accessorKey?: keyof Order }
                )?.accessorKey;
                const value = cell.getValue();

                let customClass = "";

                switch (accessorKey) {
                  case "side":
                    customClass =
                      value === "Mua"
                        ? "text-green-400 font-semibold"
                        : "text-red-400 font-semibold";
                    break;

                  case "status":
                    customClass =
                      value === "Chờ khớp"
                        ? "text-yellow-400 font-semibold"
                        : "text-red-400 font-semibold";
                    break;

                  default:
                    break;
                }

                return (
                  <td
                    key={cell.id}
                    className={`px-2 h-9 text-center ${customClass}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(OrderHisTable);
