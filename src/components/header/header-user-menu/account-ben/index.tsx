import { BsThreeDots } from "react-icons/bs";
import { MdOutlineAdd } from "react-icons/md";
import useDropdownAnimationMulti from "../../../../hooks/useDropdownAnimationMulti.ts";
import { usePerfectScrollbar } from "../../../../hooks/usePerfectScrollbar.ts.ts";
import { getBankLogo } from "../../../../utils/dom.ts";

export default function AccountBen({
  handleOpenModal,
}: {
  handleOpenModal: () => void;
}) {
  const { containerRef } = usePerfectScrollbar();

  const {
    hoverId,
    animatingOutId,
    handleMouseEnter,
    handleMouseLeave,
    closeDropdown,
  } = useDropdownAnimationMulti();

  const listBanks = [
    { id: 1, code: "MBB", acc: "999999999" },
    { id: 2, code: "VCB", acc: "123456789" },
    { id: 3, code: "TCB", acc: "666666666" },
  ];

  return (
    <div
      ref={containerRef}
      className="h-[calc(var(--app-height)-305px)] w-[360px] bg-sidebar-default overflow-hidden relative"
    >
      <div className="flex flex-row items-center justify-between text-sm font-medium h-9 bg-gray-300 text-text-body px-5 sticky top-0 z-50">
        Tài khoản đã liên kết
        <span className="text-xs font-medium text-DTND-300 flex flex-row gap-1 cursor-pointer hover:text-DTND-400">
          <MdOutlineAdd className="w-4 h-4" /> Thêm tài khoản
        </span>
      </div>

      {/* List tài khoản thụ hưởng */}
      <div className="mt-6 px-4">
        {listBanks.map((bank) => (
          <div
            key={bank.id}
            className="bg-gray-300/40 p-2.5 rounded-lg h-[100px] flex flex-col justify-between relative mb-3"
          >
            <div className="flex flex-row gap-3 items-center">
              <div
                className="w-8 h-8 min-w-8 rounded-full bg-center bg-no-repeat bg-cover"
                style={{
                  backgroundImage: `url(${getBankLogo(bank.code)})`,
                }}
              />

              <span className="text-xs font-medium text-text-title">
                {bank.code}
              </span>

              {/* 3 dots */}
              <div
                className="ml-auto relative"
                onMouseEnter={() => handleMouseEnter(bank.id)}
                onMouseLeave={() => handleMouseLeave(bank.id)}
              >
                <BsThreeDots className="w-6 h-6 cursor-pointer" />

                {hoverId === bank.id && (
                  <div
                    className={`absolute right-0 w-30 py-2 z-50 bg-gray-300 shadow-md rounded-md text-xs font-medium transition-all duration-150 p-2 ${
                      animatingOutId === bank.id
                        ? "animate-fadeOutToTopRight"
                        : "animate-fadeInFromTopRight"
                    }`}
                  >
                    <div
                      className="px-3 py-1.5 cursor-pointer rounded hover:bg-DTND-500 hover:translate-x-0.5"
                      onClick={() => closeDropdown(bank.id)}
                    >
                      Xóa
                    </div>

                    <div
                      className="px-3 py-1.5 cursor-pointer rounded hover:bg-DTND-500 hover:translate-x-0.5"
                      onClick={() => closeDropdown(bank.id)}
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
                  {bank.acc}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
