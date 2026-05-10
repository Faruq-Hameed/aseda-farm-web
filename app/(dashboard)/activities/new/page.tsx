"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { api } from "@/lib/api";

const ACTIVITY_TYPES = [
  { value: "fertilizer_applied", label: "Fertilizer Applied" },
  { value: "herbicide_applied", label: "Herbicide Applied" },
  { value: "weeding_done", label: "Manual Weeding" },
  { value: "suckers_harvested", label: "Suckers Harvested" },
  { value: "bunch_harvested", label: "Bunch Harvested" },
  { value: "propping_done", label: "Propping Done" },
  { value: "gouging_done", label: "Corm Gouging" },
  { value: "inspection", label: "Farm Inspection" },
  { value: "pest_treatment", label: "Pest/Disease Treatment" },
  { value: "irrigation", label: "Irrigation" },
  { value: "other", label: "Other…" },
];

export default function NewActivityPage() {
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    batchId: "", type: "fertilizer_applied", title: "", description: "",
    product: "", quantity: "", plantCount: "", cost: "", weather: "", notes: "",
  });
  const [customType, setCustomType] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api.getBatches().then(setBatches).catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const type = form.type === "other" ? (customType.trim() || "other") : form.type;
      await api.createActivity({ ...form, type });
      router.push("/activities");
    } catch (err: any) {
      alert(err.message || "Failed to save activity");
      setLoading(false);
    }
  }

  const f = (k: string) => (e: any) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <Header title="Log Activity" />
      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input required type="date" value={form.date} onChange={f("date")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type *</label>
              <select required value={form.type} onChange={f("type")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                {ACTIVITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {form.type === "other" && (
                <input
                  required
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-amber-50"
                  placeholder="Describe the activity type…"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weather</label>
              <select value={form.weather} onChange={f("weather")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">Select</option>
                <option value="sunny">☀️ Sunny</option>
                <option value="cloudy">⛅ Cloudy</option>
                <option value="rainy">🌧️ Rainy</option>
                <option value="harmattan">🌫️ Harmattan</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title/Summary *</label>
            <input required value={form.title} onChange={f("title")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Brief summary of what was done" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description *</label>
            <textarea required rows={3} value={form.description} onChange={f("description")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" placeholder="Describe what was done in detail..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Used</label>
              <input value={form.product} onChange={f("product")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. NPK 15:15:15" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity/Amount</label>
              <input value={form.quantity} onChange={f("quantity")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. 170kg total" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plants Affected</label>
              <input type="number" value={form.plantCount} onChange={f("plantCount")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="680" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost (N)</label>
              <input type="number" value={form.cost} onChange={f("cost")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="0" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="px-6 py-2 text-white rounded-lg font-medium text-sm disabled:opacity-60" style={{ background: "#1B5E20" }}>
              {loading ? "Saving..." : "Log Activity"}
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
