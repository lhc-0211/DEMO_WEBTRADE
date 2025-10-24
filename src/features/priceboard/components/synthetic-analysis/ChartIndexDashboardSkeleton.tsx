export default function ChartIndexDashboardSkeleton() {
  return (
    <div className="flex flex-row gap-3 items-center w-full h-full animate-pulse">
      <div className="flex flex-col gap-2 w-2/5 h-full">
        {/* Name, change, changePC */}
        <div className="flex flex-col gap-1">
          <div className="h-3 w-20 rounded bg-gray-300/40" />
          <div className="flex flex-row gap-2 items-center">
            <div className="w-5 h-5 rounded bg-gray-300/40" />
            <div className="flex flex-row gap-[5px] items-center">
              <div className="h-3 w-12 rounded bg-gray-300/40" />
              <div className="h-3 w-16 rounded bg-gray-300/40" />
            </div>
          </div>
        </div>

        {/* value, volume */}
        <div className="flex flex-col gap-1">
          <div className="h-3 w-24 rounded bg-gray-300/40" />
          <div className="h-3 w-20 rounded bg-gray-300/40" />
        </div>

        {/* Mã tăng giảm, phiên */}
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-3 gap-1">
            <div className="h-3 w-8 mx-auto rounded bg-gray-300/40" />
            <div className="h-3 w-8 mx-auto rounded bg-gray-300/40" />
            <div className="h-3 w-8 mx-auto rounded bg-gray-300/40" />
          </div>
          <div className="h-3 w-12 ml-4 rounded bg-gray-300/40" />
        </div>
      </div>
      <div className="w-3/5 h-full rounded bg-gray-300/40" />
    </div>
  );
}
