import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { RiEdit2Fill } from "react-icons/ri";
import { TbCameraPlus } from "react-icons/tb";
import { useAppSelector } from "../../../store/hook";
import { selectAccountProfileStatus } from "../../../store/slices/client/selector";
import type { AccountProfile } from "../../../types/client";
import AccountHeaderSkeleton from "./account-info/AccountHeaderSkeleton";
import AccountInfo from "./account-info/AccountInfo";
import ChangeAccountInfoModal from "./account-info/ChangeAccountInfoModal";
import ChangeNicknameModal from "./ChangeNicknamModal";

export default function AccountSetting({
  accountProfile,
  close,
}: {
  accountProfile: AccountProfile | null;
  close: () => void;
}) {
  const { loading } = useAppSelector(selectAccountProfileStatus);

  const [isOpenChangeNickname, setIsOpenChangeNickname] =
    useState<boolean>(false);

  const [isOpenChangeAccountInfo, setIsOpenChangeAccountInfo] =
    useState<boolean>(false);

  const refContainer = useRef<HTMLDivElement>(null);

  const [typeChange, setTypeChange] = useState<"email" | "address">("email");

  useEffect(() => {
    const handlerCloseMenu = (e: MouseEvent) => {
      if (
        refContainer.current &&
        !refContainer.current.contains(e.target as Node) &&
        !isOpenChangeNickname &&
        !isOpenChangeAccountInfo
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handlerCloseMenu);
    return () => {
      document.removeEventListener("mousedown", handlerCloseMenu);
    };
  }, [close, isOpenChangeNickname, isOpenChangeAccountInfo]);

  const handleOpenModalChangeAccountInfo = (type: "email" | "address") => {
    setTypeChange(type);
    setIsOpenChangeAccountInfo(true);
  };

  return (
    <div
      className="h-[calc(var(--app-height)-57px)] w-[360px] bg-sidebar-default"
      ref={refContainer}
    >
      <div className="w-full flex flex-row items-center justify-between p-4 border-b border-border">
        <h1 className="text-base font-medium text-text-title">
          Cài đặt tài khoản
        </h1>
        <div
          className="cursor-pointer p-1 hover:bg-gray-300 rounded-full"
          onClick={close}
        >
          <IoClose className="text-text-title h-5 w-5 min-w-5" />
        </div>
      </div>
      {loading ? (
        <AccountHeaderSkeleton />
      ) : (
        <>
          <div
            className="h-[150px] w-full rounded-b-2xl relative bg-center bg-no-repeat bg-cover"
            style={{
              backgroundImage: `url(${accountProfile?.cBackGroundImg})`,
            }}
          >
            <div className="bg-primary-darker rounded-md p-1 flex flex-row gap-1 absolute top-1 right-1">
              <TbCameraPlus className="text-text-title" />
              <span className="text-xs font-normal text-text-title">
                Thay ảnh bìa
              </span>
            </div>
          </div>
          <div className="relative px-6">
            <div className="flex flex-row gap-4 items-center absolute -top-[14px]">
              <div
                className="w-16 h-16 rounded-full relative bg-white bg-center bg-no-repeat bg-cover border border-yellow-500 shadow-[0_0_0_2px_rgba(250,204,21,0.3)]"
                style={{
                  backgroundImage: `url(${accountProfile?.cAvatarImg})`,
                }}
              >
                <div className="bg-primary-darker w-6 h-6 rounded-full grid place-items-center absolute -bottom-2 right-0">
                  <TbCameraPlus className="text-text-title" />
                </div>
              </div>
              <div className="flex flex-row gap-1 items-center">
                <span className="text-base font-medium text-text-title">
                  {accountProfile?.cUserName}
                </span>
                <div
                  className="cursor-pointer p-1 hover:bg-gray-300 rounded-full"
                  onClick={() => setIsOpenChangeNickname(true)}
                >
                  <RiEdit2Fill className="w-4 h-4 min-w-4" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-4 mt-18">
        <div className="text-xs text-yellow-400 p-[2px] border-b border-yellow-400 w-max">
          Thông tin chung
        </div>

        {/* Chức năng */}
        <AccountInfo
          accountProfile={accountProfile}
          handleOpenModalChangeAccountInfo={handleOpenModalChangeAccountInfo}
        />
      </div>

      {/* modal change nickname */}
      {isOpenChangeNickname && (
        <ChangeNicknameModal
          isOpen={isOpenChangeNickname}
          accountProfile={accountProfile}
          onClose={() => setIsOpenChangeNickname(false)}
        />
      )}

      {/* modal change account info */}
      {isOpenChangeAccountInfo && (
        <ChangeAccountInfoModal
          isOpen={isOpenChangeAccountInfo}
          typeChange={typeChange}
          accountProfile={accountProfile}
          onClose={() => setIsOpenChangeAccountInfo(false)}
        />
      )}
    </div>
  );
}
