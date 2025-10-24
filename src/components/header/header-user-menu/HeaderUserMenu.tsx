import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import { HiDotsHorizontal } from "react-icons/hi";
import { IoIosArrowForward } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";
import { RiSettings3Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import LoginIcon from "../../../assets/imgs/icons/login.svg?react";
import { useAnimationDelay } from "../../../hooks/useAnimationDelay";
import { usePrevious } from "../../../hooks/usePrevious";
import { useAppDispatch, useAppSelector } from "../../../store/hook";
import { logout } from "../../../store/slices/auth/slice";
import {
  selectAccountProfile,
  selectAccountProfileStatus,
} from "../../../store/slices/client/selector";
import {
  fetchAccountProfileRequest,
  openLoginModal,
} from "../../../store/slices/client/slice";
import type { Token } from "../../../types";
import { formatAccount, formatAccountType } from "../../../utils";
import Button from "../../common/Button";
import AccountSetting from "./AccountSetting";
import HeaderUserMenuSkeleton from "./HeaderUserMenuSkeleton";

type MenuAccountType = "account" | "setting";

export default function HeaderUserMenu({ token }: { token: Token }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const accountProfile = useAppSelector(selectAccountProfile);
  const { loading } = useAppSelector(selectAccountProfileStatus);

  const { isVisible, isAnimating, toggle, close } = useAnimationDelay(200);

  const {
    isVisible: isVisibleFunc,
    isAnimating: isAnimatingFunc,
    open: openFunc,
    close: closeFunc,
  } = useAnimationDelay(200);

  const refUserMenu = useRef<HTMLDivElement>(null);

  const [menuAccountType, setMenuAccountType] =
    useState<MenuAccountType | null>();

  const preToken = usePrevious(token);

  useEffect(() => {
    const handlerCloseMenu = (e: MouseEvent) => {
      if (
        refUserMenu.current &&
        !refUserMenu.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handlerCloseMenu);
    return () => {
      document.removeEventListener("mousedown", handlerCloseMenu);
    };
  }, [close]);

  useEffect(() => {
    if (token && !_.isEqual(token, preToken)) {
      dispatch(fetchAccountProfileRequest());
    }
  }, [token, preToken, dispatch]);

  const handleClickLogin = () => {
    dispatch(openLoginModal());
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/price-board");
    close();
  };

  const handleClickFunc = (value: MenuAccountType) => {
    setMenuAccountType(value);
    close();
    openFunc();
  };

  return (
    <>
      <div
        className={`flex flex-row gap-2 items-center relative px-1 ${
          token ? "bg-button-gray rounded-xl" : ""
        }`}
      >
        {token ? (
          <>
            {" "}
            <Button
              onClick={() => alert("Thông báo của DTND!")}
              variant="close"
              className="!p-2 !h-9"
            >
              <FaBell className="size-5 min-w-5" />
            </Button>
            <div className="h-[11px] w-[1.5px] bg-DTND-300 rounded-xl"></div>
            {loading ? (
              <HeaderUserMenuSkeleton />
            ) : (
              <div
                className="px-1 flex flex-row gap-2 items-center cursor-pointer"
                onClick={() => {
                  toggle();
                  closeFunc();
                }}
              >
                <div
                  className="w-9 h-9 rounded-full bg-center bg-no-repeat bg-cover border border-yellow-500 bg-DTND-400 shadow-[0_0_0_2px_rgba(250,204,21,0.3)]"
                  style={{
                    backgroundImage: `url(${accountProfile?.cAvatarImg})`,
                  }}
                ></div>
                <div className="py-1 flex flex-col gap-1">
                  <span className="text-xs font-normal text-text-body">
                    {accountProfile?.cUserName || accountProfile?.cCustomerName}
                  </span>
                  <span className="text-[10px] font-normal text-text-subtitle">
                    {accountProfile?.cAccountDefault &&
                      formatAccount(accountProfile?.cAccountDefault)}
                  </span>
                </div>

                <HiDotsHorizontal
                  className="text-icon-medium text-lg"
                  id="global-tooltip"
                  data-tooltip-id="global-tooltip"
                  data-tooltip-content="Thông tin tài khoản"
                  data-tooltip-place="left"
                />
              </div>
            )}
          </>
        ) : (
          <>
            <Button onClick={() => handleClickLogin()} variant="primary">
              <LoginIcon />
              Đăng nhập
            </Button>
          </>
        )}

        {isVisible && (
          <div
            className={`absolute rounded-xl top-12 right-0 w-[340px] bg-sidebar-default z-50 ${
              isAnimating
                ? "animate-fadeInFromTopRight"
                : "animate-fadeOutToTopRight"
            }`}
            ref={refUserMenu}
          >
            <div className="flex flex-col w-full h-full">
              <div
                className="w-full h-[100px] bg-DTND-400 rounded-b-[25px] border-none bg-center bg-no-repeat bg-cover"
                style={{
                  backgroundImage: `url(${accountProfile?.cBackGroundImg})`,
                }}
              ></div>
              <div className="px-12 flex flex-col gap-4 relative">
                <div className="flex flex-row gap-4 items-end absolute -top-[14px]">
                  <div
                    className="w-16 h-16 rounded-full bg-DTND-400 bg-center bg-no-repeat bg-cover border border-yellow-500 shadow-[0_0_0_2px_rgba(250,204,21,0.3)]"
                    style={{
                      backgroundImage: `url(${accountProfile?.cAvatarImg})`,
                    }}
                  ></div>
                  <div className="flex flex-col py-1">
                    <span className="text-base font-semibold text-text-title">
                      {accountProfile?.cUserName}
                    </span>
                    <span className="text-xs font-medium text-text-subtitle flex flex-row items-center gap-1">
                      TK: {accountProfile?.cAccountDefault}{" "}
                      {accountProfile?.cAccountDefault &&
                        (() => {
                          const info = formatAccountType(
                            accountProfile.cAccountDefault
                          );
                          return (
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${
                                info?.color || ""
                              }`}
                            >
                              {info?.label}
                            </span>
                          );
                        })()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col w-full mt-15 px-4">
                <div
                  className="flex flex-row items-center justify-between w-full h-8 px-1 rounded-xl hover:bg-DTND-1000"
                  onClick={() => handleClickFunc("account")}
                >
                  <div className="flex flex-row items-center justify-center gap-2">
                    <RiSettings3Fill />
                    <span className="text-sm">Thông tin tài khoản</span>
                  </div>
                  <IoIosArrowForward className="w-4 h-4" />
                </div>
              </div>
              <div
                className="py-3 px-6 flex flex-row items-center gap-4 cursor-pointer hover:bg-skin-natural-2 rounded-xl mt-auto"
                onClick={() => handleLogout()}
              >
                <IoLogOutOutline className="w-6 h-6 text-error-default" />
                <span className="text-sm font-medium text-error-default">
                  Đăng xuất
                </span>
              </div>
            </div>
          </div>
        )}

        {isVisibleFunc && (
          <div
            className={`absolute rounded-xl top-12 right-0 w-[340px] bg-sidebar-default z-50 ${
              isAnimatingFunc
                ? "animate-fadeInFromTopRight"
                : "animate-fadeOutToTopRight"
            }`}
          >
            {menuAccountType === "account" && (
              <AccountSetting
                accountProfile={accountProfile}
                close={closeFunc}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
