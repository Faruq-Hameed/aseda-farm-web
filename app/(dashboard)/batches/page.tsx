"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { BatchProgress } from "@/components/dashboard/BatchProgress";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    api.getBatches().then(setBatches).catch((err: Error) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  async function deleteBatch(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This will also delete all tasks, activities, and harvests linked to this batch.`)) return;
    try {
      await api.deleteBatch(id);
      setBatches((prev) => prev.filter((b) => b.id !== id));
    } catch (e: any) {
      alert(e.message || "Failed to delete batch");
    }
  }

  if (loading) {
    return (
      <div>
        <Header title="Batches" />
        <div className="p-6 text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Batches" />
        <div className="p-6"><div className="px-4 py-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><p className="font-semibold">Unable to load batches</p><p>{error}</p></div></div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Batches" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{batches.length} batch{batches.length !== 1 ? "es" : ""}</p>
          <Link href="/batches/new" className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: "#1B5E20" }}>
            + New Batch
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <div key={batch.id} className="relative">
              <BatchProgress batch={batch} />
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-center">
                <Link href={`/batches/${batch.id}`} className="py-1.5 bg-white rounded-lg border border-gray-100 text-gray-600 hover:bg-gray-50">
                  {batch._count?.tasks || 0} tasks
                </Link>
                <Link href={`/batches/${batch.id}`} className="py-1.5 bg-white rounded-lg border border-gray-100 text-gray-600 hover:bg-gray-50">
                  {batch._count?.activities || 0} logs
                </Link>
                <div className="py-1.5 bg-white rounded-lg border border-gray-100 text-green-700 font-medium">
                  N{(batch.harvests?.reduce((s: number, h: any) => s + (h.totalRevenue || 0), 0) || 0).toLocaleString()}
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <Link href={`/batches/${batch.id}`} className="flex-1 py-1.5 text-center bg-white rounded-lg border border-gray-100 text-xs text-gray-600 hover:bg-gray-50">
                  View Details
                </Link>
                <button
                  onClick={() => deleteBatch(batch.id, batch.name)}
                  className="px-3 py-1.5 bg-white rounded-lg border border-red-100 text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {batches.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-gray-500 mb-4">No batches yet</p>
            <Link href="/batches/new" className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: "#1B5E20" }}>
              Create your first batch
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
