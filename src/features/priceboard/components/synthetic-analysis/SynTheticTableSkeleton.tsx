import type { ModeTableSynThetic } from "../../../../types";

export function SynTheticTableSkeleton({ type }: { type: ModeTableSynThetic }) {
  return (
    <div className="flex flex-col gap-0.5 w-full h-full">
      {[...Array(4)].map((_, index) => (
        <div
          className="flex flex-row items-center gap-2 px-2 text-xs font-medium text-text-body animate-pulse"
          key={index}
        >
          {type === "INDAY" ? (
            <>
              <div className="w-20 h-5 bg-gray-300/40 rounded"></div>
              <div className="flex-1 h-5 bg-gray-300/40 rounded"></div>
              <div className="flex-1 h-5 bg-gray-300/40 rounded"></div>
            </>
          ) : (
            <>
              <div className="w-20 h-5 bg-gray-300/40 rounded"></div>
              <div className="flex-1 h-5 bg-gray-300/40 rounded"></div>
              <div className="flex-1 h-5 bg-gray-300/40 rounded"></div>
              <div className="flex-1 h-5 bg-gray-300/40 rounded"></div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
