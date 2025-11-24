import { useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { usePerfectScrollbar } from "../../../../hooks/usePerfectScrollbar.ts";
import type { AccountProfile } from "../../../../types";
import ChangePassAccountModal from "./ChangePassAccountModal.tsx";

export default function AccountSecurity({
  handleOpenModal,
  handleCloseModal,
  accountProfile,
}: {
  handleOpenModal: () => void;
  handleCloseModal: () => void;
  accountProfile: AccountProfile | null;
}) {
  const { containerRef } = usePerfectScrollbar();

  const [openChangePass, setOpenChangePass] = useState<boolean>(false);

  const handleOpenChangePass = () => {
    handleOpenModal();
    setOpenChangePass(true);
  };

  const handleCloseChangePass = () => {
    handleCloseModal();
    setOpenChangePass(false);
  };

  return (
    <div
      ref={containerRef}
      className="h-[calc(var(--app-height)-305px)] w-[360px] bg-sidebar-default overflow-hidden relative"
    >
      <div className="flex flex-row items-center justify-between text-sm font-medium h-9 bg-gray-300 text-text-body px-5 sticky top-0 z-50">
        Thông tin bảo mật
      </div>

      <div className="p-4 flex flex-row items-center justify-between">
        <div className="flex flex-col gao-1 text-xs">
          <span className="font-medium text-text-body">Mật khẩu</span>
          <span>********</span>
        </div>
        <button
          className="p-1 rounded-full hover:bg-gray-300"
          onClick={handleOpenChangePass}
        >
          <AiOutlineEdit />
        </button>
      </div>

      {openChangePass && (
        <ChangePassAccountModal
          isOpen={openChangePass}
          onClose={handleCloseChangePass}
          accountProfile={accountProfile}
        />
      )}
    </div>
  );
}
