export default function AccountInfoSkeleton() {
  const SkeletonLine = ({ w = "w-24" }: { w?: string }) => (
    <div className={`h-5 bg-gray-300/40 animate-pulse rounded ${w}`} />
  );

  return (
    <div className="flex flex-col">
      {/* --- Thông tin cá nhân --- */}
      <div className="flex flex-row items-center justify-between text-sm font-medium h-9 bg-gray-300 text-text-body px-5">
        Thông tin cá nhân
      </div>

      <div className="grid grid-rows-1 gap-4 px-5 pt-4 pb-8">
        <div className="text-text-subtitle text-xs font-medium flex flex-col">
          Tên pháp lý
          <SkeletonLine w="w-40" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-text-subtitle text-xs font-medium flex flex-col">
            Giới tính
            <SkeletonLine w="w-10" />
          </div>
          <div className="text-text-subtitle text-xs font-medium flex flex-col">
            Ngày sinh
            <SkeletonLine w="w-20" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-text-subtitle text-xs font-medium flex flex-col">
            Số CCCD
            <SkeletonLine w="w-28" />
          </div>
          <div className="text-text-subtitle text-xs font-medium flex flex-col">
            Ngày cấp
            <SkeletonLine w="w-20" />
          </div>
        </div>

        <div className="text-text-subtitle text-xs font-medium flex flex-col">
          Nơi cấp
          <SkeletonLine w="w-48" />
        </div>
      </div>

      {/* --- Thông tin liên hệ --- */}
      <div className="flex flex-row items-center justify-between text-sm font-medium h-9 bg-gray-300 text-text-body px-[20px]">
        Thông tin liên hệ
      </div>

      <div className="grid grid-rows-1 gap-4 px-[20px] pt-[16px] pb-[32px]">
        <div className="text-text-subtitle text-xs font-medium flex flex-col">
          Số điện thoại
          <SkeletonLine w="w-32" />
        </div>

        <div className="w-full flex flex-row items-center justify-between">
          <div className="text-text-subtitle text-xs font-medium flex flex-col">
            Email
            <SkeletonLine w="w-40" />
          </div>
          <div className="w-6 h-6 rounded-full bg-gray-300/40 animate-pulse" />
        </div>

        <div className="w-full flex flex-row items-center justify-between">
          <div className="text-text-subtitle text-xs font-medium flex flex-col">
            Địa chỉ liên hệ
            <SkeletonLine w="w-56" />
          </div>
          <div className="w-6 h-6 rounded-full bg-gray-300/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
