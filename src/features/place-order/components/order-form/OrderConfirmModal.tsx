import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import Modal from "react-modal";
import Button from "../../../../components/common/Button";
import type { OrderForm } from "../../../../types/placeOrder";
import {
  formatAccount,
  numberFormat,
  StringToDouble,
  StringToInt,
} from "../../../../utils";

const customStyles = {
  content: {
    top: "50%",
    transform: "translateY(-50%)",
    bottom: "auto",
    left: "calc( 50% - 260px )",
    height: "auto",
    width: "520px",
    padding: "0",
    borderWidth: "0px",
    overflow: "inherit",
    borderRadius: "16px",
    background: "transparent",
  },
};

export default function OrderConfirmModal({
  isOpen,
  onClose,
  data,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: OrderForm;
  onSubmit: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          contentLabel="Xác nhận đặt lệnh"
          ariaHideApp={false}
          style={customStyles}
          closeTimeoutMS={25}
          overlayClassName="ReactModal__Overlay"
          className="ReactModal__Content"
        >
          <motion.div
            key="order-confirm-modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className="flex flex-col gap-4 bg-cover bg-no-repeat bg-center rounded-xl"
          >
            <div className="flex flex-col gap-4 p-4 rounded-xl border border-border bg-background-primary">
              <div className={`flex flex-row items-center justify-between `}>
                <h1 className="text-text-title text-[20px] text-bold">
                  Xác nhận lệnh
                </h1>

                <div
                  className="cursor-pointer p-1 hover:bg-gray-300 rounded-full"
                  onClick={onClose}
                >
                  <IoClose className="w-7 h-7 text-text-subtitle cursor-pointer" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1 items-center justify-center">
                  <h2 className="text-sm font-normal text-text-title">
                    {data?.orderSymbol?.value}{" "}
                    <span className="text-text-subtitle">
                      ({data?.orderSymbol?.post_to})
                    </span>
                  </h2>
                  <h3 className="text-sm font-normal text-text-subtitle">
                    {data?.orderSymbol?.label}
                  </h3>
                </div>
                <div className="rounded-xl bg-input p-3 flex flex-col gap-3">
                  <div className="flex flex-row items-center justify-between">
                    <span className="text-text-subtitle text-sm font-normal">
                      Tiểu khoản
                    </span>
                    <span className="text-text-title text-sm font-normal">
                      {formatAccount(data?.accountOrder)}
                    </span>
                  </div>

                  <div className="w-full h-[1px] rounded bg-border"></div>
                  <div className="flex flex-row items-center justify-between">
                    <span className="text-text-subtitle text-sm font-normal">
                      Lệnh
                    </span>
                    <span
                      className={`text-sm font-normal ${
                        data?.orderSide === "B"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {data?.orderSide === "B"
                        ? "Mua"
                        : data?.orderSide === "S"
                        ? "Bán"
                        : ""}
                    </span>
                  </div>

                  <div className="w-full h-[1px] rounded bg-border"></div>
                  <div className="flex flex-row items-center justify-between">
                    <span className="text-text-subtitle text-sm font-normal">
                      Loại lệnh
                    </span>
                    <span className="text-text-title text-sm font-normal">
                      -
                    </span>
                  </div>

                  <div className="w-full h-[1px] rounded bg-border"></div>
                  <div className="flex flex-row items-center justify-between">
                    <span className="text-text-subtitle text-sm font-normal">
                      Khối lượng
                    </span>
                    <span className="text-text-title text-sm font-normal">
                      {numberFormat(data?.orderVolume)}
                    </span>
                  </div>

                  <div className="w-full h-[1px] rounded bg-border"></div>
                  <div className="flex flex-row items-center justify-between">
                    <span className="text-text-subtitle text-sm font-normal">
                      Giá đặt
                    </span>
                    <span className="text-text-title text-sm font-normal">
                      {numberFormat(data?.orderPrice)}
                    </span>
                  </div>
                  <div className="w-full h-[1px] rounded bg-border"></div>
                  <div className="flex flex-row items-center justify-between">
                    <span className="text-text-subtitle text-sm font-normal">
                      Giá trị lệnh (VND)
                    </span>
                    <span className="text-text-title text-sm font-normal">
                      {numberFormat(
                        StringToDouble(data?.orderPrice) *
                          1000 *
                          StringToInt(data?.orderVolume)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center flex-row-reverse gap-4">
                <Button
                  variant="primary"
                  fullWidth
                  type="submit"
                  className="!h-10"
                  onClick={() => onSubmit()}
                >
                  Xác nhận
                </Button>
                <Button
                  variant="close"
                  fullWidth
                  className="!h-10"
                  type="button"
                  onClick={onClose}
                >
                  Quay lại
                </Button>
              </div>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
