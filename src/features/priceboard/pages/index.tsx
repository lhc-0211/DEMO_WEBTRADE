import { useState } from "react";
import type { FlashResult } from "../../../types";
import Board from "../components/board";
import { queueFlash } from "../components/board/workers/flashManager";
import MenuDashboard from "../components/menu-board";
import SynAnalysisPriceBoard from "../components/synthetic-analysis";

export default function PriceBoard() {
  const flashWorker = new Worker(
    new URL("../components/board/workers/flashWorker.ts", import.meta.url),
    { type: "module" }
  );

  flashWorker.onmessage = (
    e: MessageEvent<{ type: "flash"; data: readonly FlashResult[] }>
  ) => {
    if (e.data.type === "flash") {
      queueFlash(e.data.data);
    }
  };

  (window as unknown as { flashWorker: Worker }).flashWorker = flashWorker;

  const [active, setActive] = useState<string>("vn30");

  const onChange = (id: string) => {
    setActive(id);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="w-full h-[148px] flex flex-col gap-3">
        <SynAnalysisPriceBoard />
      </div>
      <div className="flex flex-col gap-3">
        <MenuDashboard active={active} onChange={onChange} />

        {/* Bảng giá */}
        <Board />
      </div>
    </div>
  );
}
