"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { formatDate, formatNaira } from "@/lib/utils";
import { api } from "@/lib/api";
import Link from "next/link";

const TYPE_ICONS: Record<string, string> = {
  fertilizer_applied: "🌿", herbicide_applied: "🟣", weeding_done: "🔵",
  suckers_harvested: "🌱", bunch_harvested: "🌾", propping_done: "🪵",
  gouging_done: "⛏️", inspection: "🔍", pest_treatment: "🐛", irrigation: "💧",
  other: "📋",
};

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

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editCustomType, setEditCustomType] = useState("");

  useEffect(() => {
    Promise.all([api.getActivities(), api.getBatches()])
      .then(([a, b]) => { setActivities(a); setBatches(b); })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const grouped: Record<string, any[]> = {};
  for (const activity of activities) {
    const key = new Date(activity.date).toLocaleDateString("en-NG", { month: "long", year: "numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(activity);
  }

  function startEdit(activity: any) {
    const knownTypes = ACTIVITY_TYPES.map(t => t.value);
    const isKnown = knownTypes.includes(activity.type);
    setEditCustomType(isKnown ? "" : activity.type);
    setEditForm({
      type: isKnown ? activity.type : "other",
      title: activity.title,
      description: activity.description || "",
      batchId: activity.batch?.id || "",
      product: activity.product || "",
      quantity: activity.quantity || "",
      cost: activity.cost || "",
      plantCount: activity.plantCount || "",
      date: activity.date ? new Date(activity.date).toISOString().split("T")[0] : "",
      weather: activity.weather || "",
    });
    setEditing(activity.id);
  }

  async function saveEdit(id: string) {
    try {
      const type = editForm.type === "other" ? (editCustomType.trim() || "other") : editForm.type;
      const updated = await api.updateActivity(id, { ...editForm, type, batchId: editForm.batchId || undefined });
      setActivities((prev) => prev.map((a) => a.id === id ? { ...a, ...updated, batch: batches.find(b => b.id === updated.batchId) || a.batch } : a));
      setEditing(null);
    } catch (e: any) { alert(e.message || "Failed to save activity"); }
  }

  async function deleteActivity(id: string) {
    if (!confirm("Delete this activity log entry?")) return;
    try {
      await api.deleteActivity(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch (e: any) { alert(e.message || "Failed to delete activity"); }
  }

  const ef = (k: string) => (e: any) => setEditForm((f: any) => ({ ...f, [k]: e.target.value }));

  if (loading) {
    return (
      <div>
        <Header title="Activity Log" />
        <div className="p-6 text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Activity Log" />
        <div className="p-6"><div className="px-4 py-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><p className="font-semibold">Unable to load activities</p><p>{error}</p></div></div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Activity Log" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{activities.length} activities recorded</p>
          <Link href="/activities/new" className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: "#1B5E20" }}>
            + Log Activity
          </Link>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500 mb-4">No activities logged yet</p>
            <Link href="/activities/new" className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: "#1B5E20" }}>Log first activity</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([month, acts]) => (
              <div key={month}>
                <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">{month}</h3>
                <div className="space-y-2">
                  {acts.map((activity) => (
                    <div key={activity.id} className="bg-white rounded-xl border border-gray-100 p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[activity.type] || "📋"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-gray-900">{activity.title}</p>
                              {activity.batch && <p className="text-xs text-gray-400">{activity.batch.name}</p>}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                              {activity.cost && <p className="text-xs font-medium mt-0.5" style={{ color: "#1B5E20" }}>{formatNaira(activity.cost)}</p>}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          {(activity.product || activity.quantity) && (
                            <p className="text-xs text-gray-400 mt-1">{activity.product}{activity.quantity ? ` — ${activity.quantity}` : ""}</p>
                          )}
                          <div className="flex gap-3 mt-1 text-xs text-gray-400">
                            {activity.weather && <span>🌤️ {activity.weather}</span>}
                            {activity.plantCount && <span>🌱 {activity.plantCount} plants</span>}
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold flex-shrink-0" style={{ background: "#1B5E20" }}>
                                {activity.user?.name?.[0]?.toUpperCase() ?? "?"}
                              </span>
                              <span className="text-xs text-gray-400">{activity.user?.name ?? "Unknown"}</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => startEdit(activity)} className="px-3 py-1 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">Edit</button>
                              <button onClick={() => deleteActivity(activity.id)} className="px-3 py-1 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Delete</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Edit form */}
                      {editing === activity.id && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          <p className="text-xs font-semibold text-gray-700">Edit Activity</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-500">Type</label>
                              <select value={editForm.type} onChange={ef("type")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs bg-white">
                                {ACTIVITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                              </select>
                              {editForm.type === "other" && (
                                <input
                                  value={editCustomType}
                                  onChange={(e) => setEditCustomType(e.target.value)}
                                  className="mt-1 w-full px-2 py-1.5 border border-amber-300 rounded text-xs bg-amber-50"
                                  placeholder="Describe the activity type…"
                                />
                              )}
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Date</label>
                              <input type="date" value={editForm.date} onChange={ef("date")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Title</label>
                            <input value={editForm.title} onChange={ef("title")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Description</label>
                            <textarea rows={2} value={editForm.description} onChange={ef("description")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs resize-none" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-500">Batch</label>
                              <select value={editForm.batchId} onChange={ef("batchId")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs bg-white">
                                <option value="">Farm-wide</option>
                                {batches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Weather</label>
                              <select value={editForm.weather} onChange={ef("weather")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs bg-white">
                                <option value="">—</option>
                                <option value="sunny">☀️ Sunny</option>
                                <option value="cloudy">⛅ Cloudy</option>
                                <option value="rainy">🌧️ Rainy</option>
                                <option value="harmattan">🌫️ Harmattan</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-xs text-gray-500">Product</label>
                              <input value={editForm.product} onChange={ef("product")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Quantity</label>
                              <input value={editForm.quantity} onChange={ef("quantity")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Cost (N)</label>
                              <input type="number" value={editForm.cost} onChange={ef("cost")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(activity.id)} className="px-3 py-1.5 text-xs font-medium text-white rounded-lg" style={{ background: "#1B5E20" }}>Save Changes</button>
                            <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
