import ChartIndexDashboard from "./ChartIndexDashboard";
import SynTheticTable from "./SynTheticTable";
import TimeSystem from "./TimeSystem";

export default function SynAnalysisPriceBoard() {
  return (
    <div className="w-full h-full grid max-xl:grid-cols-2 grid-cols-3 gap-3">
      <div className="max-xl:col-span-1 col-span-2">
        {" "}
        <ChartIndexDashboard />
      </div>

      <div className="col-span-1">
        <div className="grid grid-cols-3 gap-3">
          <div className="w-full h-full col-span-2">
            <SynTheticTable />
          </div>
          <div className="col-span-1">
            <TimeSystem />
          </div>
        </div>
      </div>
    </div>
  );
}
