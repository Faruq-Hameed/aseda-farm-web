"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { TasksClient } from "./TasksClient";
import { api } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const params: Record<string, string> = {};
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const batchId = searchParams.get("batchId");
    if (status) params.status = status;
    if (category) params.category = category;
    if (batchId) params.batchId = batchId;

    setError(null);
    Promise.all([api.getTasks(params), api.getBatches()])
      .then(([t, b]) => { setTasks(t); setBatches(b); })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div>
        <Header title="Tasks" />
        <div className="p-6 text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Tasks" />
        <div className="p-6"><div className="px-4 py-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><p className="font-semibold">Unable to load tasks</p><p>{error}</p></div></div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Tasks" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">{tasks.length} tasks</span>
          </div>
          <Link href="/tasks/new" className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2" style={{ background: "#1B5E20" }}>
            + Add Task
          </Link>
        </div>
        <TasksClient initialTasks={tasks} batches={batches} />
      </div>
    </div>
  );
}
