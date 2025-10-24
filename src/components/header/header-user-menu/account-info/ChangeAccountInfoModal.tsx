import { yupResolver } from "@hookform/resolvers/yup";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import Modal from "react-modal";
import ScaleLoader from "react-spinners/ScaleLoader";
import * as yup from "yup";
import { useToast } from "../../../../hooks/useToast";
import { useAppDispatch, useAppSelector } from "../../../../store/hook";
import { selectFectchAccountInfoStatus } from "../../../../store/slices/client/selector";
import {
  fetchAccountProfileRequest,
  fetchChangeAccountInfoRequest,
  resetFetchChangeAccountInfo,
} from "../../../../store/slices/client/slice";
import type {
  AccountProfile,
  ChangeAccountInfoForm,
} from "../../../../types/client";
import ConfirmOtpModal from "../../../auth/ConfirmOtpModal";
import Button from "../../../common/Button";
import InputField from "../../../inputs/InputField";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const schema = yup.object({
  email: yup
    .string()
    .required("Vui lòng nhập email mới")
    .matches(emailRegex, "Email không hợp lệ"),
  address: yup.string().required("Vui lòng nhập địa chỉ liên hệ mới"),
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

export default function ChangeAccountInfoModal({
  isOpen,
  typeChange,
  accountProfile,
  onClose,
}: {
  isOpen: boolean;
  typeChange: "email" | "address";
  accountProfile: AccountProfile | null;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ChangeAccountInfoForm>({
    resolver: yupResolver(schema),
  });

  const { loading, success } = useAppSelector(selectFectchAccountInfoStatus);

  useEffect(() => {
    if (!success) return;
    const handleAfterSuccess = async () => {
      try {
        // Gọi lại API lấy thông tin tài khoản
        await dispatch(fetchAccountProfileRequest());
        toast(
          typeChange === "address"
            ? "Đổi địa chỉ liên hệ thành công!"
            : "Đổi email thành công!",
          "success"
        );
        onCloseModal();
      } catch (err: unknown) {
        toast(err + "", "error");
      }
    };

    handleAfterSuccess();

    return () => {
      dispatch(resetFetchChangeAccountInfo());
    };
  }, [success, dispatch]);

  useEffect(() => {
    if (accountProfile && typeChange) {
      reset({
        email: typeChange === "address" ? accountProfile.cCustEmail || "" : "",
        address:
          typeChange === "email" ? accountProfile.cResedenceAddress || "" : "",
        phoneNumber: accountProfile.cCustMobile || "",
      });
    }
  }, [accountProfile, reset, typeChange]);

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

  const onSubmit = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }
  };

  const handleChangeInfo = (otp: string) => {
    const { email, address, phoneNumber } = getValues();

    const payload = {
      otp: otp,
      CUST_MOBILE: phoneNumber || "",
      CUST_EMAIL: email || "",
      CONTACT_ADDRESS: address || "",
    };

    dispatch(fetchChangeAccountInfoRequest(payload));
  };

  return (
    <AnimatePresence>
      {step === 1 && (
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
            <div className="flex flex-col rounded-xl border border-border bg-background-primary">
              <div
                className={`flex flex-row items-center justify-between pb-5 border-b border-border px-4 py-4`}
              >
                <div className="text-text-title text-[20px] text-bold">
                  Thay đổi thông tin liên hệ
                  <p className="text-sm font-normal text-text-body mt-2">
                    Bạn sẽ cần xác thực lại danh tính để hoàn tất thay đổi
                  </p>
                </div>

                <div
                  className="cursor-pointer p-1 hover:bg-gray-300 rounded-full"
                  onClick={onCloseModal}
                >
                  <IoClose className="w-7 h-7 text-text-subtitle cursor-pointer" />
                </div>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col p-4"
              >
                {typeChange === "email" ? (
                  <InputField
                    label="Email"
                    type="email"
                    placeholder="Nhập email mới"
                    registration={register("email")}
                    error={errors.email}
                    requied={true}
                  />
                ) : (
                  <InputField
                    label="Địa chỉ"
                    type="text"
                    placeholder="Nhập địa chỉ mới"
                    registration={register("address")}
                    error={errors.address}
                    requied={true}
                  />
                )}

                <div className="flex items-center flex-row-reverse gap-4 pt-10">
                  <Button
                    variant="primary"
                    fullWidth
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="!h-10"
                  >
                    {loading ? <ScaleLoader height={25} /> : "Xác nhận"}
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

      {step === 2 && (
        <ConfirmOtpModal
          isOpen={true}
          onClose={() => onCloseModal()}
          onPre={() => onPreModal()}
          onSubmit={handleChangeInfo}
        />
      )}
    </AnimatePresence>
  );
}
