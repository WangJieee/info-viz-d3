import { BarChartCountryRace} from "@/components/BarChartCountryRace";
import { ScatterPlot } from "@/components/ScatterPlot";
import { StackedAreaChart } from "@/components/StackedAreaChart";

export default function Home() {
  return (
    <div className="grid grid-rows-[10px_1fr_20px] items-center justify-items-left min-h-screen p-8 gap-16 font-[family-name:var(--font-geist-sans)]">
      <header className="mt-auto font-bold flex flex-col row-start-1 justify-items-center items-left text-gray-900 text-4xl">AI MODEL ANALYSIS</header>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="graph-wrapper"><ScatterPlot /></div>
        <div className="graph-wrapper  self-end"><BarChartCountryRace /></div>
        <div className="graph-wrapper"><StackedAreaChart /></div>
      </main>
    </div>
  );
}
