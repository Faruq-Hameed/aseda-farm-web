"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { formatNaira } from "@/lib/utils";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { api } from "@/lib/api";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getAnalytics().then(setData).catch((err: Error) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <Header title="Analytics" />
        <div className="p-6 text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Analytics" />
        <div className="p-6"><div className="px-4 py-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><p className="font-semibold">Unable to load analytics</p><p>{error}</p></div></div>
      </div>
    );
  }

  if (!data) return <div className="p-8">No data available.</div>;

  const { summary, charts } = data;

  return (
    <div>
      <Header title="Analytics" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Investment", value: formatNaira(summary.totalExpenses), color: "#1565C0" },
            { label: "Total Revenue", value: formatNaira(summary.totalRevenue), color: "#1B5E20" },
            { label: "Net Profit", value: formatNaira(summary.netProfit), color: summary.netProfit >= 0 ? "#1B5E20" : "#B71C1C" },
            { label: "ROI", value: summary.totalExpenses > 0 ? `${summary.roi}%` : "—", color: "#6A1B9A" },
            { label: "Revenue/Plant", value: summary.revenuePerPlant > 0 ? formatNaira(summary.revenuePerPlant) : "—", color: "#F57F17" },
            { label: "Cost/Plant", value: summary.costPerPlant > 0 ? formatNaira(summary.costPerPlant) : "—", color: "#616161" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <AnalyticsCharts
          revenueData={charts.revenueByMonth}
          channelData={charts.revenueByChannel}
          expenseData={charts.expenseByCategory}
          taskStatus={charts.taskStatus}
        />
      </div>
    </div>
  );
}
