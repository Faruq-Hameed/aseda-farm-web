"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { formatDate, formatNaira } from "@/lib/utils";
import { api } from "@/lib/api";

const EXPENSE_CATEGORIES = [
  { value: "suckers", label: "Planting Material (Suckers)" },
  { value: "fertilizer", label: "Fertilizer" },
  { value: "herbicide", label: "Herbicide" },
  { value: "labour", label: "Labour" },
  { value: "transport", label: "Transport" },
  { value: "equipment", label: "Equipment / Tools" },
  { value: "propping", label: "Propping Materials" },
  { value: "land_prep", label: "Land Preparation" },
  { value: "other", label: "Other" },
];

const CAT_COLORS: Record<string, string> = {
  suckers: "#E65100", fertilizer: "#2E7D32", herbicide: "#6A1B9A",
  labour: "#1565C0", transport: "#F9A825", equipment: "#616161",
  propping: "#4E342E", land_prep: "#AD1457", other: "#9E9E9E",
};

const emptyForm = { date: new Date().toISOString().split("T")[0], category: "fertilizer", item: "", amount: "", vendor: "", batchId: "", notes: "" };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [customCat, setCustomCat] = useState("");
  const [editCustomCat, setEditCustomCat] = useState("");

  useEffect(() => {
    api.getExpenses().then(setExpenses).catch((err: Error) => setPageError(err.message));
    api.getBatches().then(setBatches).catch(() => {});
  }, []);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byCat: Record<string, number> = {};
  for (const e of expenses) byCat[e.category] = (byCat[e.category] || 0) + e.amount;

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setLoading(true);
    try {
      const category = form.category === "other" ? (customCat.trim() || "other") : form.category;
      const newExp = await api.createExpense({ ...form, category, amount: parseFloat(form.amount) });
      setExpenses((p) => [newExp, ...p]);
      setShowForm(false);
      setForm({ ...emptyForm });
      setCustomCat("");
    } catch (e: any) { alert(e.message || "Failed to save expense"); }
    setLoading(false);
  }

  function startEdit(expense: any) {
    const knownCats = EXPENSE_CATEGORIES.map(c => c.value);
    const isKnown = knownCats.includes(expense.category);
    setEditCustomCat(isKnown ? "" : expense.category);
    setEditForm({
      date: expense.date ? new Date(expense.date).toISOString().split("T")[0] : "",
      category: isKnown ? expense.category : "other",
      item: expense.item,
      amount: expense.amount,
      vendor: expense.vendor || "",
      batchId: expense.batchId || "",
      notes: expense.notes || "",
    });
    setEditing(expense.id);
    setShowForm(false);
  }

  async function saveEdit(id: string) {
    setEditLoading(true);
    try {
      const category = editForm.category === "other" ? (editCustomCat.trim() || "other") : editForm.category;
      const updated = await api.updateExpense(id, { ...editForm, category, amount: parseFloat(editForm.amount) });
      setExpenses((prev) => prev.map((e) => e.id === id ? { ...e, ...updated } : e));
      setEditing(null);
    } catch (e: any) { alert(e.message || "Failed to update expense"); }
    setEditLoading(false);
  }

  async function deleteExpense(id: string) {
    if (!confirm("Delete this expense?")) return;
    try {
      await api.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (e: any) { alert(e.message || "Failed to delete expense"); }
  }

  const f = (k: string) => (e: any) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const ef = (k: string) => (e: any) => setEditForm((p: any) => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <Header title="Expenses" />
      {pageError && (
        <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {pageError}
        </div>
      )}
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{expenses.length} expenses — Total: <strong>{formatNaira(total)}</strong></p>
          <button onClick={() => { setShowForm(!showForm); setEditing(null); }} className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: "#1B5E20" }}>
            + Add Expense
          </button>
        </div>

        {/* Category breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(byCat).map(([cat, amount]) => (
            <div key={cat} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: CAT_COLORS[cat] || "#9E9E9E" }} />
                <p className="text-xs text-gray-500 truncate">{EXPENSE_CATEGORIES.find((c) => c.value === cat)?.label || cat}</p>
              </div>
              <p className="font-bold text-gray-900">{formatNaira(amount)}</p>
            </div>
          ))}
        </div>

        {/* Add form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Add Expense</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
                <input required type="date" value={form.date} onChange={f("date")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                <select required value={form.category} onChange={f("category")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                {form.category === "other" && (
                  <input
                    required
                    value={customCat}
                    onChange={(e) => setCustomCat(e.target.value)}
                    className="mt-2 w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-amber-50"
                    placeholder="Specify category…"
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Item Description *</label>
              <input required value={form.item} onChange={f("item")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. 680 suckers @ N200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Amount (N) *</label>
                <input required type="number" value={form.amount} onChange={f("amount")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Vendor</label>
                <input value={form.vendor} onChange={f("vendor")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Supplier name" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Batch</label>
              <select value={form.batchId} onChange={f("batchId")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">Farm-wide</option>
                {batches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="px-4 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-60" style={{ background: "#1B5E20" }}>
                {loading ? "Saving..." : "Add Expense"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        )}

        {/* Expense list */}
        {expenses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <p className="text-4xl mb-3">💰</p>
            <p className="text-gray-500">No expenses recorded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense: any) => (
              <div key={expense.id} className="bg-white rounded-xl border border-gray-100 p-4">
                {editing === expense.id ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">Edit Expense</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Date</label>
                        <input type="date" value={editForm.date} onChange={ef("date")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Category</label>
                        <select value={editForm.category} onChange={ef("category")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs bg-white">
                          {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        {editForm.category === "other" && (
                          <input
                            value={editCustomCat}
                            onChange={(e) => setEditCustomCat(e.target.value)}
                            className="mt-1 w-full px-2 py-1.5 border border-amber-300 rounded text-xs bg-amber-50"
                            placeholder="Specify category…"
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Item Description</label>
                      <input value={editForm.item} onChange={ef("item")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Amount (N)</label>
                        <input type="number" value={editForm.amount} onChange={ef("amount")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Vendor</label>
                        <input value={editForm.vendor} onChange={ef("vendor")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Batch</label>
                      <select value={editForm.batchId} onChange={ef("batchId")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs bg-white">
                        <option value="">Farm-wide</option>
                        {batches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(expense.id)} disabled={editLoading} className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-60" style={{ background: "#1B5E20" }}>{editLoading ? "Saving..." : "Save Changes"}</button>
                      <button onClick={() => setEditing(null)} disabled={editLoading} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: CAT_COLORS[expense.category] || "#9E9E9E" }} />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{expense.item}</p>
                        <p className="text-xs text-gray-400">{formatDate(expense.date)}{expense.vendor ? ` • ${expense.vendor}` : ""}</p>
                        <p className="text-xs text-gray-400">{EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-gray-900">{formatNaira(expense.amount)}</p>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(expense)} className="px-2 py-1 text-xs text-blue-600 border border-blue-200 rounded hover:bg-blue-50">Edit</button>
                        <button onClick={() => deleteExpense(expense.id)} className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50">Delete</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
