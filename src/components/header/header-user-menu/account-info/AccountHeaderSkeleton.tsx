export default function AccountHeaderSkeleton() {
  return (
    <div>
      {/* Ảnh bìa */}
      <div className="h-[150px] w-full rounded-b-2xl relative bg-gray-300/40 animate-pulse" />

      {/* Ảnh đại diện + tên */}
      <div className="relative px-6">
        <div className="flex flex-row gap-4 items-center absolute -top-3.5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gray-300/40 animate-pulse border border-yellow-300 shadow-[0_0_0_2px_rgba(250,204,21,0.3)] relative" />

          {/* Tên + nút edit */}
          <div className="flex flex-row gap-1 items-center">
            <div className="h-5 w-32 bg-gray-300/40 animate-pulse rounded" />
            <div className="w-5 h-5 rounded-full bg-gray-300/40 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
