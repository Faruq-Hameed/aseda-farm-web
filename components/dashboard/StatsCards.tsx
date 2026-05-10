import { formatNaira } from "@/lib/utils";

interface StatsCardsProps {
  totalPlants: number;
  activeBatches: number;
  tasksDueThisWeek: number;
  totalRevenue: number;
}

export function StatsCards({ totalPlants, activeBatches, tasksDueThisWeek, totalRevenue }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Plants",
      value: totalPlants.toLocaleString(),
      icon: "🌱",
      color: "#2E7D32",
      bg: "#E8F5E9",
    },
    {
      label: "Active Batches",
      value: activeBatches.toString(),
      icon: "🌿",
      color: "#1565C0",
      bg: "#E3F2FD",
    },
    {
      label: "Tasks Due This Week",
      value: tasksDueThisWeek.toString(),
      icon: "✅",
      color: "#F57F17",
      bg: "#FFFDE7",
    },
    {
      label: "Total Revenue",
      value: formatNaira(totalRevenue),
      icon: "💰",
      color: "#6A1B9A",
      bg: "#F3E5F5",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">{s.icon}</span>
            <div className="w-8 h-8 rounded-full" style={{ background: s.bg }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          <p className="text-xs text-gray-500 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
