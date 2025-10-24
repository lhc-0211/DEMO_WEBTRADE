import { memo } from "react";

function ShareStockInfoSkeleton() {
  return (
    <div className="flex flex-col bg-skin-card rounded-xl gap-3 p-3 animate-pulse h-[106px]">
      <div className="flex items-center h-[82px]">
        {/* Ô giá chính */}
        <div className="mr-3 p-2 rounded-lg h-[64px] w-[109px] flex flex-col items-center justify-center gap-2 bg-gray-300/60">
          <div className="h-6 w-16 bg-gray-300/40 rounded"></div>
          <div className="h-3 w-10 bg-gray-300/40 rounded"></div>
        </div>

        {/* Lưới thông tin giá */}
        <div className="grid grid-cols-3 gap-3 place-items-end">
          {["Trần", "T.C", "Sàn", "Cao", "TB", "Thấp"].map((idx) => (
            <div key={idx} className="grid gap-1 min-w-[60px] ml-4">
              <div className="h-3 w-8 bg-gray-300/40 rounded"></div>
              <div className="h-4 w-12 bg-gray-300/40 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(ShareStockInfoSkeleton);
