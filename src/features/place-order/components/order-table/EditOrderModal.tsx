import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import Modal from "react-modal";
import Button from "../../../../components/common/Button";
import type { OrderTable } from "../../../../types/placeOrder";

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

export default function EditOrderModal({
  isOpen,
  onClose,
  data,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: OrderTable | undefined;
  onSubmit: () => void;
}) {
  console.log("data", data);

  return (
    <AnimatePresence>
      <Modal
        isOpen={isOpen}
        contentLabel="Sửa lệnh đặt"
        ariaHideApp={false}
        style={customStyles}
        closeTimeoutMS={350}
        overlayClassName="ReactModal__Overlay"
        className="ReactModal__Content"
      >
        <motion.div
          key="edit-order-modal"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex flex-col gap-4 bg-cover bg-no-repeat bg-center rounded-xl"
        >
          <div className="flex flex-col gap-4 p-4 rounded-xl border border-border bg-background-primary">
            <div className={`flex flex-row items-center justify-between `}>
              <h1 className="text-text-title text-[20px] text-bold">
                Sửa lệnh
              </h1>

              <div
                className="cursor-pointer p-1 hover:bg-gray-300 rounded-full"
                onClick={onClose}
              >
                <IoClose className="w-7 h-7 text-text-subtitle cursor-pointer" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-text-body text-sm">
                Thông tin đặt lệnh chứng khoán
              </h2>
              <div className="p-2 border border-border rounded-xl ">
                {/* Tài khoản, mã ck */}
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-xs font-normal text-text-title">
                    <span className="text-text-subtitle">Tài khoản: </span>
                    {data?.orderId}
                  </span>
                  <span className="text-xs font-normal text-text-title text-center">
                    <span className="text-text-subtitle">Mã CK: </span>
                    {data?.symbol}
                  </span>
                  <span className="text-xs font-normal text-text-title text-right">
                    <span className="text-text-subtitle">Mua/Bán: </span>
                    <span className={`${data?.side === "Mua" ? "u" : "d"}`}>
                      {data?.side}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center flex-row-reverse gap-4">
              <Button
                variant="primary"
                fullWidth
                type="submit"
                className="h-10!"
                onClick={() => onSubmit()}
              >
                Xác nhận
              </Button>
              <Button
                variant="close"
                fullWidth
                className="h-10!"
                type="button"
                onClick={onClose}
              >
                Quay lại
              </Button>
            </div>
          </div>
        </motion.div>
      </Modal>
    </AnimatePresence>
  );
}
