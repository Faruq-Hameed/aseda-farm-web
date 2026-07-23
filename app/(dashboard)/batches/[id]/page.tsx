"use client";
import { useState, useEffect, use } from "react";
import { Header } from "@/components/layout/Header";
import { getMonthsSince, getGrowthStage, formatDate, formatNaira, CATEGORY_COLORS } from "@/lib/utils";
import { api } from "@/lib/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const GROWTH_STAGES = [
  { label: "Establishment", months: 0 },
  { label: "Early Vegetative", months: 2 },
  { label: "Rapid Growth", months: 4 },
  { label: "Pre-Flowering", months: 6 },
  { label: "Flowering", months: 8 },
  { label: "Bunch Dev.", months: 10 },
  { label: "Harvest Ready", months: 12 },
];

const STATUSES = ["growing","flowering","harvesting","completed","planned"];
const VARIETIES = ["Agbagba","False Horn","French","PITA Hybrid","Other"];

export default function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [editCustomVariety, setEditCustomVariety] = useState("");
  const [editCustomSpacing, setEditCustomSpacing] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "tasks";

  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    api.getBatch(id).then(setBatch).catch((err: Error) => setLoadError(err.message)).finally(() => setLoading(false));
    api.getBatchHistory(id).then(setHistory).catch(() => {});
  }, [id]);

  // Earliest recorded plant count, so a reduction/increase from the original is visible at a glance.
  const originalPlantCount = (() => {
    const created = history.find((h) => h.action === "create");
    if (created?.after?.plantCount != null) return created.after.plantCount;
    const oldest = history[history.length - 1];
    return oldest?.before?.plantCount ?? batch?.plantCount;
  })();

  function startEdit() {
    const knownVarieties = ["Agbagba","False Horn","French","PITA Hybrid"];
    const knownSpacings = ["3m x 2m","2.5m x 2.5m","3m x 3m"];
    const isKnownVariety = knownVarieties.includes(batch.variety);
    const isKnownSpacing = knownSpacings.includes(batch.spacing);
    setEditCustomVariety(isKnownVariety ? "" : batch.variety);
    setEditCustomSpacing(isKnownSpacing ? "" : batch.spacing);
    setEditForm({
      name: batch.name,
      variety: isKnownVariety ? batch.variety : "Other",
      spacing: isKnownSpacing ? batch.spacing : "custom",
      acresCovered: batch.acresCovered,
      plantCount: batch.plantCount,
      status: batch.status,
      notes: batch.notes || "",
      expectedHarvestStart: batch.expectedHarvestStart ? new Date(batch.expectedHarvestStart).toISOString().split("T")[0] : "",
      expectedHarvestEnd: batch.expectedHarvestEnd ? new Date(batch.expectedHarvestEnd).toISOString().split("T")[0] : "",
      adjustmentReason: "",
    });
    setEditing(true);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const variety = editForm.variety === "Other" ? (editCustomVariety.trim() || "Other") : editForm.variety;
      const spacing = editForm.spacing === "custom" ? (editCustomSpacing.trim() || "custom") : editForm.spacing;
      const updated = await api.updateBatch(id, { ...editForm, variety, spacing });
      setBatch((prev: any) => ({ ...prev, ...updated }));
      setEditing(false);
      api.getBatchHistory(id).then(setHistory).catch(() => {});
    } catch (e: any) {
      alert(e.message || "Failed to save changes");
      setSaving(false);
      return;
    }
    setSaving(false);
  }

  const ef = (k: string) => (e: any) => setEditForm((f: any) => ({ ...f, [k]: e.target.value }));

  if (loading) {
    return (
      <div>
        <Header title="Batch" />
        <div className="p-6 text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <Header title="Batch" />
        <div className="p-6"><div className="px-4 py-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><p className="font-semibold">Unable to load batch</p><p>{loadError}</p></div></div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div>
        <Header title="Batch" />
        <div className="p-6"><div className="px-4 py-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><p className="font-semibold">Batch not found</p></div></div>
      </div>
    );
  }

  const months = getMonthsSince(batch.plantingDate);
  const stage = getGrowthStage(months);
  const totalRevenue = batch.harvests?.reduce((sum: number, h: any) => sum + (h.totalRevenue || 0), 0) || 0;
  const totalBunches = batch.harvests?.reduce((sum: number, h: any) => sum + h.bunchCount, 0) || 0;

  return (
    <div>
      <Header title={batch.name} />
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{batch.name}</h2>
              <p className="text-gray-500 text-sm mt-1">{batch.variety} • {batch.spacing} • {batch.acresCovered} acres</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full text-white text-sm font-medium" style={{ background: batch.status === "growing" ? "#2E7D32" : batch.status === "harvesting" ? "#F57F17" : "#616161" }}>
                {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
              </span>
              <button onClick={startEdit} className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">Edit</button>
            </div>
          </div>

          {editing && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <p className="text-sm font-semibold text-gray-700">Edit Batch</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Batch Name</label>
                  <input value={editForm.name} onChange={ef("name")} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  <select value={editForm.status} onChange={ef("status")} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                    {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Variety</label>
                  <select value={editForm.variety} onChange={ef("variety")} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                    {VARIETIES.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                  {editForm.variety === "Other" && (
                    <input
                      value={editCustomVariety}
                      onChange={(e) => setEditCustomVariety(e.target.value)}
                      className="mt-2 w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-amber-50"
                      placeholder="Specify variety name…"
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500">Spacing</label>
                  <select value={editForm.spacing} onChange={ef("spacing")} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                    <option value="3m x 2m">3m x 2m</option>
                    <option value="2.5m x 2.5m">2.5m x 2.5m</option>
                    <option value="3m x 3m">3m x 3m</option>
                    <option value="custom">Custom…</option>
                  </select>
                  {editForm.spacing === "custom" && (
                    <input
                      value={editCustomSpacing}
                      onChange={(e) => setEditCustomSpacing(e.target.value)}
                      className="mt-2 w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-amber-50"
                      placeholder="e.g. 4m x 3m"
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500">Acres Covered</label>
                  <input type="number" step="0.01" value={editForm.acresCovered} onChange={ef("acresCovered")} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Plant Count</label>
                  <input type="number" value={editForm.plantCount} onChange={ef("plantCount")} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                {Number(editForm.plantCount) !== batch.plantCount && (
                  <div>
                    <label className="text-xs text-gray-500">Reason for change (optional)</label>
                    <input value={editForm.adjustmentReason} onChange={ef("adjustmentReason")} className="w-full mt-1 px-3 py-2 border border-amber-300 rounded-lg text-sm bg-amber-50" placeholder="e.g. storm damage, pest loss" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Expected Harvest Start</label>
                  <input type="date" value={editForm.expectedHarvestStart} onChange={ef("expectedHarvestStart")} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Expected Harvest End</label>
                  <input type="date" value={editForm.expectedHarvestEnd} onChange={ef("expectedHarvestEnd")} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Notes</label>
                <textarea rows={2} value={editForm.notes} onChange={ef("notes")} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={saveEdit} disabled={saving} className="px-4 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-60" style={{ background: "#1B5E20" }}>{saving ? "Saving..." : "Save Changes"}</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500">Plants</p>
              <p className="text-lg font-bold text-gray-900">{batch.plantCount.toLocaleString()}</p>
              {originalPlantCount != null && originalPlantCount !== batch.plantCount && (
                <p className="text-xs mt-0.5" style={{ color: batch.plantCount < originalPlantCount ? "#B71C1C" : "#1B5E20" }}>
                  originally {originalPlantCount.toLocaleString()}
                </p>
              )}
            </div>
            <div><p className="text-xs text-gray-500">Planted</p><p className="text-lg font-bold text-gray-900">{formatDate(batch.plantingDate)}</p></div>
            <div><p className="text-xs text-gray-500">Age</p><p className="text-lg font-bold text-gray-900">{months} months</p></div>
            <div><p className="text-xs text-gray-500">Stage</p><p className="text-lg font-bold" style={{ color: "#1B5E20" }}>{stage}</p></div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-3">Growth Timeline</p>
            <div className="relative">
              <div className="flex justify-between mb-1">
                {GROWTH_STAGES.map((s, i) => {
                  const isCurrent = stage === s.label || (i === 0 && months < 2);
                  const isPast = months >= s.months + 2;
                  return (
                    <div key={s.label} className="flex flex-col items-center" style={{ width: `${100 / GROWTH_STAGES.length}%` }}>
                      <div className={`w-3 h-3 rounded-full border-2 z-10 ${isPast ? "bg-green-600 border-green-600" : isCurrent ? "bg-green-400 border-green-600" : "bg-white border-gray-300"}`} />
                      <p className={`text-xs mt-1 text-center leading-tight ${isCurrent ? "font-bold text-green-700" : "text-gray-400"}`} style={{ fontSize: "9px" }}>{s.label}</p>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-1.5 left-0 right-0 h-0.5 bg-gray-200 -z-0">
                <div className="h-full bg-green-600 rounded" style={{ width: `${Math.min(months / 14 * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: "#1B5E20" }}>{formatNaira(totalRevenue)}</p>
            <p className="text-xs text-gray-500 mt-1">Total Revenue</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalBunches}</p>
            <p className="text-xs text-gray-500 mt-1">Bunches Harvested</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{batch.tasks?.filter((t: any) => t.status === "completed").length || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Tasks Completed</p>
          </div>
        </div>

        <div>
          <div className="flex gap-1 border-b border-gray-200 mb-4">
            {["tasks", "activities", "harvests", "suckers", "history"].map((t) => (
              <Link key={t} href={`/batches/${batch.id}?tab=${t}`} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t ? "bg-white border border-b-white text-green-700 border-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Link>
            ))}
          </div>

          {tab === "tasks" && (
            <div className="space-y-2">
              {!batch.tasks?.length ? <p className="text-sm text-gray-400 py-4 text-center">No tasks for this batch</p> : batch.tasks.map((task: any) => (
                <div key={task.id} className={`bg-white rounded-lg border p-3 ${task.status === "overdue" ? "border-red-200" : "border-gray-100"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[task.category] || "#9E9E9E" }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.status === "completed" ? "line-through text-gray-400" : "text-gray-900"}`}>{task.title}</p>
                      {task.product && <p className="text-xs text-gray-400">{task.product}{task.quantity ? ` — ${task.quantity}` : ""}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500">{formatDate(task.dueDate)}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded mt-0.5 inline-block" style={{ background: task.status === "completed" ? "#E8F5E9" : task.status === "overdue" ? "#FFEBEE" : "#F5F5F5", color: task.status === "completed" ? "#1B5E20" : task.status === "overdue" ? "#B71C1C" : "#616161" }}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "activities" && (
            <div className="space-y-2">
              {!batch.activities?.length ? <p className="text-sm text-gray-400 py-4 text-center">No activities logged yet</p> : batch.activities.map((activity: any) => (
                <div key={activity.id} className="bg-white rounded-lg border border-gray-100 p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                      {activity.cost && <p className="text-xs font-medium" style={{ color: "#1B5E20" }}>{formatNaira(activity.cost)}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "harvests" && (
            <div className="space-y-2">
              {!batch.harvests?.length ? (
                <div className="text-center py-8 text-gray-400"><p className="text-2xl mb-2">🌾</p><p className="text-sm">No harvests recorded yet</p></div>
              ) : batch.harvests.map((harvest: any) => (
                <div key={harvest.id} className="bg-white rounded-lg border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{harvest.bunchCount} bunches</p>
                      <p className="text-xs text-gray-500">{formatDate(harvest.harvestDate)} • {harvest.channel || "—"}</p>
                    </div>
                    <div className="text-right">
                      {harvest.totalRevenue && <p className="font-bold" style={{ color: "#1B5E20" }}>{formatNaira(harvest.totalRevenue)}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-2">
              {!history.length ? <p className="text-sm text-gray-400 py-4 text-center">No history recorded yet</p> : history.map((h: any) => {
                const countChanged = h.before?.plantCount != null && h.after?.plantCount != null && h.before.plantCount !== h.after.plantCount;
                return (
                  <div key={h.id} className="bg-white rounded-lg border border-gray-100 p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">{h.action}{h.user?.name ? ` by ${h.user.name}` : ""}</p>
                        {countChanged && (
                          <p className="text-xs font-medium mt-0.5" style={{ color: h.after.plantCount < h.before.plantCount ? "#B71C1C" : "#1B5E20" }}>
                            Plant count: {h.before.plantCount.toLocaleString()} → {h.after.plantCount.toLocaleString()}
                          </p>
                        )}
                        {h.summary && <p className="text-xs text-gray-500 mt-0.5">{h.summary}</p>}
                      </div>
                      <p className="text-xs text-gray-500 flex-shrink-0 ml-4">{formatDate(h.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "suckers" && (
            <div className="space-y-2">
              {!batch.suckerHarvests?.length ? <p className="text-sm text-gray-400 py-4 text-center">No sucker harvests recorded yet</p> : batch.suckerHarvests.map((sh: any) => (
                <div key={sh.id} className="bg-white rounded-lg border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{sh.suckerCount} suckers ({sh.method})</p>
                      <p className="text-xs text-gray-500">{formatDate(sh.harvestDate)}</p>
                    </div>
                    {sh.revenue && <p className="font-bold" style={{ color: "#1B5E20" }}>{formatNaira(sh.revenue)}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
