"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { api } from "@/lib/api";

export default function NewHarvestPage() {
  const searchParams = useSearchParams();
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
  const [tab, setTab] = useState(searchParams.get("type") === "sucker" ? "sucker" : "bunch");
  const [form, setForm] = useState({
    harvestDate: new Date().toISOString().split("T")[0],
    batchId: "", bunchCount: "", avgBunchWeight: "", pricePerBunch: "",
    buyer: "", channel: "farm_gate", notes: "",
    // sucker fields
    suckerCount: "", method: "natural", soldCount: "", pricePerSucker: "", replantedCount: "",
  });
  const [loading, setLoading] = useState(false);
  const [customChannel, setCustomChannel] = useState("");
  const router = useRouter();

  useEffect(() => {
    api.getBatches().then(setBatches).catch(console.error);
  }, []);

  const bunchCount = parseInt(form.bunchCount) || 0;
  const pricePerBunch = parseFloat(form.pricePerBunch) || 0;
  const totalRevenue = bunchCount * pricePerBunch;
  const soldCount = parseInt(form.soldCount) || 0;
  const pricePerSucker = parseFloat(form.pricePerSucker) || 0;
  const suckerRevenue = soldCount * pricePerSucker;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "bunch") {
        const channel = form.channel === "other" ? (customChannel.trim() || "other") : form.channel;
        await api.createHarvest({ ...form, channel, revenue: totalRevenue });
      } else {
        await api.createSuckerHarvest({ ...form, revenue: suckerRevenue });
      }
      router.push("/harvests");
    } catch (e: any) { alert(e.message || "Failed to save harvest"); setLoading(false); }
  }

  const f = (k: string) => (e: any) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <Header title="Record Harvest" />
      <div className="p-6 max-w-2xl">
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab("bunch")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "bunch" ? "text-white" : "bg-gray-100 text-gray-600"}`} style={tab === "bunch" ? { background: "#1B5E20" } : {}}>
            🌾 Bunch Harvest
          </button>
          <button onClick={() => setTab("sucker")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "sucker" ? "text-white" : "bg-gray-100 text-gray-600"}`} style={tab === "sucker" ? { background: "#E65100" } : {}}>
            🌱 Sucker Harvest
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input required type="date" value={form.harvestDate} onChange={f("harvestDate")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch *</label>
              <select required value={form.batchId} onChange={f("batchId")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">Select batch</option>
                {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          {tab === "bunch" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bunches Harvested *</label>
                  <input required type="number" value={form.bunchCount} onChange={f("bunchCount")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avg Bunch Weight (kg)</label>
                  <input type="number" step="0.1" value={form.avgBunchWeight} onChange={f("avgBunchWeight")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="12.5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Bunch (N)</label>
                  <input type="number" value={form.pricePerBunch} onChange={f("pricePerBunch")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="1500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Revenue (auto)</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium" style={{ color: "#1B5E20" }}>
                    N{totalRevenue.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buyer</label>
                  <input value={form.buyer} onChange={f("buyer")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Buyer name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Channel</label>
                  <select value={form.channel} onChange={f("channel")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                    <option value="farm_gate">Farm Gate</option>
                    <option value="olomi_market">Olomi Market</option>
                    <option value="bodija_market">Bodija Market</option>
                    <option value="restaurant">Restaurant/Buka</option>
                    <option value="lagos_buyer">Lagos Buyer</option>
                    <option value="other">Other…</option>
                  </select>
                  {form.channel === "other" && (
                    <input
                      required
                      value={customChannel}
                      onChange={(e) => setCustomChannel(e.target.value)}
                      className="mt-2 w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-amber-50"
                      placeholder="Specify channel…"
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suckers Harvested *</label>
                  <input required type="number" value={form.suckerCount} onChange={f("suckerCount")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <select value={form.method} onChange={f("method")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                    <option value="natural">Natural sucker harvest</option>
                    <option value="gouging">Post-gouge</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suckers Sold</label>
                  <input type="number" value={form.soldCount} onChange={f("soldCount")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Sucker (N)</label>
                  <input type="number" value={form.pricePerSucker} onChange={f("pricePerSucker")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suckers Replanted</label>
                  <input type="number" value={form.replantedCount} onChange={f("replantedCount")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Revenue (auto)</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium" style={{ color: "#6A1B9A" }}>
                    N{suckerRevenue.toLocaleString()}
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={2} value={form.notes} onChange={f("notes")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="px-6 py-2 text-white rounded-lg font-medium text-sm disabled:opacity-60" style={{ background: "#1B5E20" }}>
              {loading ? "Saving..." : "Record Harvest"}
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
