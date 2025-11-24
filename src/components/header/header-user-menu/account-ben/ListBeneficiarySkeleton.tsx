export function ListBeneficiarySkeleton() {
  return Array(3)
    .fill(0)
    .map((_, index) => (
      <div
        key={index}
        className="bg-gray-300/40 p-2.5 rounded-lg h-[100px] flex flex-col justify-between relative mb-3 animate-pulse"
      >
        <div className="flex flex-row gap-3 items-center">
          {/* Circle avatar skeleton */}
          <div className="w-8 h-8 min-w-8 rounded-full bg-gray-400" />

          {/* Bank name skeleton */}
          <div className="h-4 w-32 bg-gray-400 rounded" />

          {/* 3 dots placeholder */}
          <div className="ml-auto w-6 h-6 bg-gray-400 rounded-full" />
        </div>

        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            {/* Label skeleton */}
            <div className="h-2 w-20 bg-gray-400 rounded" />
            {/* Account number skeleton */}
            <div className="h-4 w-24 bg-gray-400 rounded" />
          </div>

          {/* Default flag skeleton */}
          <div className="px-2 py-1 rounded-xl bg-gray-400/50 w-20 h-6" />
        </div>
      </div>
    ));
}
