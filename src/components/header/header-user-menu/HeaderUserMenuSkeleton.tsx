export default function HeaderUserMenuSkeleton() {
  return (
    <div className="flex items-center gap-3 animate-pulse py-0.5">
      {/* Avatar giả */}
      <div className="w-9 h-9 bg-gray-300 rounded-full" />

      {/* Thông tin người dùng */}
      <div className="flex flex-col gap-1">
        <div className="w-24 h-3 bg-gray-300 rounded" />
        <div className="w-16 h-2 bg-gray-300 rounded" />
      </div>

      {/* Icon menu */}
      <div className="w-5 h-5 bg-gray-300 rounded-full ml-2" />
    </div>
  );
}
