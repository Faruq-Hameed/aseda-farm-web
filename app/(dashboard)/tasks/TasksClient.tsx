"use client";
import { useState } from "react";
import { CATEGORY_COLORS, CATEGORY_LABELS, STATUS_COLORS, PRIORITY_COLORS, formatDate } from "@/lib/utils";
import { api } from "@/lib/api";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  overdue: "Overdue",
  skipped: "Skipped",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const CATEGORIES = [
  "fertilizer","herbicide","weeding","propping","sucker_harvest",
  "bunch_harvest","gouging","inspection","pest_control","other",
];

interface Task {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  dueDate: Date;
  product: string | null;
  quantity: string | null;
  notes: string | null;
  description: string | null;
  batch: { id: string; name: string } | null;
}

interface Batch { id: string; name: string; }

export function TasksClient({ initialTasks, batches }: { initialTasks: Task[]; batches: Batch[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState({ status: "", category: "", batchId: "" });
  const [completing, setCompleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const emptyCompleteForm = { completedAt: "", actualCost: "", notes: "", weather: "" };
  const [completeForms, setCompleteForms] = useState<Record<string, typeof emptyCompleteForm>>({});
  const [editForm, setEditForm] = useState<any>({});
  const [editCustomCategory, setEditCustomCategory] = useState("");

  const filtered = tasks.filter((t) => {
    if (filter.status && t.status !== filter.status) return false;
    if (filter.category && t.category !== filter.category) return false;
    if (filter.batchId && t.batch?.id !== filter.batchId) return false;
    return true;
  });

  async function markComplete(taskId: string) {
    const form = completeForms[taskId] || emptyCompleteForm;
    try {
      await api.completeTask(taskId, form);
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: "completed" } : t));
      setCompleting(null);
      setCompleteForms((prev) => { const next = { ...prev }; delete next[taskId]; return next; });
    } catch (e: any) { alert(e.message || "Action failed"); }
  }

  function setCompleteField(taskId: string, key: string, value: string) {
    setCompleteForms((prev) => ({ ...prev, [taskId]: { ...(prev[taskId] || emptyCompleteForm), [key]: value } }));
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return;
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (e: any) { alert(e.message || "Action failed"); }
  }

  function startEdit(task: Task) {
    const knownCats = CATEGORIES;
    const isKnown = knownCats.includes(task.category);
    setEditCustomCategory(isKnown ? "" : task.category);
    setEditForm({
      title: task.title,
      category: isKnown ? task.category : "other",
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      product: task.product || "",
      quantity: task.quantity || "",
      description: task.description || "",
      notes: task.notes || "",
      batchId: task.batch?.id || "",
    });
    setEditing(task.id);
    setCompleting(null);
  }

  async function saveEdit(taskId: string) {
    try {
      const category = editForm.category === "other" ? (editCustomCategory.trim() || "other") : editForm.category;
      const updated = await api.updateTask(taskId, {
        ...editForm,
        category,
        batchId: editForm.batchId || undefined,
      });
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, ...updated } : t));
      setEditing(null);
    } catch (e: any) { alert(e.message || "Action failed"); }
  }

  const ef = (k: string) => (e: any) => setEditForm((f: any) => ({ ...f, [k]: e.target.value }));
  const categories = [...new Set(tasks.map((t) => t.category))];

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={filter.status} onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filter.category} onChange={(e) => setFilter((f) => ({ ...f, category: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
        </select>
        <select value={filter.batchId} onChange={(e) => setFilter((f) => ({ ...f, batchId: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
          <option value="">All batches</option>
          {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        {(filter.status || filter.category || filter.batchId) && (
          <button onClick={() => setFilter({ status: "", category: "", batchId: "" })} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Clear filters</button>
        )}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm">No tasks found</p>
          </div>
        ) : (
          filtered.map((task) => {
            const catColor = CATEGORY_COLORS[task.category] || "#9E9E9E";
            const isOverdue = task.status === "overdue";
            const daysUntil = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000);

            return (
              <div key={task.id} className={`bg-white rounded-xl border p-4 ${isOverdue ? "border-red-200" : "border-gray-100"}`}>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ background: catColor }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${task.status === "completed" ? "line-through text-gray-400" : "text-gray-900"}`}>{task.title}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {task.batch && <span className="text-xs text-gray-400">{task.batch.name}</span>}
                          <span className="text-xs px-1.5 py-0.5 rounded text-white" style={{ background: catColor }}>{CATEGORY_LABELS[task.category] || task.category}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded text-white" style={{ background: PRIORITY_COLORS[task.priority] || "#9E9E9E" }}>{PRIORITY_LABELS[task.priority]}</span>
                        </div>
                        {task.product && <p className="text-xs text-gray-400 mt-1">{task.product}{task.quantity ? ` — ${task.quantity}` : ""}</p>}
                        {task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className={`text-xs font-medium ${isOverdue ? "text-red-600" : daysUntil === 0 ? "text-orange-500" : "text-gray-500"}`}>
                          {isOverdue ? "Overdue" : daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : formatDate(task.dueDate)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded" style={{ background: STATUS_COLORS[task.status] + "20", color: STATUS_COLORS[task.status] }}>{STATUS_LABELS[task.status]}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {task.status !== "completed" && task.status !== "skipped" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button onClick={() => { setCompleting(task.id); setEditing(null); }} className="px-3 py-1.5 text-xs font-medium text-white rounded-lg" style={{ background: "#1B5E20" }}>Mark Complete</button>
                    <button onClick={() => startEdit(task)} className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">Edit</button>
                    <button onClick={() => deleteTask(task.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Delete</button>
                  </div>
                )}
                {(task.status === "completed" || task.status === "skipped") && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button onClick={() => deleteTask(task.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Delete</button>
                  </div>
                )}

                {/* Complete form */}
                {completing === task.id && (() => {
                  const cf = completeForms[task.id] || emptyCompleteForm;
                  return (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <p className="text-xs font-semibold text-gray-700">Complete Task</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">Date completed</label>
                          <input type="date" value={cf.completedAt} onChange={(e) => setCompleteField(task.id, "completedAt", e.target.value)} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Actual cost (N)</label>
                          <input type="number" placeholder="0" value={cf.actualCost} onChange={(e) => setCompleteField(task.id, "actualCost", e.target.value)} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Weather</label>
                        <select value={cf.weather} onChange={(e) => setCompleteField(task.id, "weather", e.target.value)} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs bg-white">
                          <option value="">Select weather</option>
                          <option value="sunny">☀️ Sunny</option>
                          <option value="cloudy">⛅ Cloudy</option>
                          <option value="rainy">🌧️ Rainy</option>
                          <option value="harmattan">🌫️ Harmattan</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Notes / issues</label>
                        <textarea rows={2} placeholder="Any observations or issues..." value={cf.notes} onChange={(e) => setCompleteField(task.id, "notes", e.target.value)} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs resize-none" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => markComplete(task.id)} className="px-3 py-1.5 text-xs font-medium text-white rounded-lg" style={{ background: "#1B5E20" }}>Save</button>
                        <button onClick={() => setCompleting(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                      </div>
                    </div>
                  );
                })()}

                {/* Edit form */}
                {editing === task.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <p className="text-xs font-semibold text-gray-700">Edit Task</p>
                    <div>
                      <label className="text-xs text-gray-500">Title</label>
                      <input value={editForm.title} onChange={ef("title")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Category</label>
                        <select value={editForm.category} onChange={ef("category")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs bg-white">
                          {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
                        </select>
                        {editForm.category === "other" && (
                          <input
                            value={editCustomCategory}
                            onChange={(e) => setEditCustomCategory(e.target.value)}
                            className="mt-1 w-full px-2 py-1.5 border border-amber-300 rounded text-xs bg-amber-50"
                            placeholder="Describe the task category…"
                          />
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Priority</label>
                        <select value={editForm.priority} onChange={ef("priority")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs bg-white">
                          {Object.entries(PRIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Due Date</label>
                        <input type="date" value={editForm.dueDate} onChange={ef("dueDate")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Batch</label>
                        <select value={editForm.batchId} onChange={ef("batchId")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs bg-white">
                          <option value="">Farm-wide</option>
                          {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Product</label>
                        <input value={editForm.product} onChange={ef("product")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" placeholder="e.g. NPK 15:15:15" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Quantity</label>
                        <input value={editForm.quantity} onChange={ef("quantity")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs" placeholder="e.g. 250g per plant" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Notes</label>
                      <textarea rows={2} value={editForm.notes} onChange={ef("notes")} className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-xs resize-none" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(task.id)} className="px-3 py-1.5 text-xs font-medium text-white rounded-lg" style={{ background: "#1B5E20" }}>Save Changes</button>
                      <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
