import { AnimatePresence, motion } from "framer-motion";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { logout } from "../../store/slices/auth/slice";
import { selectSessionExpired } from "../../store/slices/client/selector";
import { setSessionExpired } from "../../store/slices/client/slice";
import Button from "../common/Button";

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

export default function SessionExpiredModal() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const sessionExpired = useAppSelector(selectSessionExpired);

  if (!sessionExpired) return null;

  const handleConfirm = () => {
    dispatch(setSessionExpired(false));
    dispatch(logout());

    navigate("/price-board");
  };

  return (
    <AnimatePresence>
      {sessionExpired && (
        <Modal
          isOpen={sessionExpired}
          contentLabel="Thông báo hết phiên đăng nhập"
          ariaHideApp={false}
          style={customStyles}
          closeTimeoutMS={25} // phải trùng với thời gian transition
          overlayClassName="ReactModal__Overlay"
          className="ReactModal__Content"
        >
          <motion.div
            key="session-ex-modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className="flex flex-col gap-4 bg-cover bg-no-repeat bg-center rounded-xl"
          >
            <div className="flex flex-col gap-4 p-4 rounded-xl border border-border w-full bg-background-primary">
              <div className="p-6 rounded-xl shadow-md text-center">
                <h2 className="text-lg font-semibold mb-4 text-red-500">
                  Phiên đăng nhập đã hết hạn!
                </h2>
                <p className="text-sm mb-6 text-text-body">
                  Vui lòng đăng nhập lại để tiếp tục sử dụng.
                </p>
                <Button onClick={handleConfirm} variant="primary" fullWidth>
                  Xác nhận
                </Button>
              </div>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
