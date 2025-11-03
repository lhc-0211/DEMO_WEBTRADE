import TimeSystem from "./TimeSystem";

export default function SynAnalysisPriceBoard() {
  return (
    <div className="w-full h-full grid grid-cols-3 gap-3">
      <div className="col-span-2">{/* <ChartIndexDashboard /> */}</div>

      <div className="col-span-1">
        <div className="grid grid-cols-3 gap-3">
          <div className="w-full h-full col-span-2">
            {/* <SynTheticTable /> */}
          </div>
          <div className="col-span-1">
            <TimeSystem />
          </div>
        </div>
      </div>
    </div>
  );
}
