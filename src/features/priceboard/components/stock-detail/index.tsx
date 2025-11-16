import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import Modal from "react-modal";
import Button from "../../../../components/common/Button";
import InputSearchField from "../../../../components/inputs/InputSearchField";
import { useAppSelector } from "../../../../store/hook";
import { selectListShareStock } from "../../../../store/slices/place-order/selector";
import { selectSnapshotsBySymbols } from "../../../../store/slices/stock/selector";
import type { FetchShareStockItem } from "../../../../types/placeOrder";
import {
  formatPrice,
  formatVolPrice,
  getBgColorStock,
  numberFormat,
} from "../../../../utils";

type FormSearchStockValues = {
  stock: string;
};

const customStyles = {
  content: {
    top: "50%",
    transform: "translateY(-50%)",
    bottom: "auto",
    left: "calc( 50% - 682px )",
    height: "auto",
    width: "1364px",
    padding: "0",
    borderWidth: "0px",
    overflow: "inherit",
    borderRadius: "16px",
    background: "transparent",
  },
};

export default function StockDetailModal({
  isOpen,
  onClose,
  symbol,
}: {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
}) {
  const { control } = useForm<FormSearchStockValues>();

  const listShareStock = useAppSelector(selectListShareStock);
  const snapshots = useAppSelector((state) =>
    selectSnapshotsBySymbols(state, symbol.split(","))
  );

  const [detailStock, setDetailStock] = useState<FetchShareStockItem | null>(
    null
  );

  useEffect(() => {
    if (listShareStock) {
      const detail = listShareStock.find(
        (item) => item.shareCode === symbol?.split(":")[0]
      );
      if (detail) {
        setDetailStock(detail);
      }
    }
  }, [listShareStock, symbol]);

  console.log("snapshots", snapshots);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          contentLabel="Chi tiết mã chứng khoán"
          ariaHideApp={false}
          style={customStyles}
          closeTimeoutMS={350}
          overlayClassName="ReactModal__Overlay"
          className="ReactModal__Content"
        >
          <motion.div
            key="stock-detail-modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col gap-4 bg-cover bg-no-repeat bg-center rounded-xl"
          >
            <div className="flex flex-col gap-6 p-2 rounded-xl border border-border bg-background-primary">
              {/* === Header === */}
              <div className={`flex flex-row items-center justify-between `}>
                <form className="h-full flex flex-row gap-4 items-center">
                  <Controller
                    name="stock"
                    control={control}
                    rules={{ required: "Vui lòng chọn mã chứng khoán" }}
                    render={({ field }) => (
                      <div>
                        <InputSearchField
                          name="stock"
                          onChange={field.onChange}
                          placeholder="Nhập mã tìm kiếm..."
                          className="placeholder:text-xs!"
                          value={field.value}
                          typeTrans="left"
                        />
                      </div>
                    )}
                  />
                  <div className="flex flex-row items-center justify-center gap-3">
                    <div className="flex flex-row items-center justify-center gap-1">
                      <span className="text-sm font-medium text-text-title">
                        {detailStock?.shareCode || symbol?.split(":")[0]}
                      </span>
                      {detailStock && (
                        <span className="text-xs font-normal text-text-body">
                          ( {detailStock?.tradeTable} ) |{" "}
                          {detailStock?.fullName}
                        </span>
                      )}
                    </div>
                  </div>
                </form>
                <div className="flex flex-row gap-2">
                  <Button variant="primary">Đặt lệnh</Button>
                  <div
                    className="cursor-pointer p-1 hover:bg-gray-300 rounded-full"
                    onClick={onClose}
                  >
                    <IoClose className="w-7 h-7 text-text-subtitle cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* === Thông tin stock === */}
              <div className="w-1/2">
                <div className="flex justify-between pb-1">
                  <div
                    className={`text-color-down flex pr-3 w-44 ${snapshots[symbol]?.trade?.["13"]}`}
                  >
                    <div
                      className={`text-xl flex justify-center items-center p-1 rounded-lg ${getBgColorStock(
                        snapshots[symbol]?.trade?.["13"] || "r"
                      )}`}
                    >
                      <div> {formatPrice(snapshots[symbol]?.trade?.[8])}</div>
                    </div>
                    <div className="flex flex-col items-end pl-2 justify-center text-sm">
                      <div>
                        {" "}
                        {snapshots[symbol]?.trade?.["11"] &&
                        snapshots[symbol]?.trade?.["11"] !== 0
                          ? formatPrice(snapshots[symbol]?.trade?.["11"])
                          : ""}
                      </div>
                      <div>
                        {snapshots[symbol]?.trade?.["12"]
                          ? numberFormat(
                              snapshots[symbol]?.trade?.["12"],
                              2,
                              ""
                            ) + " %"
                          : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center">
                    <div className="flex flex-col items-end flex-nowrap">
                      <div className="text-text-subtitle text-sm">Trần</div>
                      <div className="c text-xs">
                        {formatPrice(snapshots[symbol]?.refPrices?.[5])}
                      </div>
                    </div>
                    <div className="flex flex-col items-end pl-9 flex-nowrap">
                      <div className="text-text-subtitle text-sm">Sàn</div>
                      <div className="f text-xs">
                        {formatPrice(snapshots[symbol]?.refPrices?.[6])}
                      </div>
                    </div>
                    <div className="flex flex-col items-end pl-9 flex-nowrap">
                      <div className="text-text-subtitle text-sm">
                        Tham chiếu
                      </div>
                      <div className="r text-xs">
                        {formatPrice(snapshots[symbol]?.refPrices?.[4])}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="flex gap-1 items-center justify-center">
                    <div className="text-sm text-text-subtitle">
                      Mở cửa/Trung bình:
                    </div>
                    <div className="flex flex-row items-center justify-center">
                      <div className="text-text-title text-xs">-</div>
                      <span className="text-text-subtitle text-xs">/</span>
                      <div
                        className={`text-color-down text-xs ${
                          String(
                            snapshots[symbol]?.orderBook?.["28"] || ""
                          ).split("|")[1]
                        }`}
                      >
                        {formatPrice(
                          String(
                            snapshots[symbol]?.orderBook?.["28"] || ""
                          ).split("|")[0]
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1 pl-3">
                    <div className="text-sm text-text-subtitle">Thấp/Cao:</div>
                    <div className="flex flex-row items-center justify-center">
                      <div
                        className={`text-color-down text-xs ${
                          String(
                            snapshots[symbol]?.orderBook?.["25"] || ""
                          ).split("|")[1]
                        }`}
                      >
                        {formatPrice(
                          String(
                            snapshots[symbol]?.orderBook?.["25"] || ""
                          ).split("|")[0]
                        )}
                      </div>
                      <span className="text-text-subtitle text-xs">/</span>
                      <div
                        className={`text-color-down text-xs ${
                          String(
                            snapshots[symbol]?.orderBook?.["24"] || ""
                          ).split("|")[1]
                        }`}
                      >
                        {formatPrice(
                          String(
                            snapshots[symbol]?.orderBook?.["24"] || ""
                          ).split("|")[0]
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center pl-3">
                    <div className="text-sm text-text-subtitle">Tổng KL:</div>
                    <div className="text-text-body pl-1 text-xs">
                      {formatVolPrice(
                        snapshots[symbol]?.orderBook?.["26"] || 0
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dữ liệu phân tích */}
              <div className="grid grid-cols-5 gap-1 w-full h-[calc(var(--app-height)-320px)]">
                <div className="col-span-3 bg-surface rounded-md">
                  <h2 className="text-sm font-medium text-text-title p-2">
                    Chart stock
                  </h2>
                </div>
                <div className="col-span-1 grid grid-rows-2 gap-1 rounded-md">
                  <div className="w-full h-full bg-surface rounded-md p-2">
                    <h2 className="text-sm font-medium text-text-title">
                      Chờ mua / bán
                    </h2>
                  </div>
                  <div className="w-full h-full bg-surface rounded-md p-2">
                    <h2 className="text-sm font-medium text-text-title">
                      Bước giá
                    </h2>
                  </div>
                </div>
                <div className="col-span-1 bg-surface rounded-md p-2">
                  <h2 className="text-sm font-medium text-text-title">
                    Chi tiết khớp lệnh
                  </h2>
                </div>
              </div>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
