"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { api } from "@/lib/api";
import { CROP_LIST, getCrop } from "@/lib/crops";

function calcAcresFromSpacing(spacingStr: string, plantCount: string): string | null {
  const count = parseInt(plantCount);
  if (!spacingStr || !count) return null;
  const matches = [...spacingStr.matchAll(/([\d.]+)\s*(cm|m)?/gi)].filter((m) => m[1]);
  if (matches.length < 2) return null;
  const toMeters = (m: RegExpMatchArray) => {
    const val = parseFloat(m[1]);
    return m[2]?.toLowerCase() === "cm" ? val / 100 : val;
  };
  const sqm = toMeters(matches[0]) * toMeters(matches[1]) * count;
  return (sqm / 4047).toFixed(2);
}

export default function NewBatchPage() {
  const [form, setForm] = useState({
    cropType: "plantain", name: "", plantCount: "", plantingDate: "", variety: "Agbagba",
    spacing: "3m x 2m", acresCovered: "", status: "growing", notes: "",
  });
  const [customVariety, setCustomVariety] = useState("");
  const [customSpacing, setCustomSpacing] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<string[] | null>(null);
  const router = useRouter();

  const crop = getCrop(form.cropType);

  function calcAcres() {
    const spacingStr = form.spacing === "custom" ? customSpacing : form.spacing;
    const acres = calcAcresFromSpacing(spacingStr, form.plantCount);
    if (acres) setForm((p) => ({ ...p, acresCovered: acres }));
  }

  function changeCrop(cropType: string) {
    const c = getCrop(cropType);
    setForm((p) => ({ ...p, cropType, variety: c.defaultVariety, spacing: c.defaultSpacing }));
    setCustomVariety("");
    setCustomSpacing("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const variety = form.variety === "Other" ? (customVariety.trim() || "Other") : form.variety;
      const spacing = form.spacing === "custom" ? (customSpacing.trim() || "custom") : form.spacing;
      await api.createBatch({ ...form, variety, spacing });
      if (form.status !== "planned") {
        setGeneratedTasks([`Full ${crop.label.toLowerCase()} growth-cycle schedule (${crop.taskCount} tasks) generated — land prep through harvest.`]);
      } else {
        router.push("/batches");
      }
    } catch (e: any) { alert(e.message || "Failed to create batch"); setLoading(false); }
  }

  if (generatedTasks) {
    return (
      <div>
        <Header title="Batch Created" />
        <div className="p-6 max-w-lg">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center mb-4">
              <span className="text-4xl">🎉</span>
              <h2 className="text-xl font-semibold text-gray-900 mt-2">Batch Created!</h2>
              <p className="text-sm text-gray-500 mt-1">The following tasks have been automatically generated:</p>
            </div>
            <div className="space-y-2 mb-6">
              {generatedTasks.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-green-600">✓</span> {t}
                </div>
              ))}
            </div>
            <button onClick={() => router.push("/batches")} className="w-full py-2 text-white rounded-lg font-medium" style={{ background: "#1B5E20" }}>
              View Batches
            </button>
          </div>
        </div>
      </div>
    );
  }

  const f = (k: string) => (e: any) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <Header title="New Batch" />
      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
              <select value={form.cropType} onChange={(e) => changeCrop(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                {CROP_LIST.map((c) => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name *</label>
              <input required value={form.name} onChange={f("name")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. Batch 1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={f("status")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="growing">Growing</option>
                <option value="harvesting">Harvesting</option>
                <option value="planned">Planned (future)</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date *</label>
              <input required type="date" value={form.plantingDate} onChange={f("plantingDate")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{crop.plantUnitLabel} *</label>
              <input required type="number" value={form.plantCount} onChange={f("plantCount")} onBlur={calcAcres} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder={crop.plantUnitPlaceholder} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Variety</label>
              <select value={form.variety} onChange={f("variety")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                {crop.varieties.map((v) => <option key={v}>{v}</option>)}
              </select>
              {form.variety === "Other" && (
                <input
                  required
                  value={customVariety}
                  onChange={(e) => setCustomVariety(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-amber-50"
                  placeholder="Specify variety name…"
                />
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spacing</label>
              <select value={form.spacing} onChange={f("spacing")} onBlur={calcAcres} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                {crop.spacingOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                <option value="custom">Custom…</option>
              </select>
              {form.spacing === "custom" && (
                <input
                  required
                  value={customSpacing}
                  onChange={(e) => setCustomSpacing(e.target.value)}
                  onBlur={calcAcres}
                  className="mt-2 w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-amber-50"
                  placeholder="e.g. 4m x 3m"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Acres Covered (auto-calculated)</label>
              <input type="number" value={form.acresCovered} onChange={f("acresCovered")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="1.02" step="0.01" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={3} value={form.notes} onChange={f("notes")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" placeholder="Any additional notes..." />
          </div>
          {form.status !== "planned" && (
            <div className="p-3 rounded-lg text-sm" style={{ background: "#E8F5E9", color: "#1B5E20" }}>
              ✅ Creating this batch will auto-generate {crop.taskCount} tasks for the full {crop.cycleMonths}-month {crop.label.toLowerCase()} growth cycle
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="px-6 py-2 text-white rounded-lg font-medium text-sm disabled:opacity-60" style={{ background: "#1B5E20" }}>
              {loading ? "Creating..." : "Create Batch"}
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
