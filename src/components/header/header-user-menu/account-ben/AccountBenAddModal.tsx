import { yupResolver } from "@hookform/resolvers/yup";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import Modal from "react-modal";
import * as yup from "yup";
import type {
  AccountBenAddForm,
  AccountProfile,
} from "../../../../types/client";
import ConfirmOtpModal from "../../../auth/ConfirmOtpModal";
import Button from "../../../common/Button";
import InputField from "../../../inputs/InputField";

const schema = yup.object({
  bank: yup.string().required("Vui lòng nhập ngân hàng"),
  accountNumber: yup.string().required("Vui lòng nhập số tài khoản"),
  accountName: yup.string().required("Vui lòng nhập tên tài khoản"),
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

export default function AccountBenAddModal({
  isOpen,
  onClose,
  accountProfile,
}: {
  isOpen: boolean;
  onClose: () => void;
  accountProfile: AccountProfile | null;
}) {
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AccountBenAddForm>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (accountProfile && isOpen) {
      setValue("accountName", accountProfile.cUserName || "");
    }
  }, [accountProfile, setValue, isOpen]);

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
    setStep(1);
  };

  const onSubmit = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }
  };

  const handleAddAccountBen = () => {};

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {step === 1 && (
            <Modal
              isOpen={isOpen}
              contentLabel="Thay đổi thông tin tài khoản"
              ariaHideApp={false}
              style={customStyles}
              closeTimeoutMS={25}
              overlayClassName="ReactModal__Overlay"
              className="ReactModal__Content"
            >
              <motion.div
                key="change-acc-info-modal"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                className="flex flex-col gap-4 bg-cover bg-no-repeat bg-center rounded-xl"
              >
                <div className="flex flex-col rounded-xl border border-border bg-background-primary">
                  <div
                    className={`flex flex-row items-center justify-between pb-5 border-b border-border px-4 py-4`}
                  >
                    <div className="text-text-title text-[20px] text-bold">
                      Thêm tài khoản thụ hưởng
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
                    className="flex flex-col gap-2 p-4"
                  >
                    <InputField
                      label="Ngân hàng"
                      type="bank"
                      placeholder="Nhập ngân hàng"
                      registration={register("bank")}
                      error={errors.bank}
                      requied={true}
                    />
                    <InputField
                      label="Số tài khoản"
                      type="text"
                      placeholder="Nhập địa chỉ mới"
                      registration={register("accountNumber")}
                      error={errors.accountNumber}
                      requied={true}
                    />
                    <InputField
                      label="Chủ tài khoản"
                      type="text"
                      placeholder="Nhập địa tên chủ tài khoản"
                      registration={register("accountName")}
                      error={errors.accountName}
                      requied={true}
                      disabled={true}
                    />

                    <div className="flex items-center flex-row-reverse gap-4 pt-10">
                      <Button
                        variant="primary"
                        fullWidth
                        type="submit"
                        disabled={isSubmitting}
                        className="h-10!"
                      >
                        {/* {<ScaleLoader height={25} /> + "Xác nhận"} */}
                        Xác nhận
                      </Button>
                      <Button
                        variant="close"
                        fullWidth
                        className="h-10!"
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
              onSubmit={handleAddAccountBen}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
