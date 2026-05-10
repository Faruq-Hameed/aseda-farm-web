"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { BatchProgress } from "@/components/dashboard/BatchProgress";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { api } from "@/lib/api";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    Promise.all([
      api.getBatches(),
      api.getTasks({ status: "pending" }),
      api.getActivities(),
      api.getHarvests(),
      api.getTasks({ status: "overdue" }),
    ])
      .then(([batches, tasks, activities, harvests, overdueTasks]) => {
        const upcomingTasks = tasks.filter((t: any) => {
          const due = new Date(t.dueDate);
          return due >= today && due <= nextWeek;
        }).slice(0, 10);

        const totalRevenue = harvests.reduce((s: number, h: any) => s + (h.totalRevenue || 0), 0);
        const totalPlants = batches.reduce((s: number, b: any) => s + b.plantCount, 0);

        const monthlyRevenue: Record<string, number> = {};
        for (const h of harvests) {
          const d = new Date(h.harvestDate);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          monthlyRevenue[key] = (monthlyRevenue[key] || 0) + (h.totalRevenue || 0);
        }
        const revenueChartData = Object.entries(monthlyRevenue).sort().map(([month, revenue]) => ({
          month: new Date(month + "-01").toLocaleDateString("en-NG", { month: "short", year: "2-digit" }),
          revenue,
        }));

        setData({
          batches,
          tasks: upcomingTasks,
          activities: activities.slice(0, 5),
          overdueTasks,
          revenueChartData,
          stats: {
            totalPlants,
            activeBatches: batches.filter((b: any) => b.status === "growing" || b.status === "harvesting").length,
            tasksDueThisWeek: upcomingTasks.length,
            totalRevenue,
          },
        });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <Header title="Dashboard" />
        <div className="p-6 text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Dashboard" />
        <div className="p-6">
          <div className="px-4 py-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 space-y-1">
            <p className="font-semibold">Unable to load dashboard</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <Header title="Dashboard" />
        <div className="p-8 text-center py-16">
          <p className="text-gray-500">No farm data found. Please seed the database first.</p>
          <button
            onClick={() => api.seed().then(() => window.location.reload())}
            className="mt-4 inline-block px-4 py-2 bg-green-700 text-white rounded-lg text-sm"
          >
            Seed Database
          </button>
        </div>
      </div>
    );
  }

  const { batches, tasks, activities, overdueTasks, revenueChartData, stats } = data;

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {overdueTasks?.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 rounded-lg text-white text-sm" style={{ background: "#B71C1C" }}>
            <span>⛔ {overdueTasks.length} task{overdueTasks.length !== 1 ? "s" : ""} overdue</span>
            <Link href="/tasks?status=overdue" className="underline font-medium">View all</Link>
          </div>
        )}

        <StatsCards
          totalPlants={stats?.totalPlants || 0}
          activeBatches={stats?.activeBatches || 0}
          tasksDueThisWeek={stats?.tasksDueThisWeek || 0}
          totalRevenue={stats?.totalRevenue || 0}
        />

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Batch Progress</h2>
            <Link href="/batches" className="text-sm font-medium" style={{ color: "#1B5E20" }}>View all →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches?.map((batch: any) => (
              <BatchProgress key={batch.id} batch={batch} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks (7 days)</h2>
              <Link href="/tasks" className="text-sm font-medium" style={{ color: "#1B5E20" }}>View all →</Link>
            </div>
            <UpcomingTasks tasks={tasks || []} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
              <Link href="/activities" className="text-sm font-medium" style={{ color: "#1B5E20" }}>View all →</Link>
            </div>
            <RecentActivities activities={activities || []} />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Monthly Revenue</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            {!revenueChartData?.length ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">📊</p>
                <p className="text-sm">No harvest revenue recorded yet</p>
                <p className="text-xs mt-1">First harvest expected April 2027</p>
              </div>
            ) : (
              <RevenueChart data={revenueChartData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
