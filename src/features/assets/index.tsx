import { usePerfectScrollbar } from "../../hooks/usePerfectScrollbar.ts";

export default function Assets() {
  const { containerRef } = usePerfectScrollbar();

  return (
    <div
      className="flex flex-col w-full h-[calc(var(--app-height)-64px)] relative gap-4 hide-scrollbar"
      ref={containerRef}
    ></div>
  );
}
