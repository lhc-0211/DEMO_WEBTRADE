export function SynTheticTableSkeleton() {
  return (
    <div className="flex flex-col flex-cover-full w-full h-full">
      {[...Array(5)].map((_, index) => (
        <div
          className={`flex flex-row items-center gap-2 px-2 text-xs font-medium text-text-body animate-pulse  h-5 rounded ${
            index % 2 === 0 ? "bg-gray-300/40 rounded" : "bg-gray-300/5"
          }`}
          key={index}
        ></div>
      ))}
    </div>
  );
}
