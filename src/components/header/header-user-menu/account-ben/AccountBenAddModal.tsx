import { AnimatePresence, motion } from "framer-motion";
import _ from "lodash";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import Modal from "react-modal";
import { usePrevious } from "../../../../hooks/usePrevious";
import { useToast } from "../../../../hooks/useToast";
import { useAppDispatch, useAppSelector } from "../../../../store/hook";
import { selectToken } from "../../../../store/slices/auth/selector";
import { selectUpdateBeneficiaryStatus } from "../../../../store/slices/client/selector";
import { fetchUpdateBeneficiaryRequest } from "../../../../store/slices/client/slice";
import type {
  AccountBenAddForm,
  AccountProfile,
} from "../../../../types/client";
import ConfirmOtpModal from "../../../auth/ConfirmOtpModal";
import Button from "../../../common/Button";
import InputField from "../../../inputs/InputField";
import InputSearchFieldBank from "../../../inputs/InputSearchFieldBank";

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
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);
  const { success, loading } = useAppSelector(selectUpdateBeneficiaryStatus);

  const toast = useToast();

  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AccountBenAddForm>();

  const preSuccess = usePrevious(success);

  useEffect(() => {
    if (!success || _.isEqual(success, preSuccess)) return;

    // toast("Đã thêm tài khoản thụ hưởng thành công!", "success");
    onCloseModal();
  }, [preSuccess, success, toast]);

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

  const handleAddAccountBen = (otp: string) => {
    const data = getValues();

    const { bank, accountNumber } = data;

    const params = {
      accountAuthor: token?.cCustomerCode || "",
      accountType: "BANK",
      bankCode: bank?.bankCode || "",
      bankAccountCode: accountNumber || "",
      channel: "I",
      defaultFlag: 0,
    };

    dispatch(fetchUpdateBeneficiaryRequest({ params, otp }));
  };

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
                    {/* <InputField
                      label="Ngân hàng"
                      type="bank"
                      placeholder="Nhập ngân hàng"
                      registration={register("bank")}
                      error={errors.bank}
                      requied={true}
                    /> */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="label-search-bank">
                        <span className="font-medium text-sm text-text-title">
                          Ngân hàng
                        </span>
                        <span className="text-red-500 text-xs font-medium">
                          {" "}
                          *
                        </span>
                      </label>
                      <Controller
                        name="bank"
                        control={control}
                        rules={{ required: "Vui lòng chọn ngân hàng" }}
                        render={({ field, fieldState }) => (
                          <div>
                            <InputSearchFieldBank
                              onChange={field.onChange}
                              placeholder="Tìm kiếm ngân hàng"
                              className={`h-11! ${
                                fieldState.error
                                  ? "border! border-red-500!"
                                  : ""
                              }`}
                            />
                            {fieldState.error && (
                              <p className="text-red-500 text-xs mt-1">
                                {fieldState.error.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    <InputField
                      label="Số tài khoản"
                      type="text"
                      placeholder="Nhập số tài khoản"
                      registration={register("accountNumber", {
                        required: "Vui lòng nhập số tài khoản",
                      })}
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
              loading={loading}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
