import { MdZoomOutMap } from "react-icons/md";
import { useAppSelector } from "../../store/hook";
import { selectToken } from "../../store/slices/auth/selector";
import { isEmptyObject } from "../../utils";
import InputFieldSearchMaster from "../inputs/InputFieldSearchMaster";
import { HeaderUserMenu } from "./header-user-menu";

export default function Header() {
  const token = useAppSelector(selectToken);

  const handleToggleFullscreen = () => {
    const elem = document.documentElement as HTMLElement;

    if (!document.fullscreenElement) {
      // Vào fullscreen
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err) => {
          console.error("Không thể bật fullscreen:", err);
        });
      } else if (
        (
          elem as HTMLElement & {
            webkitRequestFullscreen?: () => Promise<void>;
          }
        ).webkitRequestFullscreen
      ) {
        (
          elem as HTMLElement & { webkitRequestFullscreen: () => Promise<void> }
        ).webkitRequestFullscreen();
      } else if (
        (elem as HTMLElement & { msRequestFullscreen?: () => Promise<void> })
          .msRequestFullscreen
      ) {
        (
          elem as HTMLElement & { msRequestFullscreen: () => Promise<void> }
        ).msRequestFullscreen();
      }
    } else {
      // Thoát fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.error("Không thể thoát fullscreen:", err);
        });
      } else if (
        (document as Document & { webkitExitFullscreen?: () => Promise<void> })
          .webkitExitFullscreen
      ) {
        (
          document as Document & { webkitExitFullscreen: () => Promise<void> }
        ).webkitExitFullscreen();
      } else if (
        (document as Document & { msExitFullscreen?: () => Promise<void> })
          .msExitFullscreen
      ) {
        (
          document as Document & { msExitFullscreen: () => Promise<void> }
        ).msExitFullscreen();
      }
    }
  };
  return (
    <div className="flex items-center justify-between h-full w-full">
      <div className="flex flex-row gap-2">
        {isEmptyObject(token) && (
          <img src="/src/assets/imgs/logo.png" alt="logo" />
        )}
      </div>

      <div className="flex flex-row gap-4 items-center">
        <InputFieldSearchMaster
          className="w-[200px] h-9"
          placeholder="Tìm kiếm"
        />

        <MdZoomOutMap
          className="text-lg"
          onClick={() => handleToggleFullscreen()}
        />

        <HeaderUserMenu token={token} />
      </div>
    </div>
  );
}
