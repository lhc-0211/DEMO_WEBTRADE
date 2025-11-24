import _ from "lodash";
import { useEffect, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { MdOutlineAdd } from "react-icons/md";
import useDropdownAnimationMulti from "../../../../hooks/useDropdownAnimationMulti.ts";
import { usePerfectScrollbar } from "../../../../hooks/usePerfectScrollbar.ts.ts";
import { usePrevious } from "../../../../hooks/usePrevious.ts";
import { useToast } from "../../../../hooks/useToast.ts";
import { useAppDispatch, useAppSelector } from "../../../../store/hook.ts";
import {
  selectDeleteBeneficiaryStatus,
  selectListBeneficiary,
  selectListBeneficiaryStatus,
  selectUpdateBeneficiaryStatus,
} from "../../../../store/slices/client/selector.ts";
import {
  fetchDeleteBeneficiaryRequest,
  fetchListBeneficiaryRequest,
  fetchUpdateBeneficiaryRequest,
  resetFetchDeleteAccountBen,
  resetFetchUpdateBeneficiary,
} from "../../../../store/slices/client/slice.ts";
import type { AccountProfile, Beneficiary } from "../../../../types/client.ts";
import { getBankLogo } from "../../../../utils/dom.ts";
import ConfirmOtpModal from "../../../auth/ConfirmOtpModal.tsx";
import AccountBenAddModal from "./AccountBenAddModal.tsx";
import { ListBeneficiarySkeleton } from "./ListBeneficiarySkeleton.tsx";

export default function AccountBen({
  handleOpenModal,
  handleCloseModal,
  accountProfile,
}: {
  handleOpenModal: () => void;
  handleCloseModal: () => void;
  accountProfile: AccountProfile | null;
}) {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const listBeneficiary = useAppSelector(selectListBeneficiary);
  const { loading } = useAppSelector(selectListBeneficiaryStatus);
  const { loading: loadingUpdate, success } = useAppSelector(
    selectUpdateBeneficiaryStatus
  );
  const { success: successDel } = useAppSelector(selectDeleteBeneficiaryStatus);

  const { containerRef } = usePerfectScrollbar();

  const {
    hoverId,
    animatingOutId,
    handleMouseEnter,
    handleMouseLeave,
    closeDropdown,
  } = useDropdownAnimationMulti();

  const [openModalAdd, setOpenModalAdd] = useState<boolean>(false);
  const [data, setData] = useState<Beneficiary | null>(null);
  const [openOtp, setOpenOtp] = useState<boolean>(false);
  const [type, setType] = useState<"edit" | "del" | null>(null);

  const preSuccess = usePrevious(success);
  const preSuccessDel = usePrevious(successDel);

  useEffect(() => {
    if (!success || _.isEqual(success, preSuccess)) return;

    toast("Thay đổi tài khoản thụ hưởng thành công!", "success");
    dispatch(fetchListBeneficiaryRequest());

    handleCloseOtp();

    dispatch(resetFetchUpdateBeneficiary());
  }, [preSuccess, success, toast, dispatch]);

  console.log(successDel);

  useEffect(() => {
    if (!successDel || _.isEqual(successDel, preSuccessDel)) return;

    toast("Xóa tài khoản thụ hưởng thành công!", "success");
    dispatch(fetchListBeneficiaryRequest());

    handleCloseOtp();

    dispatch(resetFetchDeleteAccountBen());
  }, [preSuccessDel, successDel, toast, dispatch]);

  useEffect(() => {
    dispatch(fetchListBeneficiaryRequest());
  }, [dispatch]);

  const handleGetParamsBeneficiary = (data: Beneficiary) => {
    setData(data);
    setOpenOtp(true);
    handleOpenModal();
  };

  const handleSetDefaultBeneficiary = (otp: string) => {
    if (!data) return;
    const { customerCode, accountType, bankCode, bankAccountCode } = data;

    const params = {
      accountAuthor: customerCode || "",
      accountType: accountType || "",
      bankCode: bankCode || "",
      bankAccountCode: bankAccountCode || "",
      channel: "I",
      defaultFlag: 1,
    };

    dispatch(fetchUpdateBeneficiaryRequest({ params, otp }));
  };

  const handleDeleteBeneficiary = (otp: string) => {
    if (!data) return;
    const { pkBen } = data;

    const params = {
      id: pkBen || "",
      channel: "I",
    };

    dispatch(fetchDeleteBeneficiaryRequest({ params, otp }));
  };

  const handleCloseOtp = () => {
    setOpenOtp(false);
    setData(null);
    handleCloseModal();
  };

  return (
    <div
      ref={containerRef}
      className="h-[calc(var(--app-height)-305px)] w-[360px] bg-sidebar-default overflow-hidden relative"
    >
      <div className="flex flex-row items-center justify-between text-sm font-medium h-9 bg-gray-300 text-text-body px-5 sticky top-0 z-50">
        Tài khoản đã liên kết
        <span
          className="text-xs font-medium text-DTND-300 flex flex-row gap-1 cursor-pointer hover:text-DTND-400"
          onClick={() => {
            handleOpenModal();
            setOpenModalAdd(true);
          }}
        >
          <MdOutlineAdd className="w-4 h-4" /> Thêm tài khoản
        </span>
      </div>

      {/* List tài khoản thụ hưởng */}
      {loading ? (
        <div className="mt-6 px-4">
          <ListBeneficiarySkeleton />
        </div>
      ) : (
        <div className="mt-6 px-4">
          {listBeneficiary.map((bank) => (
            <div
              key={bank.pkBen}
              className="bg-gray-300/40 p-2.5 rounded-lg h-[100px] flex flex-col justify-between relative mb-3"
            >
              <div className="flex flex-row gap-3 items-center">
                <div
                  className="w-8 h-8 min-w-8 rounded-full bg-center bg-no-repeat bg-cover"
                  style={{
                    backgroundImage: `url(${getBankLogo(bank.bankCode || "")})`,
                  }}
                />

                <span className="text-xs font-medium text-text-title">
                  {bank.bankName}
                </span>

                {/* 3 dots */}
                <div
                  className="ml-auto relative"
                  onMouseEnter={() => handleMouseEnter(bank.pkBen)}
                  onMouseLeave={() => handleMouseLeave(bank.pkBen)}
                >
                  <BsThreeDots className="w-6 h-6 cursor-pointer" />

                  {hoverId === bank.pkBen && (
                    <div
                      className={`absolute right-0 w-30 py-2 z-50 bg-gray-300 shadow-md rounded-md text-xs font-medium transition-all duration-150 p-2 ${
                        animatingOutId === bank.pkBen
                          ? "animate-fadeOutToTopRight"
                          : "animate-fadeInFromTopRight"
                      }`}
                    >
                      <div
                        className="px-3 py-1.5 cursor-pointer rounded hover:bg-DTND-500 hover:translate-x-0.5"
                        onClick={() => {
                          closeDropdown(bank.pkBen);
                          setType("del");
                          handleGetParamsBeneficiary(bank);
                        }}
                      >
                        Xóa
                      </div>

                      <div
                        className="px-3 py-1.5 cursor-pointer rounded hover:bg-DTND-500 hover:translate-x-0.5"
                        onClick={() => {
                          closeDropdown(bank.pkBen);
                          handleGetParamsBeneficiary(bank);
                          setType("edit");
                        }}
                      >
                        Đặt mặc định
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-text-subtitle">
                    Số tài khoản
                  </span>
                  <span className="text-xs font-medium text-text-title">
                    {bank.bankAccountCode}
                  </span>
                </div>
                {/* Mặc định */}
                {bank.defaultFlag === 1 && (
                  <div className="px-2 py-1 rounded-xl bg-DTND-500/30 grid place-items-center">
                    <span className="text-xs font-medium text-yellow-500">
                      Mặc định
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AccountBenAddModal
        isOpen={openModalAdd}
        onClose={() => {
          setOpenModalAdd(false);
          handleCloseModal();
        }}
        accountProfile={accountProfile}
      />
      {openOtp && (
        <ConfirmOtpModal
          isOpen={openOtp}
          onClose={() => handleCloseOtp()}
          onPre={() => handleCloseOtp()}
          onSubmit={
            type === "del"
              ? handleDeleteBeneficiary
              : handleSetDefaultBeneficiary
          }
          loading={loadingUpdate}
        />
      )}
    </div>
  );
}
