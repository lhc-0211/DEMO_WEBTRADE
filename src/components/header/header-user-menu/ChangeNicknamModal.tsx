import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { HiOutlineLightBulb } from "react-icons/hi";
import { IoCheckmarkCircleOutline, IoClose } from "react-icons/io5";
import Modal from "react-modal";
import ScaleLoader from "react-spinners/ScaleLoader";
import { usePrevious } from "../../../hooks/usePrevious";
import { useToast } from "../../../hooks/useToast";
import { useAppDispatch, useAppSelector } from "../../../store/hook";
import {
  selectChangeNicknameStatus,
  selectCheckNickname,
} from "../../../store/slices/client/selector";
import {
  fetchAccountProfileRequest,
  fetchChangeNicknameRequest,
  resetFetchChangeNickname,
} from "../../../store/slices/client/slice";
import type { AccountProfile, ChangeNicknameForm } from "../../../types/client";
import { _diff2Date, formatDate } from "../../../utils";
import Button from "../../common/Button";
import InputField from "../../inputs/InputField";

const nicknameRegex = /^[A-Za-z][A-Za-z0-9_-]{5,19}$/;

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

export default function ChangeNicknameModal({
  isOpen,
  accountProfile,
  onClose,
}: {
  isOpen: boolean;
  accountProfile: AccountProfile | null;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangeNicknameForm>({
    defaultValues: {
      actionType: "CREATE",
    },
  });

  const toast = useToast();

  const checkNickname = useAppSelector(selectCheckNickname);
  const { loading, success } = useAppSelector(selectChangeNicknameStatus);
  const { loading: loadingCheckNickname } = useAppSelector(
    selectChangeNicknameStatus
  );

  const preCheckNickname = usePrevious(checkNickname);

  useEffect(() => {
    if (!checkNickname || _.isEqual(checkNickname, preCheckNickname)) return;

    const todayFormat = formatDate(new Date(), "/", "dmy");
    if (_diff2Date(checkNickname.C_CHANGE_DATE, todayFormat) > 90) {
      setStep(2);
    }
  }, [preCheckNickname, checkNickname]);

  useEffect(() => {
    if (!success) return;

    const handleAfterSuccess = async () => {
      try {
        // Gọi lại API lấy thông tin tài khoản
        await dispatch(fetchAccountProfileRequest());
        toast("Đổi nickname thành công!", "success");
        onCloseModal();
      } catch (err: unknown) {
        toast(err + "", "error");
      }
    };

    handleAfterSuccess();

    return () => {
      dispatch(resetFetchChangeNickname());
    };
  }, [success, dispatch]);

  const onPreModal = () => {
    if (step === 2) {
      setStep(1);
      return;
    }

    if (step === 1) {
      onClose();
      reset();
    }
  };

  const onCloseModal = () => {
    onClose();
    reset();
  };

  const onSubmit = async (data: ChangeNicknameForm) => {
    if (step === 1) {
      // await dispatch(
      //   fetchCheckNicknameRequest({
      //     NICK_NAME: data.nickname,
      //   })
      // );

      setStep(2); // Chuyển sang bước nhập password
      return;
    }

    if (step === 2) {
      // Gọi API đổi nickname
      dispatch(
        fetchChangeNicknameRequest({
          ACTION_TYPE: data.actionType,
          PASS_WORD: data.password || "",
          NICK_NAME: data.nickname,
        })
      );
    }
  };

  const nickname = watch("nickname", "");

  // Kiểm tra điều kiện hiển thị
  const hasLengthAndPattern = nicknameRegex.test(nickname);
  const noSpaces = nickname && !/\s/.test(nickname);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          contentLabel="Đăng nhập"
          ariaHideApp={false}
          style={customStyles}
          closeTimeoutMS={350}
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
          >
            <div className="flex flex-col gap-4 p-4 rounded-xl border border-border bg-background-primary">
              <div className="flex flex-row items-center justify-between">
                {step === 1 ? (
                  <div className="flex flex-row gap-2 items-center">
                    <div
                      className="w-8 h-8 rounded-full bg-white bg-center bg-no-repeat bg-cover border border-yellow-500 shadow-[0_0_0_2px_rgba(250,204,21,0.3)]"
                      style={{
                        backgroundImage: `url(${accountProfile?.cAvatarImg})`,
                      }}
                    ></div>
                    <span className="text-sm font-medium text-text-title">
                      {accountProfile?.cUserName}
                    </span>
                  </div>
                ) : (
                  <div className="w-full text-center text-text-title">
                    Xác nhận lại mật khẩu
                    <p className="text-sm text-text-subtitle font-medium pt-2">
                      Xác nhận lại mật khẩu để có thể thay đổi được nickname mới
                    </p>
                  </div>
                )}
                <div
                  className="cursor-pointer p-1 hover:bg-gray-300 rounded-full"
                  onClick={onCloseModal}
                >
                  <IoClose className="w-7 h-7 text-text-subtitle cursor-pointer" />
                </div>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
              >
                {step === 1 ? (
                  <>
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-2 w-full">
                        <div className="mb-[14px] text-[40px] font-medium text-text-body flex items-center justify-center">
                          @
                        </div>
                        <InputField
                          placeholder="Nhập nickname mới ở đây"
                          error={errors.nickname}
                          registration={register("nickname", {
                            required: "Vui lòng nhập nickname mới",
                            pattern: {
                              value: nicknameRegex,
                              message: "Nickname không hợp lệ",
                            },
                          })}
                          className="!h-12 !bg-transparent !w-[370px]"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row gap-2 items-center">
                        <IoCheckmarkCircleOutline
                          className={clsx(
                            "w-5 h-5 min-w-5",
                            hasLengthAndPattern
                              ? "text-green-500"
                              : "text-text-subtitle"
                          )}
                        />
                        <span
                          className={clsx(
                            "text-xs font-medium",
                            hasLengthAndPattern
                              ? "text-green-600"
                              : "text-text-subtitle"
                          )}
                        >
                          Có 6-20 ký tự, bắt đầu bằng chữ cái. Viết hoa (A-Z),
                          viết thường (a-z), số (0-9), dấu (_), dấu (-)
                        </span>
                      </div>
                      <div className="flex flex-row gap-2 items-center">
                        <IoCheckmarkCircleOutline
                          className={clsx(
                            "w-5 h-5 min-w-5",
                            noSpaces ? "text-green-500" : "text-text-subtitle"
                          )}
                        />
                        <span
                          className={clsx(
                            "text-xs font-medium",
                            noSpaces ? "text-green-500" : "text-text-subtitle"
                          )}
                        >
                          Các ký tự phải liền mạch và không có dấu cách ở giữa
                        </span>
                      </div>
                    </div>
                    <div className="p-2 flex flex-row gap-2 items-center justify-center bg-DTND-1000 rounded-md">
                      <HiOutlineLightBulb className="w-6 h-6 text-DTND-500" />
                      <span className="text-xs font-medium text-text-subtitle">
                        Bạn có thể sử dụng Nickname để đăng nhập vào các phiên
                        đăng nhập sau
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="py-5">
                    <InputField
                      type="password"
                      placeholder="Nhập mật khẩu của bạn"
                      error={errors.password}
                      registration={register("password", {
                        required: "Vui lòng nhập mật khẩu",
                        minLength: {
                          value: 6,
                          message: "Mật khẩu ít nhất 6 kí tự",
                        },
                      })}
                      className="!h-12"
                    />
                  </div>
                )}

                <div className="flex items-center flex-row-reverse gap-4">
                  <Button
                    variant="primary"
                    fullWidth
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !noSpaces ||
                      !hasLengthAndPattern ||
                      loading ||
                      loadingCheckNickname
                    }
                    className="!h-10"
                  >
                    {loading || loadingCheckNickname ? (
                      <ScaleLoader height={25} />
                    ) : (
                      "Xác nhận"
                    )}
                  </Button>
                  <Button
                    variant="close"
                    fullWidth
                    className="!h-10"
                    type="button"
                    onClick={onPreModal}
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
