import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import Modal from "react-modal";

const customStyles = {
  content: {
    top: "50%",
    transform: "translateY(-50%)",
    bottom: "auto",
    left: "calc( 50% - 250px )",
    height: "auto",
    width: "500px",
    padding: "0",
    borderWidth: "0px",
    overflow: "inherit",
    borderRadius: "16px",
    background: "transparent",
  },
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CongfigHeaderBoardModal(props: Props) {
  const { isOpen, onClose } = props;

  return (
    <AnimatePresence>
      <Modal
        isOpen={isOpen}
        contentLabel="Đăng nhập"
        ariaHideApp={false}
        style={customStyles}
        closeTimeoutMS={350} // phải trùng với thời gian transition
        overlayClassName="ReactModal__Overlay"
        className="ReactModal__Content"
      >
        <motion.div
          key="login-modal"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex flex-col gap-4 bg-cover bg-no-repeat bg-center rounded-2xl"
        >
          <div className="flex flex-col gap-4 bg-cover bg-no-repeat bg-center rounded-xl border border-border bg-background-primary">
            <div className="h-[60px] flex items-center justify-between p-4 rounded-t-xl bg-surface">
              <h2 className="text-sm font-bold text-text-title">
                Bảng giá: Thay đổi cột bảng
              </h2>
              <IoClose
                className="size-6 text-text-subtitle cursor-pointer"
                onClick={onClose}
              />
            </div>
            <div className="h-1"></div>
          </div>
        </motion.div>
      </Modal>
    </AnimatePresence>
  );
}
