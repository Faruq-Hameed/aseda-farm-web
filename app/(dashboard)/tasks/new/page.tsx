"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CATEGORY_LABELS } from "@/lib/utils";
import { api } from "@/lib/api";

export default function NewTaskPage() {
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", category: "fertilizer", batchId: "",
    dueDate: "", priority: "medium", product: "", quantity: "",
    cost: "", notes: "", isRecurring: false, recurEvery: "",
  });
  const [loading, setLoading] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const router = useRouter();

  useEffect(() => {
    api.getBatches().then(setBatches).catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const category = form.category === "other" ? (customCategory.trim() || "other") : form.category;
      await api.createTask({ ...form, category });
      router.push("/tasks");
    } catch (err: any) {
      alert(err.message || "Failed to save task");
      setLoading(false);
    }
  }

  const f = (k: string) => (e: any) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div>
      <Header title="Add Task" />
      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input required value={form.title} onChange={f("title")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Task title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select required value={form.category} onChange={f("category")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              {form.category === "other" && (
                <input
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-amber-50"
                  placeholder="Describe the task category…"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
              <select value={form.batchId} onChange={f("batchId")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">Farm-wide</option>
                {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input required type="date" value={form.dueDate} onChange={f("dueDate")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority} onChange={f("priority")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={f("description")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" placeholder="Detailed description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <input value={form.product} onChange={f("product")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. NPK 15:15:15" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input value={form.quantity} onChange={f("quantity")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. 250g per plant" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (N)</label>
            <input type="number" value={form.cost} onChange={f("cost")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="0" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="recurring" checked={form.isRecurring} onChange={(e) => setForm((p) => ({ ...p, isRecurring: e.target.checked }))} />
            <label htmlFor="recurring" className="text-sm text-gray-700">Recurring task</label>
          </div>
          {form.isRecurring && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repeat every (days)</label>
              <input type="number" value={form.recurEvery} onChange={f("recurEvery")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="30" />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="px-6 py-2 text-white rounded-lg font-medium text-sm disabled:opacity-60" style={{ background: "#1B5E20" }}>
              {loading ? "Saving..." : "Add Task"}
            </button>
            <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
