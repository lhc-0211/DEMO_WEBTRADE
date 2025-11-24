import { yupResolver } from "@hookform/resolvers/yup";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { GoDotFill } from "react-icons/go";
import { IoClose } from "react-icons/io5";
import Modal from "react-modal";
import ScaleLoader from "react-spinners/ScaleLoader";
import * as yup from "yup";
import type { AccountProfile, ChangePassAccountForm } from "../../../../types";
import { validatePasswordRules } from "../../../../utils/auth";
import Button from "../../../common/Button";
import InputField from "../../../inputs/InputField";

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

const schema = yup.object({
  passwordOld: yup.string().required("Vui lòng nhập mật khẩu"),
  password: yup.string().required("Vui lòng nhập mật khẩu mới"),
  passwordConfirm: yup
    .string()
    .required("Vui lòng nhập lại mật khẩu mới")
    .oneOf([yup.ref("password")], "Mật khẩu không trùng khớp"),
});

export default function ChangePassAccountModal({
  isOpen,
  onClose,
  accountProfile,
}: {
  isOpen: boolean;
  onClose: () => void;
  accountProfile: AccountProfile | null;
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangePassAccountForm>({
    resolver: yupResolver(schema),
  });

  const password = watch("password") || "";

  const rules = validatePasswordRules(password);

  const ruleList = [
    { id: "length", label: "8 - 16 ký tự", ok: rules.length },
    {
      id: "uppercase",
      label: "Ít nhất 1 chữ cái viết hoa",
      ok: rules.uppercase,
    },
    { id: "number", label: "Ít nhất 1 số", ok: rules.number },
    { id: "special", label: "Ít nhất 1 ký tự đặc biệt", ok: rules.special },
  ];

  const onCloseModal = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: ChangePassAccountForm) => {
    alert("submit" + JSON.stringify(data));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          contentLabel="Đổi mật khẩu"
          ariaHideApp={false}
          style={customStyles}
          closeTimeoutMS={25} // phải trùng với thời gian transition
          overlayClassName="ReactModal__Overlay"
          className="ReactModal__Content"
        >
          <motion.div
            layout
            key="change-password-account-modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              duration: 0.1,
              ease: "easeOut",
            }}
            className="flex flex-col gap-4 rounded-xl bg-background-primary"
          >
            <div className="flex flex-col gap-4 p-4 rounded-xl border border-border">
              <div
                className={`flex flex-row items-center justify-between pb-5 border-b border-border px-4 py-4`}
              >
                <div className="text-text-title text-[20px] text-bold">
                  Đổi mật khẩu
                </div>

                <div
                  className="cursor-pointer p-1 hover:bg-gray-300 rounded-full"
                  onClick={onCloseModal}
                >
                  <IoClose className="w-7 h-7 text-text-subtitle cursor-pointer" />
                </div>
              </div>

              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <h2 className="text-2xl font-black text-text-title">
                      Bạn muốn đổi mật khẩu?
                    </h2>
                    <h3 className="text-sm font-medium text-text-subtitle">
                      Vui lòng nhập mật khẩu đã được đăng ký với DTND dưới đây
                      để thiết lập lại mật khẩu.
                    </h3>
                  </div>
                </div>
              </div>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-8"
              >
                <div className="flex flex-col gap-3">
                  <InputField
                    label="Mật khẩu hiện tại"
                    type="passwordOld"
                    typeInput="password"
                    placeholder="Nhập mật khẩu hiện tại"
                    error={errors.passwordOld}
                    registration={register("passwordOld")}
                    className="h-12!"
                    requied={true}
                  />

                  <div className="flex flex-col">
                    <InputField
                      label="Mật khẩu mới"
                      type="password"
                      typeInput="password"
                      placeholder="Nhập mật khẩu mới"
                      error={errors.password}
                      registration={register("password")}
                      className="h-12!"
                      requied={true}
                    />

                    <motion.ul
                      layout
                      className="ml-4 text-red-500 space-y-1 text-xs font-medium overflow-hidden"
                      style={{
                        minHeight:
                          password && ruleList.some((r) => !r.ok)
                            ? "1.5em mt-2"
                            : "0",
                      }}
                    >
                      <AnimatePresence mode="popLayout">
                        {password &&
                          ruleList
                            .filter((r) => !r.ok)
                            .map((r) => (
                              <motion.li
                                key={r.id}
                                layout="position" // mượt khi thêm/xóa
                                className="overflow-hidden"
                              >
                                <span className="flex items-center gap-1 pt-1">
                                  <GoDotFill />
                                  {r.label}
                                </span>
                              </motion.li>
                            ))}
                      </AnimatePresence>
                    </motion.ul>
                  </div>

                  <InputField
                    label="Nhập lại mật khẩu"
                    type="password"
                    typeInput="password"
                    placeholder="Nhập lại mật khẩu mới"
                    error={errors.passwordConfirm}
                    registration={register("passwordConfirm")}
                    className="h-12!"
                    requied={true}
                  />
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10!"
                >
                  {isSubmitting ? <ScaleLoader height={25} /> : "Xác nhận"}
                </Button>
              </form>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
