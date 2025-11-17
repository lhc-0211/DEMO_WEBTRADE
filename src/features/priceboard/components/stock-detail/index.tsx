import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import Modal from "react-modal";
import Button from "../../../../components/common/Button";
import InputSearchFieldStock, {
  type OptionType,
} from "../../../../components/inputs/InputSearchFieldStock";
import OrderHisDetail from "../../../../components/stock/OrderHisDetail";
import { socketClient } from "../../../../services/socket";
import { useAppSelector } from "../../../../store/hook";
import { selectListShareStock } from "../../../../store/slices/place-order/selector";
import { selectSnapshotsBySymbols } from "../../../../store/slices/stock/selector";
import {
  formatPrice,
  formatVolPrice,
  getBgColorStock,
  numberFormat,
} from "../../../../utils";

type FormSearchStockValues = {
  stock: OptionType;
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
  const { control, setValue, watch } = useForm<FormSearchStockValues>();
  const stock = watch("stock");

  const listShareStock = useAppSelector(selectListShareStock);

  const targetSymbols = stock?.value
    ? `${stock.value}:G1:${stock.post_to}`
    : symbol;

  const snapshots = useAppSelector((state) =>
    selectSnapshotsBySymbols(state, targetSymbols.split(",").filter(Boolean))
  );

  const wrapperRef = useRef<HTMLDivElement>(null);
  const prevSymbolKeyRef = useRef<string | null>(null);

  const [isOpenSearch, setIsOpenSearch] = useState<boolean>(false); // mở hiện input search

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpenSearch(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    if (!stock && listShareStock && symbol) {
      const code = symbol.split(":")[0];
      const detail = listShareStock.find((item) => item.shareCode === code);

      if (detail) {
        setValue("stock", {
          label: detail.fullName,
          value: detail.shareCode,
          post_to: detail.tradeTable,
        });
      }
    }
  }, [listShareStock, symbol, setValue, stock]);

  useEffect(() => {
    if (!stock?.value || !stock?.post_to) return;

    const currentSymbolKey = `${stock.value}:G1:${stock.post_to}`;
    const snapshot = snapshots[currentSymbolKey];

    if (prevSymbolKeyRef.current !== currentSymbolKey) {
      if (!snapshot) {
        socketClient.subscribe({ symbols: [currentSymbolKey] });
      }

      // Cập nhật ref để lần sau so sánh
      prevSymbolKeyRef.current = currentSymbolKey;
      setIsOpenSearch(false);
    }
  }, [stock?.value, stock?.post_to]);

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
                  <motion.div
                    ref={wrapperRef}
                    animate={{ width: isOpenSearch ? 160 : 40 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    {isOpenSearch && (
                      <Controller
                        name="stock"
                        control={control}
                        rules={{ required: "Vui lòng chọn mã chứng khoán" }}
                        render={({ field }) => (
                          <div>
                            <InputSearchFieldStock
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Tìm kiếm mã"
                              className="w-40!"
                              autoFocus
                            />
                          </div>
                        )}
                      />
                    )}

                    {!isOpenSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpenSearch(!isOpenSearch);
                        }}
                        className="p-2 flex items-center justify-center bg-input rounded-md text-text-title hover:text-yellow-500 text-sm w-full"
                      >
                        {stock?.value}{" "}
                      </button>
                    )}
                  </motion.div>

                  <div className="flex flex-row items-center justify-center gap-3">
                    <div className="flex flex-row items-center justify-center gap-1">
                      {stock && (
                        <span className="text-xs font-normal text-text-body">
                          ( {stock?.post_to} ) | {stock?.label}
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
                    className={`text-color-down flex pr-3 w-44 ${snapshots[targetSymbols]?.trade?.["13"]}`}
                  >
                    <div
                      className={`text-xl flex justify-center items-center p-1 rounded-lg ${getBgColorStock(
                        snapshots[targetSymbols]?.trade?.["13"] || "r"
                      )}`}
                    >
                      <div>
                        {" "}
                        {formatPrice(snapshots[targetSymbols]?.trade?.[8])}
                      </div>
                    </div>
                    <div className="flex flex-col items-end pl-2 justify-center text-sm">
                      <div>
                        {" "}
                        {snapshots[targetSymbols]?.trade?.["11"]
                          ? formatPrice(snapshots[targetSymbols]?.trade?.["11"])
                          : "0"}
                      </div>
                      <div>
                        {snapshots[targetSymbols]?.trade?.["12"]
                          ? numberFormat(
                              snapshots[targetSymbols]?.trade?.["12"],
                              2,
                              ""
                            ) + " %"
                          : "0%"}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center">
                    <div className="flex flex-col items-end flex-nowrap">
                      <div className="text-text-subtitle text-sm">Trần</div>
                      <div className="c text-xs">
                        {formatPrice(snapshots[targetSymbols]?.refPrices?.[5])}
                      </div>
                    </div>
                    <div className="flex flex-col items-end pl-9 flex-nowrap">
                      <div className="text-text-subtitle text-sm">Sàn</div>
                      <div className="f text-xs">
                        {formatPrice(snapshots[targetSymbols]?.refPrices?.[6])}
                      </div>
                    </div>
                    <div className="flex flex-col items-end pl-9 flex-nowrap">
                      <div className="text-text-subtitle text-sm">
                        Tham chiếu
                      </div>
                      <div className="r text-xs">
                        {formatPrice(snapshots[targetSymbols]?.refPrices?.[4])}
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
                            snapshots[targetSymbols]?.orderBook?.["28"] || ""
                          ).split("|")[1]
                        }`}
                      >
                        {formatPrice(
                          String(
                            snapshots[targetSymbols]?.orderBook?.["28"] || ""
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
                            snapshots[targetSymbols]?.orderBook?.["25"] || ""
                          ).split("|")[1]
                        }`}
                      >
                        {formatPrice(
                          String(
                            snapshots[targetSymbols]?.orderBook?.["25"] || ""
                          ).split("|")[0]
                        )}
                      </div>
                      <span className="text-text-subtitle text-xs">/</span>
                      <div
                        className={`text-color-down text-xs ${
                          String(
                            snapshots[targetSymbols]?.orderBook?.["24"] || ""
                          ).split("|")[1]
                        }`}
                      >
                        {formatPrice(
                          String(
                            snapshots[targetSymbols]?.orderBook?.["24"] || ""
                          ).split("|")[0]
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center pl-3">
                    <div className="text-sm text-text-subtitle">Tổng KL:</div>
                    <div className="text-text-body pl-1 text-xs">
                      {formatVolPrice(
                        snapshots[targetSymbols]?.orderBook?.["26"] || 0
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
                <div className="col-span-1 bg-surface rounded-md">
                  <h2 className="text-sm font-medium text-text-title p-2">
                    Chi tiết khớp lệnh
                  </h2>
                  <OrderHisDetail symbol={targetSymbols} />
                </div>
              </div>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
