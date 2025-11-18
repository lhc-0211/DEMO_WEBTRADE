import logoShort from "@/assets/imgs/logo-short.png";
import logoFull from "@/assets/imgs/logo.png";
import { AnimatePresence, motion } from "framer-motion";
import {
  VscLayoutActivitybarRight,
  VscLayoutSidebarRight,
  VscLayoutSidebarRightOff,
} from "react-icons/vsc";
import { useLocation, useNavigate } from "react-router-dom";
import packageJson from "../../../package.json";
import { SIDE_BAR_GROUPS } from "../../configs/sidebar";
import { useAppSelector } from "../../store/hook";
import { selectToken } from "../../store/slices/auth/selector";
import type { SidebarItem, SidebarMode } from "../../types";

interface Props {
  mode: SidebarMode;
  width: number;
  changeModeSidebar: (mode: SidebarMode) => void;
}

export default function Sidebar({ mode, width, changeModeSidebar }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const token = useAppSelector(selectToken);

  const handleClick = (item: SidebarItem) => {
    if (item.requiresLogin && !token) {
      alert("Chức năng cần đăng nhập");
    } else {
      // alert("oke");
      navigate(item.path);
    }
  };

  const sidebarVariants = {
    hidden: { x: -width, opacity: 0 },
    mini: { x: 0, opacity: 1, width: 72 },
    full: { x: 0, opacity: 1, width },
  };

  return (
    <div className="relative h-full">
      <AnimatePresence mode="wait">
        {mode !== "hidden" && (
          <motion.aside
            key={mode}
            variants={sidebarVariants}
            initial="hidden"
            animate={mode}
            exit="hidden"
            transition={{ type: "spring", stiffness: 80, damping: 14 }}
            className="flex flex-col gap-4 items-center h-full bg-sidebar-default text-text-body shadow-lg px-3"
          >
            {/* Logo */}
            <div className="h-10 mt-4 grid place-items-center">
              <motion.img
                key={mode === "full" ? "logo-full" : "logo-mini"}
                src={mode === "full" ? logoFull : logoShort}
                alt="logo"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-auto h-9 object-contain"
              />
            </div>

            {/* Sidebar content */}
            <div className="flex flex-col gap-1 w-full mt-4 overflow-y-auto no-scrollbar">
              {SIDE_BAR_GROUPS.map((group) => (
                <div key={group.id}>
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                      <motion.div
                        whileHover={{ x: 0 }}
                        key={item.id}
                        className={`sidebar-item group py-2 w-full px-2 cursor-pointer rounded-xl transition-all duration-200 ease-out ${
                          isActive ? "bg-DTND-500" : "hover:bg-DTND-1000"
                        } ${
                          mode === "mini"
                            ? "grid place-items-center"
                            : "grid grid-cols-[32px_auto]"
                        }`}
                        onClick={() => handleClick(item)}
                      >
                        <Icon
                          className={`w-6 h-6 transition-colors duration-150 ${
                            isActive
                              ? "text-black-white-50"
                              : "text-text-subtitle group-hover:text-black-white-50"
                          }`}
                        />
                        {mode === "full" && (
                          <span
                            className={`text-sm font-medium transition-colors duration-150 ${
                              isActive
                                ? "text-black-white-50"
                                : "text-text-subtitle group-hover:text-black-white-50"
                            }`}
                          >
                            {item.title}
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              className={`text-xs text-text-subtitle flex items-center justify-center w-full mt-auto pb-3 transition-all duration-200 ${
                mode === "mini"
                  ? "flex-col gap-1"
                  : "flex-row gap-2 justify-between px-2"
              }`}
            >
              <span className="flex flex-row items-center gap-1">
                <div className="bg-green-400 w-2 h-2 rounded-full animate-pulse" />
                {mode === "full" && <span>Connected</span>}
              </span>
              <span className="opacity-70">v.{packageJson.version}</span>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Nút toggle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className={`size-8 bg-background-primary from-yellow-200 to-yellow-400 rounded-full border border-yellow-500 shadow-[0_0_0_2px_rgba(250,204,21,0.3)] grid place-items-center absolute cursor-pointer hover:shadow-lg transition-all duration-300 ${
          mode === "hidden" ? "bottom-10 -right-11" : "bottom-10 -right-4"
        }`}
        onClick={() => {
          // Chuyển mode tuần tự: full -> mini -> hidden -> full
          if (mode === "full") changeModeSidebar("mini");
          else if (mode === "mini") changeModeSidebar("full");
          // else if (mode === "hidden") changeModeSidebar("full");
        }}
      >
        <div>
          {mode === "full" ? (
            <VscLayoutActivitybarRight className="text-lg text-yellow-700" />
          ) : mode === "mini" ? (
            <VscLayoutSidebarRightOff className="text-lg text-yellow-700" />
          ) : (
            <VscLayoutSidebarRight className="text-lg text-yellow-700" />
          )}
        </div>
      </motion.div>
    </div>
  );
}
