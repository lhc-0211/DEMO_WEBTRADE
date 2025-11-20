import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { MdOutlineFileUpload } from "react-icons/md";
import Modal from "react-modal";
import ScaleLoader from "react-spinners/ScaleLoader";
import { useToast } from "../../../../hooks/useToast";
import type { AccountProfile } from "../../../../types/client";
import Button from "../../../common/Button";

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

export default function ChangeAvaAccountModal({
  isOpen,
  accountProfile,
  onClose,
}: {
  isOpen: boolean;
  accountProfile: AccountProfile | null;
  onClose: () => void;
}) {
  const toast = useToast();
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preView, setPreView] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const handleChangeImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // check data
    if (f.size / 1024 / 1024 > 5) {
      toast("Ảnh vượt quá dung lượng cho phép", "error");
      return;
    }

    setFile(f);
    setPreView(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file) {
      toast("Vui lòng chọn ảnh đại diện mới", "info");
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      // Gọi API upload avatar
      // await apiUploadAvatar(formData);

      // ví dụ giả lập
      await new Promise<void>((resolve) => {
        let percent = 0;

        const timer = setInterval(() => {
          percent += Math.floor(Math.random() * 10) + 5; // tăng ngẫu nhiên 5–15%

          if (percent >= 100) {
            percent = 100;
            clearInterval(timer);
            resolve(); // hoàn tất giả lập
          }

          setProgress(percent); // cập nhật UI
          console.log("Upload:", percent + "%");
        }, 150);
      });

      handleClose();
    } catch (err: unknown) {
      toast(err + "", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;

    setFile(null);
    setPreView(null);
    setProgress(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          contentLabel="Thay đổi ảnh đại diện tài khoản"
          ariaHideApp={false}
          style={customStyles}
          closeTimeoutMS={350}
          overlayClassName="ReactModal__Overlay"
          className="ReactModal__Content"
        >
          <motion.div
            key="change-acc-ava-modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col gap-4 bg-cover bg-no-repeat bg-center rounded-xl"
          >
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-background-primary p-2">
              <div className="flex flex-row items-center justify-between">
                <h1 className="text-[20px] text-text-title font-medium">
                  Thay đổi đại diện
                </h1>

                <div
                  className="cursor-pointer p-1 hover:bg-gray-300 rounded-full"
                  onClick={handleClose}
                >
                  <IoClose className="w-7 h-7 text-text-subtitle cursor-pointer" />
                </div>
              </div>
              <div className="flex flex-row gap-4 items-end">
                {/* Pre view AVA */}
                <div className="relative w-24 h-24 min-w-24">
                  {/* Vòng progress */}
                  <svg
                    className="absolute -top-1 -left-1 w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      stroke="#D1D5DB"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      stroke="#22C55E"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray="289" // 2 * PI * r
                      strokeDashoffset={289 - (289 * progress) / 100}
                      strokeLinecap="round"
                      style={{
                        transition: "stroke-dashoffset 0.2s linear",
                      }}
                    />
                  </svg>

                  {/* Avatar */}
                  <div
                    className="absolute inset-0 rounded-full w-22 h-22 bg-center bg-cover border border-yellow-500 shadow-[0_0_0_2px_rgba(250,204,21,0.3)]"
                    style={{
                      backgroundImage: `url(${
                        preView || accountProfile?.cAvatarImg
                      })`,
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Button
                    variant="close"
                    className="w-34"
                    onClick={() => inputFileRef?.current?.click()}
                  >
                    <MdOutlineFileUpload className="w-6 h-6 text-text-body" />
                    Tải ảnh lên
                  </Button>
                  <span className="text-sm text-text-subtitle">
                    Định dạng JPEG/PNG. Kích thước nhỏ hơn 5MB
                  </span>
                  <input
                    ref={inputFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChangeImg}
                    hidden
                  />
                </div>
              </div>
              <div className="flex items-center flex-row-reverse gap-4 pt-10">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => submit()}
                  disabled={isLoading}
                  className="h-10!"
                >
                  {isLoading ? <ScaleLoader height={25} /> : "Xác nhận"}
                </Button>
                <Button
                  variant="close"
                  fullWidth
                  className="h-10!"
                  type="button"
                  disabled={isLoading}
                  onClick={handleClose}
                >
                  Quay lại
                </Button>
              </div>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
