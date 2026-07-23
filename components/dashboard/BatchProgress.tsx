import Link from "next/link";
import { getMonthsSince, getGrowthStage, getGrowthStageProgress, formatDate } from "@/lib/utils";
import { getCrop } from "@/lib/crops";

const STATUS_COLORS: Record<string, string> = {
  growing: "#2E7D32",
  harvesting: "#F57F17",
  completed: "#616161",
  planned: "#1565C0",
};

const STATUS_LABELS: Record<string, string> = {
  growing: "Growing",
  harvesting: "Harvesting",
  completed: "Completed",
  planned: "Planned",
};

interface BatchProgressProps {
  batch: {
    id: string;
    name: string;
    cropType?: string;
    plantCount: number;
    plantingDate: Date;
    variety: string;
    acresCovered: number;
    status: string;
    expectedHarvestStart: Date | null;
  };
}

export function BatchProgress({ batch }: BatchProgressProps) {
  const crop = getCrop(batch.cropType);
  const months = batch.status === "planned" ? 0 : getMonthsSince(batch.plantingDate);
  const stage = batch.status === "planned" ? "Planned" : getGrowthStage(months, batch.cropType);
  const progress = batch.status === "planned" ? 0 : getGrowthStageProgress(months, batch.cropType);
  const color = STATUS_COLORS[batch.status] || "#616161";

  const daysToHarvest = batch.expectedHarvestStart
    ? Math.ceil((new Date(batch.expectedHarvestStart).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <Link href={`/batches/${batch.id}`} className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{crop.emoji} {batch.name}</h3>
          <p className="text-xs text-gray-500">{crop.label} • {batch.variety} • {batch.acresCovered} acres</p>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ background: color }}>
          {STATUS_LABELS[batch.status] || batch.status}
        </span>
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{batch.plantCount.toLocaleString()} plants</span>
          <span>{stage}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: color }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Planted {formatDate(batch.plantingDate)}</span>
          <span>{months > 0 ? `${months}mo` : "—"}</span>
        </div>
      </div>

      {daysToHarvest !== null && (
        <div className="text-xs rounded-lg px-2 py-1.5" style={{ background: "#E8F5E9", color: "#1B5E20" }}>
          {daysToHarvest > 0 ? `🌾 Harvest in ~${daysToHarvest} days` : daysToHarvest === 0 ? "🌾 Harvest starts today!" : "🌾 Harvest season"}
        </div>
      )}
    </Link>
  );
}
