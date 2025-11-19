import { usePerfectScrollbar } from "../../../../hooks/usePerfectScrollbar.ts.ts";

export default function AccountBen({
  handleOpenModal,
}: {
  handleOpenModal: () => void;
}) {
  const { containerRef } = usePerfectScrollbar();

  return (
    <div
      ref={containerRef}
      className="h-[calc(var(--app-height)-377px)] w-[360px] bg-sidebar-default overflow-hidden relative"
    >
      <div className="flex flex-row items-center justify-between text-sm font-medium h-9 bg-gray-300 text-text-body px-5">
        Tài khoản đã liên kết
      </div>
    </div>
  );
}
