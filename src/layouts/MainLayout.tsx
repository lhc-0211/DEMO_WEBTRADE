import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { Tooltip } from "react-tooltip";
import ForgotAccountModal from "../components/auth/ForgotAccountModal";
import LoginModal from "../components/auth/LoginModal";
import SessionExpiredModal from "../components/auth/SessionExpiredModal";
import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";
import { WindowContextProvider } from "../context/WindowContext";
import { useAppDispatch, useAppSelector } from "../store/hook";
import { selectToken } from "../store/slices/auth/selector";
import { fetchListShareStockRequest } from "../store/slices/place-order/slice";
import type { SidebarMode } from "../types/layout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAppSelector(selectToken);
  const dispatch = useAppDispatch();

  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(() => {
    const saved = localStorage.getItem("sidebarMode") as SidebarMode | null;
    return token ? saved || "full" : "hidden";
  });

  // Lấy list mã chứng khoán
  useEffect(() => {
    dispatch(fetchListShareStockRequest());
  }, [dispatch]);

  useEffect(() => {
    if (!token) {
      setSidebarMode("hidden");
    } else {
      const saved = localStorage.getItem("sidebarMode") as SidebarMode | null;
      setSidebarMode(saved || "full");
    }
  }, [token]);

  const getSidebarWidth = () => {
    switch (sidebarMode) {
      case "full":
        return 180;
      case "mini":
        return 68;

      default:
        return 0;
    }
  };

  const handleChangeModeSidebar = (mode: SidebarMode) => {
    setSidebarMode(mode);
    localStorage.setItem("sidebarMode", mode);
  };

  return (
    <WindowContextProvider>
      <div
        className="grid h-[calc(var(--app-height))] overflow-hidden bg-background-primary text-text-body"
        style={{ gridTemplateColumns: `${getSidebarWidth()}px auto` }}
      >
        {token ? (
          <Sidebar
            mode={sidebarMode}
            width={
              sidebarMode === "mini" ? 68 : sidebarMode === "full" ? 180 : 0
            }
            changeModeSidebar={handleChangeModeSidebar}
          />
        ) : (
          <div></div>
        )}

        <div className="flex flex-col h-full w-full overflow-hidden px-4">
          {/* Header cố định full width */}
          <div className="h-[60px] shrink-0 w-full relative z-10 bg-background-primary">
            <Header />
          </div>

          {/* Main có thể scroll ngang */}
          <main className="flex-1 w-full">
            <div className="">{children}</div>
          </main>

          {/* Modal đăng nhập */}
          <LoginModal />

          {/* Modal quên mật khẩu */}
          <ForgotAccountModal />

          {/* Modal hết phiên */}
          <SessionExpiredModal />
        </div>

        <Tooltip
          id="global-tooltip"
          className="bg-gray-800! text-white! text-[10px]! lg:text-xs! px-2! py-1! rounded!"
        />

        <ToastContainer />
      </div>
    </WindowContextProvider>
  );
}
