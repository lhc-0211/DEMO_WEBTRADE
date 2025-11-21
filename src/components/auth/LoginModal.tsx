import { yupResolver } from "@hookform/resolvers/yup";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { MdPermPhoneMsg } from "react-icons/md";
import { PiWarningFill } from "react-icons/pi";
import Modal from "react-modal";
import ScaleLoader from "react-spinners/ScaleLoader";
import * as yup from "yup";
import bgLogin from "../../assets/imgs/bg-login.jpg";
import logo from "../../assets/imgs/logo.png";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import {
  selectFetchTokenStatus,
  selectToken,
} from "../../store/slices/auth/selector";
import { loginFailure, loginRequest } from "../../store/slices/auth/slice";
import { selectLoginModalOpen } from "../../store/slices/client/selector";
import {
  closeLoginModal,
  openForgotAccountModal,
} from "../../store/slices/client/slice";
import type { LoginPayload } from "../../types";
import Button from "../common/Button";
import InputField from "../inputs/InputField";

const schema = yup.object({
  user: yup.string().required("Vui lòng nhập tên đăng nhập"),
  password: yup
    .string()
    .min(6, "Ít nhất 6 ký tự")
    .required("Vui lòng nhập mật khẩu"),
  device: yup.string().default("web"),
  channel: yup.string().default("I"),
});

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

export default function LoginModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectLoginModalOpen);
  const loginStatus = useAppSelector(selectFetchTokenStatus);
  const token = useAppSelector(selectToken);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>({
    resolver: yupResolver(schema),
    defaultValues: {
      user: "",
      password: "",
      device: "web",
      channel: "I",
    },
  });

  useEffect(() => {
    if (token) {
      dispatch(closeLoginModal());
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (loginStatus.error) {
      const timer = setTimeout(() => {
        dispatch(loginFailure(""));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [loginStatus.error, dispatch]);

  const handleClickForgotAccount = () => {
    onClose();
    dispatch(openForgotAccountModal());
  };

  const onClose = () => {
    dispatch(closeLoginModal());
    dispatch(loginFailure(""));
    reset();
  };

  const onSubmit = async (data: LoginPayload) => {
    const { user, password } = data;
    dispatch(
      loginRequest({
        user,
        password,
        device: "web",
        channel: "I",
      })
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="flex flex-col gap-4 bg-cover bg-no-repeat bg-center rounded-xl"
            style={{
              backgroundImage: `url(${bgLogin})`,
            }}
          >
            <div
              className="flex flex-col gap-4 p-4 bg-cover bg-no-repeat bg-center rounded-xl border border-border"
              style={{
                backgroundImage: `url(${bgLogin})`,
              }}
            >
              <div className="flex flex-row items-center justify-between">
                <h2 className="text-sm font-bold text-text-title">
                  CHÀO MỪNG NHÀ ĐẦU TƯ
                  <br /> ĐẾN VỚI NỀN TẢNG GIAO DỊCH DTND
                </h2>
                <IoClose
                  className="w-7 h-7 text-text-subtitle cursor-pointer"
                  onClick={onClose}
                />
              </div>

              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-6">
                  <img src={logo} alt="logo" className="w-36 h-13" />
                  <div className="flex flex-col gap-3">
                    <h2 className="text-2xl font-black text-text-title">
                      ĐĂNG NHẬP
                    </h2>
                    <h3 className="text-sm font-medium text-text-subtitle">
                      Để bắt đầu đầu tư ngay!
                    </h3>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-8"
                >
                  <div className="flex flex-col gap-3">
                    <InputField
                      label="Tên đăng nhập"
                      placeholder="Nhập tên đăng nhập"
                      error={errors.user}
                      registration={register("user")}
                      className="h-12!"
                      autoFocus={true}
                    />

                    <InputField
                      label="Mật khẩu"
                      type="password"
                      typeInput="password"
                      placeholder="Nhập mật khẩu"
                      error={errors.password}
                      registration={register("password")}
                      className="h-12!"
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    {loginStatus.error && (
                      <div className="py-2 px-3 bg-error-darker rounded-xl flex items-center flex-row gap-1">
                        <PiWarningFill className="size-5 text-red-500" />
                        <span className="text-red-500 text-sm">
                          {loginStatus.error}
                        </span>
                      </div>
                    )}
                    <div className="ml-auto">
                      <span
                        className="text-sm font-semibold text-DTND-200 hover:text-DTND-300 cursor-pointer hover:underline"
                        onClick={handleClickForgotAccount}
                      >
                        Quên mật khẩu?
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    type="submit"
                    disabled={isSubmitting || loginStatus.loading}
                    className="h-10!"
                  >
                    {loginStatus.loading ? (
                      <ScaleLoader height={25} />
                    ) : (
                      "Đăng nhập"
                    )}
                  </Button>
                </form>
                <span className="text-sm font-medium text-text-title text-center">
                  Chưa có tài khoản?{" "}
                  <span className="text-sm font-semibold text-DTND-200 hover:text-DTND-300 cursor-pointer hover:underline">
                    Mở tài khoản
                  </span>
                </span>
              </div>

              <div className="flex flex-row gap-2 items-center justify-center w-full">
                <MdPermPhoneMsg className="size-4 text-DTND-200" />
                <span className="text-xs text-text-body font-semibold">
                  Hotline:{" "}
                  <span className="text-text-subtitle">+84 123 456 789</span>
                </span>
              </div>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
