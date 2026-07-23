"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { formatDate, formatNaira } from "@/lib/utils";
import { getHarvestUnit } from "@/lib/crops";
import { api } from "@/lib/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const CHANNELS = ["farm_gate","bodija_market","olomi_market","restaurant","lagos_buyer","other"];
const CHANNEL_LABELS: Record<string, string> = {
  farm_gate: "Farm Gate", bodija_market: "Bodija Market", olomi_market: "Olomi Market",
  restaurant: "Restaurant/Buka", lagos_buyer: "Lagos Buyer", other: "Other",
};

export default function HarvestsPage() {
  const [harvests, setHarvests] = useState<any[]>([]);
  const [suckerHarvests, setSuckerHarvests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; type: "bunch" | "sucker" } | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editCustomChannel, setEditCustomChannel] = useState("");
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "bunches";

  useEffect(() => {
    Promise.all([api.getHarvests(), api.getSuckerHarvests()])
      .then(([h, s]) => { setHarvests(h); setSuckerHarvests(s); })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = harvests.reduce((sum, h) => sum + (h.totalRevenue || 0), 0);
  const totalBunches = harvests.reduce((sum, h) => sum + h.bunchCount, 0);
  const totalSuckerRevenue = suckerHarvests.reduce((sum, s) => sum + (s.revenue || 0), 0);

  function startEditBunch(h: any) {
    const knownChannels = ["farm_gate","bodija_market","olomi_market","restaurant","lagos_buyer"];
    const isKnown = !h.channel || knownChannels.includes(h.channel);
    setEditCustomChannel(isKnown ? "" : h.channel);
    setEditForm({
      harvestDate: h.harvestDate ? new Date(h.harvestDate).toISOString().split("T")[0] : "",
      bunchCount: h.bunchCount,
      avgBunchWeight: h.avgBunchWeight || "",
      pricePerBunch: h.pricePerBunch || "",
      buyer: h.buyer || "",
      channel: isKnown ? (h.channel || "") : "other",
      notes: h.notes || "",
    });
    setEditing({ id: h.id, type: "bunch" });
  }

  function startEditSucker(s: any) {
    setEditForm({
      harvestDate: s.harvestDate ? new Date(s.harvestDate).toISOString().split("T")[0] : "",
      suckerCount: s.suckerCount,
      method: s.method,
      soldCount: s.soldCount || 0,
      pricePerSucker: s.pricePerSucker || "",
      replantedCount: s.replantedCount || 0,
      notes: s.notes || "",
    });
    setEditing({ id: s.id, type: "sucker" });
  }

  async function saveEdit() {
    if (!editing) return;
    const editingId = editing.id;
    const editingType = editing.type;
    try {
      if (editingType === "bunch") {
        const channel = editForm.channel === "other" ? (editCustomChannel.trim() || "other") : editForm.channel;
        const updated = await api.updateHarvest(editingId, { ...editForm, channel });
        setHarvests((prev) => prev.map((h) => h.id === editingId ? { ...h, ...updated } : h));
      } else {
        const updated = await api.updateSuckerHarvest(editingId, editForm);
        setSuckerHarvests((prev) => prev.map((s) => s.id === editingId ? { ...s, ...updated } : s));
      }
      setEditing(null);
    } catch (e: any) { alert(e.message || "Failed to save harvest"); }
  }

  async function deleteBunch(id: string) {
    if (!confirm("Delete this harvest record?")) return;
    try {
      await api.deleteHarvest(id);
      setHarvests((prev) => prev.filter((h) => h.id !== id));
    } catch (e: any) { alert(e.message || "Failed to delete harvest"); }
  }

  async function deleteSucker(id: string) {
    if (!confirm("Delete this sucker harvest record?")) return;
    try {
      await api.deleteSuckerHarvest(id);
      setSuckerHarvests((prev) => prev.filter((s) => s.id !== id));
    } catch (e: any) { alert(e.message || "Failed to delete harvest"); }
  }

  const ef = (k: string) => (e: any) => setEditForm((f: any) => ({ ...f, [k]: e.target.value }));

  if (loading) {
    return (
      <div>
        <Header title="Harvests" />
        <div className="p-6 text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Harvests" />
        <div className="p-6"><div className="px-4 py-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><p className="font-semibold">Unable to load harvests</p><p>{error}</p></div></div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Harvests" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{harvests.length} bunch harvest{harvests.length !== 1 ? "s" : ""}</p>
          <Link href="/harvests/new" className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: "#1B5E20" }}>
            + Record Harvest
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: "#1B5E20" }}>{formatNaira(totalRevenue)}</p>
            <p className="text-xs text-gray-500 mt-1">Bunch Revenue</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalBunches.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Total Bunches</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: "#6A1B9A" }}>{formatNaira(totalSuckerRevenue)}</p>
            <p className="text-xs text-gray-500 mt-1">Sucker Revenue</p>
          </div>
        </div>

        <div className="flex gap-1 border-b border-gray-200">
          {["bunches", "suckers"].map((t) => (
            <Link key={t} href={`/harvests?tab=${t}`} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${tab === t ? "bg-white border border-b-white text-green-700 border-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
              {t === "bunches" ? "Bunch Harvests" : "Sucker Harvests"}
            </Link>
          ))}
        </div>

        {tab === "bunches" && (
          harvests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <p className="text-4xl mb-3">🌾</p>
              <p className="text-gray-500">No bunch harvests recorded yet</p>
              <p className="text-xs text-gray-400 mt-1">Expected April–July 2027</p>
            </div>
          ) : (
            <div className="space-y-3">
              {harvests.map((harvest) => (
                <div key={harvest.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  {editing !== null && editing.id === harvest.id && editing.type === "bunch" ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700">Edit Bunch Harvest</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">Date</label>
                          <input type="date" value={editForm.harvestDate} onChange={ef("harvestDate")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Bunch Count</label>
                          <input type="number" value={editForm.bunchCount} onChange={ef("bunchCount")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">Avg Weight (kg)</label>
                          <input type="number" step="0.1" value={editForm.avgBunchWeight} onChange={ef("avgBunchWeight")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Price/Bunch (N)</label>
                          <input type="number" value={editForm.pricePerBunch} onChange={ef("pricePerBunch")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">Buyer</label>
                          <input value={editForm.buyer} onChange={ef("buyer")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Channel</label>
                          <select value={editForm.channel} onChange={ef("channel")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs bg-white">
                            <option value="">—</option>
                            {CHANNELS.map((c) => <option key={c} value={c}>{CHANNEL_LABELS[c]}</option>)}
                            <option value="other">Other…</option>
                          </select>
                          {editForm.channel === "other" && (
                            <input
                              value={editCustomChannel}
                              onChange={(e) => setEditCustomChannel(e.target.value)}
                              className="mt-1 w-full px-2 py-1.5 border border-amber-300 rounded text-xs bg-amber-50"
                              placeholder="Specify channel…"
                            />
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Notes</label>
                        <input value={editForm.notes} onChange={ef("notes")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="px-3 py-1.5 text-xs font-medium text-white rounded-lg" style={{ background: "#1B5E20" }}>Save Changes</button>
                        <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{harvest.bunchCount} {getHarvestUnit(harvest.batch?.cropType).unitPlural.toLowerCase()} — {harvest.batch?.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatDate(harvest.harvestDate)} • {CHANNEL_LABELS[harvest.channel] || harvest.channel || "—"}</p>
                          {harvest.buyer && <p className="text-xs text-gray-400">Buyer: {harvest.buyer}</p>}
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            {harvest.avgBunchWeight && <span>Avg weight: {harvest.avgBunchWeight}kg</span>}
                            {harvest.totalWeight && <span>Total: {harvest.totalWeight}kg</span>}
                            {harvest.pricePerBunch && <span>N{harvest.pricePerBunch.toLocaleString()}/{getHarvestUnit(harvest.batch?.cropType).unit.toLowerCase()}</span>}
                          </div>
                        </div>
                        {harvest.totalRevenue && <p className="text-xl font-bold" style={{ color: "#1B5E20" }}>{formatNaira(harvest.totalRevenue)}</p>}
                      </div>
                      <div className="flex gap-2 mt-3 pt-2 border-t border-gray-50">
                        <button onClick={() => startEditBunch(harvest)} className="px-3 py-1 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">Edit</button>
                        <button onClick={() => deleteBunch(harvest.id)} className="px-3 py-1 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {tab === "suckers" && (
          suckerHarvests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <p className="text-4xl mb-3">🌱</p>
              <p className="text-gray-500">No sucker harvests recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suckerHarvests.map((sh) => (
                <div key={sh.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  {editing !== null && editing.id === sh.id && editing.type === "sucker" ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700">Edit Sucker Harvest</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">Date</label>
                          <input type="date" value={editForm.harvestDate} onChange={ef("harvestDate")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Sucker Count</label>
                          <input type="number" value={editForm.suckerCount} onChange={ef("suckerCount")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">Sold</label>
                          <input type="number" value={editForm.soldCount} onChange={ef("soldCount")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Price/Sucker (N)</label>
                          <input type="number" value={editForm.pricePerSucker} onChange={ef("pricePerSucker")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Replanted</label>
                          <input type="number" value={editForm.replantedCount} onChange={ef("replantedCount")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Notes</label>
                        <input value={editForm.notes} onChange={ef("notes")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="px-3 py-1.5 text-xs font-medium text-white rounded-lg" style={{ background: "#1B5E20" }}>Save Changes</button>
                        <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{sh.suckerCount} suckers — {sh.batch?.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatDate(sh.harvestDate)} • {sh.method}</p>
                          <p className="text-xs text-gray-400 mt-1">Sold: {sh.soldCount || 0} | Replanted: {sh.replantedCount || 0}</p>
                          {sh.pricePerSucker && <p className="text-xs text-gray-400">N{sh.pricePerSucker}/sucker</p>}
                        </div>
                        {sh.revenue && <p className="text-xl font-bold" style={{ color: "#6A1B9A" }}>{formatNaira(sh.revenue)}</p>}
                      </div>
                      <div className="flex gap-2 mt-3 pt-2 border-t border-gray-50">
                        <button onClick={() => startEditSucker(sh)} className="px-3 py-1 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">Edit</button>
                        <button onClick={() => deleteSucker(sh.id)} className="px-3 py-1 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
