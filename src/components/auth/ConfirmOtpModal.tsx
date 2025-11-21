import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import Modal from "react-modal";
import ScaleLoader from "react-spinners/ScaleLoader";
import { TIME_OTP } from "../../configs";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { fetchOtpRequest } from "../../store/slices/auth/slice";
import { selectAccountProfile } from "../../store/slices/client/selector";
import type { ConfirmOtpForm } from "../../types";
import { formatTime, hideMiddleDigits } from "../../utils";
import Button from "../common/Button";
import InputFieldOTP from "../inputs/InputFieldOtp";

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

export default function ConfirmOtpModal({
  isOpen,
  onPre,
  onSubmit,
  onClose,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onPre: () => void;
  onSubmit: (id: string) => void;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ConfirmOtpForm>();

  const dispatch = useAppDispatch();

  const accountProfile = useAppSelector(selectAccountProfile);

  const [time, setTime] = useState<number>(TIME_OTP);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime((prev) => {
        if (prev <= 0) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    dispatch(
      fetchOtpRequest({
        channel: "I",
      })
    );
  }, [dispatch]);

  const onCloseModal = () => {
    onClose();
    reset();
  };

  const submit = async (data: ConfirmOtpForm) => {
    const { otp } = data;
    onSubmit(otp);
  };

  const handleGetOtp = () => {
    if (time > 0) return;

    dispatch(
      fetchOtpRequest({
        channel: "I",
      })
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          contentLabel="Xác thực OTP"
          ariaHideApp={false}
          style={customStyles}
          closeTimeoutMS={25}
          overlayClassName="ReactModal__Overlay"
          className="ReactModal__Content"
        >
          <motion.div
            key="confirm-otp-modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className="flex flex-col gap-4 bg-cover bg-no-repeat bg-center rounded-xl"
          >
            <div className="flex flex-col rounded-xl border border-border bg-background-primary">
              <div className={`flex flex-row items-center justify-between`}>
                <div></div>
                <div
                  className="cursor-pointer p-1 hover:bg-gray-300 rounded-full"
                  onClick={onCloseModal}
                >
                  <IoClose className="w-7 h-7 text-text-subtitle cursor-pointer" />
                </div>
              </div>

              <div className="w-full text-center text-xl text-text-title px-4 pb-4">
                Xác thực OTP
                <p className="text-sm text-text-subtitle font-medium pt-2">
                  Chúng tôi đã gửi một mã OTP xác nhận đến số điện thoại{" "}
                  <span className="text-stock-text-green">
                    {hideMiddleDigits(accountProfile?.cCustMobile + "")}
                  </span>
                  , mã sẽ có hiệu lực trong vòng 5 phút
                </p>
              </div>

              <form
                onSubmit={handleSubmit(submit)}
                className="flex flex-col p-4"
              >
                <div className="flex flex-col gap-4">
                  <InputFieldOTP registration={register("otp")} />
                  <span className="text-sm text-text-subtitle">
                    Bạn không nhận được mã?
                    <span
                      className={` ${
                        time === 0
                          ? "text-stock-text-green cursor-pointer"
                          : "text-text-disable cursor-not-allowed"
                      }`}
                      onClick={() => handleGetOtp()}
                    >
                      {" "}
                      Gửi lại{" "}
                    </span>
                    ({formatTime(time)})
                  </span>
                </div>

                <div className="flex items-center flex-row-reverse gap-4 pt-10">
                  <Button
                    variant="primary"
                    fullWidth
                    type="submit"
                    disabled={isSubmitting}
                    className="h-10!"
                  >
                    {loading ? <ScaleLoader height={25} /> : "Tiếp tục"}
                  </Button>
                  <Button
                    variant="close"
                    fullWidth
                    className="h-10!"
                    type="button"
                    onClick={onPre}
                  >
                    Quay lại
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
