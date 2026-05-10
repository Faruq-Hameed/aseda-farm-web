"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";

type MemberRole = "OWNER" | "MANAGER" | "WORKER" | "VIEWER";
type Tab = "members" | "activity" | "changes";

interface Member {
  id: string;
  role: MemberRole;
  createdAt: string;
  user: { id: string; name: string; email: string; phone?: string | null };
  addedBy: { id: string; name: string };
}

interface ActivityLog {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  cost?: number | null;
  product?: string | null;
  quantity?: string | null;
  weather?: string | null;
  user: { id: string; name: string; email: string };
  batch?: { id: string; name: string } | null;
}

interface ChangeLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  createdAt: string;
  summary?: string | null;
  before?: any;
  after?: any;
  user: { id: string; name: string; email: string };
}

const ROLE_LABELS: Record<MemberRole, string> = { OWNER: "Owner", MANAGER: "Manager", WORKER: "Worker", VIEWER: "Viewer" };
const ROLE_COLORS: Record<MemberRole, string> = {
  OWNER: "bg-yellow-100 text-yellow-800",
  MANAGER: "bg-blue-100 text-blue-800",
  WORKER: "bg-green-100 text-green-800",
  VIEWER: "bg-gray-100 text-gray-700",
};

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-100 text-green-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
};
const ACTION_ICONS: Record<string, string> = { create: "✚", update: "✎", delete: "✕" };

const TYPE_ICONS: Record<string, string> = {
  fertilizer_applied: "🌿", herbicide_applied: "🟣", weeding_done: "🔵",
  suckers_harvested: "🌱", bunch_harvested: "🌾", propping_done: "🪵",
  gouging_done: "⛏️", inspection: "🔍", pest_treatment: "🐛",
  irrigation: "💧", other: "📋",
};

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const dim = size === "md" ? "w-8 h-8 text-sm" : "w-6 h-6 text-xs";
  return (
    <span className={`inline-flex items-center justify-center ${dim} rounded-full text-white font-bold flex-shrink-0`} style={{ background: "#1B5E20" }}>
      {name[0]?.toUpperCase() ?? "?"}
    </span>
  );
}

function formatTs(ts: string) {
  return new Date(ts).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ChangeDiff({ before, after }: { before?: any; after?: any }) {
  if (!before && !after) return null;
  const keys = Array.from(new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])).filter(
    (k) => !["id", "createdAt", "updatedAt"].includes(k) && JSON.stringify(before?.[k]) !== JSON.stringify(after?.[k])
  );
  if (keys.length === 0) return null;
  return (
    <div className="mt-2 text-xs space-y-1">
      {keys.slice(0, 6).map((k) => (
        <div key={k} className="flex gap-2 items-start">
          <span className="font-medium text-gray-500 min-w-[80px]">{k}</span>
          {before?.[k] !== undefined && (
            <span className="line-through text-red-400 truncate max-w-[120px]">{String(before[k])}</span>
          )}
          <span className="text-gray-400">→</span>
          {after?.[k] !== undefined && (
            <span className="text-green-700 truncate max-w-[120px]">{String(after[k])}</span>
          )}
        </div>
      ))}
      {keys.length > 6 && <p className="text-gray-400 italic">+{keys.length - 6} more fields</p>}
    </div>
  );
}

export default function MembersPage() {
  const { user, isOwnerOrManager } = useAuth();
  const [tab, setTab] = useState<Tab>("members");
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [changes, setChanges] = useState<ChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [filterMember, setFilterMember] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", phone: "", role: "WORKER" });
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => { loadMembers(); }, []);

  useEffect(() => {
    if (tab === "activity") loadActivities(filterMember || undefined);
    if (tab === "changes") loadChanges(filterMember || undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, filterMember]);

  async function loadMembers() {
    try {
      setLoading(true);
      setMembers(await api.getMembers());
    } finally {
      setLoading(false);
    }
  }

  async function loadActivities(userId?: string) {
    setAuditLoading(true);
    try { setActivities(await api.getMemberActivities(userId)); }
    finally { setAuditLoading(false); }
  }

  async function loadChanges(userId?: string) {
    setAuditLoading(true);
    try { setChanges(await api.getMemberChanges(userId)); }
    finally { setAuditLoading(false); }
  }

  function handleFilterChange(userId: string) {
    setFilterMember(userId);
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");
    try {
      await api.addMember({ name: addForm.name, email: addForm.email, password: addForm.password, phone: addForm.phone || undefined, role: addForm.role as any });
      setShowAddForm(false);
      setAddForm({ name: "", email: "", password: "", phone: "", role: "WORKER" });
      await loadMembers();
    } catch (err: any) {
      setAddError(err.message || "Failed to add member");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleRoleChange(memberId: string, role: string) {
    try { await api.updateMemberRole(memberId, role as any); await loadMembers(); }
    catch (err: any) { alert(err.message || "Failed to update role"); }
  }

  async function handleRemove(memberId: string, memberName: string) {
    if (!confirm(`Remove ${memberName} from the farm?`)) return;
    try { await api.removeMember(memberId); await loadMembers(); }
    catch (err: any) { alert(err.message || "Failed to remove member"); }
  }

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-green-700 text-green-800" : "border-transparent text-gray-500 hover:text-gray-700"}`;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team & Audit</h1>
          <p className="text-gray-500 text-sm mt-1">Manage members and track who performed every action</p>
        </div>
        {isOwnerOrManager && tab === "members" && (
          <button onClick={() => setShowAddForm(true)} className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: "#1B5E20" }}>
            + Add Member
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        <button className={tabClass("members")} onClick={() => setTab("members")}>Members ({members.length})</button>
        {isOwnerOrManager && (
          <>
            <button className={tabClass("activity")} onClick={() => setTab("activity")}>Activity Log</button>
            <button className={tabClass("changes")} onClick={() => setTab("changes")}>Change History</button>
          </>
        )}
      </div>

      {/* ── MEMBERS TAB ── */}
      {tab === "members" && (
        <>
          {showAddForm && (
            <div className="bg-white rounded-xl shadow p-6 mb-6 border border-green-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Member</h2>
              {addError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{addError}</div>}
              <form onSubmit={handleAddMember} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" required value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" required value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input type="password" required minLength={6} value={addForm.password} onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={addForm.phone} onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select value={addForm.role} onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none">
                    <option value="MANAGER">Manager — full access, can add members</option>
                    <option value="WORKER">Worker — can create & update records</option>
                    <option value="VIEWER">Viewer — read only</option>
                  </select>
                </div>
                <div className="col-span-2 flex gap-3 justify-end">
                  <button type="button" onClick={() => { setShowAddForm(false); setAddError(""); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={addLoading} className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60" style={{ background: "#1B5E20" }}>
                    {addLoading ? "Adding..." : "Add Member"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading members...</div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Member</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Added By</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                    {isOwnerOrManager && <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={m.user.name} size="md" />
                          <div>
                            <p className="font-medium text-gray-900">{m.user.name}</p>
                            <p className="text-xs text-gray-500">{m.user.email}</p>
                            {m.user.phone && <p className="text-xs text-gray-400">{m.user.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isOwnerOrManager && m.role !== "OWNER" ? (
                          <select value={m.role} onChange={(e) => handleRoleChange(m.id, e.target.value)}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${ROLE_COLORS[m.role]}`}>
                            <option value="MANAGER">Manager</option>
                            <option value="WORKER">Worker</option>
                            <option value="VIEWER">Viewer</option>
                          </select>
                        ) : (
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${ROLE_COLORS[m.role]}`}>{ROLE_LABELS[m.role]}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{m.addedBy.name}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(m.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      {isOwnerOrManager && (
                        <td className="px-4 py-3 text-right">
                          {m.role !== "OWNER" && m.user.id !== user?.id && (
                            <button onClick={() => handleRemove(m.id, m.user.name)} className="text-xs text-red-500 hover:text-red-700 hover:underline">Remove</button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {members.length === 0 && <div className="text-center text-gray-400 py-12">No team members yet.</div>}
            </div>
          )}
        </>
      )}

      {/* ── ACTIVITY LOG TAB ── */}
      {tab === "activity" && isOwnerOrManager && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-gray-600 font-medium">Filter by member:</label>
            <select value={filterMember} onChange={(e) => handleFilterChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none">
              <option value="">All members</option>
              {members.map((m) => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
            </select>
          </div>

          {auditLoading ? (
            <div className="text-center text-gray-400 py-12">Loading activity log...</div>
          ) : activities.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No activity logs yet.</div>
          ) : (
            <div className="space-y-2">
              {activities.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[a.type] || "📋"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900">{a.title}</p>
                        {a.batch && <p className="text-xs text-gray-400">{a.batch.name}</p>}
                      </div>
                      <p className="text-xs text-gray-400 flex-shrink-0">{formatTs(a.date)}</p>
                    </div>
                    {a.description && <p className="text-sm text-gray-600 mt-1">{a.description}</p>}
                    {(a.product || a.quantity) && (
                      <p className="text-xs text-gray-400 mt-1">{a.product}{a.quantity ? ` — ${a.quantity}` : ""}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                      <Avatar name={a.user.name} />
                      <span className="text-xs font-medium text-gray-600">{a.user.name}</span>
                      <span className="text-xs text-gray-400">{a.user.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CHANGE HISTORY TAB ── */}
      {tab === "changes" && isOwnerOrManager && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-gray-600 font-medium">Filter by member:</label>
            <select value={filterMember} onChange={(e) => handleFilterChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none">
              <option value="">All members</option>
              {members.map((m) => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
            </select>
          </div>

          {auditLoading ? (
            <div className="text-center text-gray-400 py-12">Loading change history...</div>
          ) : changes.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No changes recorded yet.</div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {changes.map((c) => (
                  <div key={c.id} className="relative flex gap-4 pl-10">
                    {/* Timeline dot */}
                    <div className={`absolute left-0 top-2 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${ACTION_COLORS[c.action] ?? "bg-gray-100 text-gray-600"}`}>
                      {ACTION_ICONS[c.action] ?? "•"}
                    </div>

                    <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ACTION_COLORS[c.action] ?? "bg-gray-100 text-gray-600"}`}>
                              {c.action.toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-gray-800">{c.entityType}</span>
                          </div>
                          {c.summary && <p className="text-xs text-gray-500 mt-0.5">{c.summary}</p>}
                        </div>
                        <p className="text-xs text-gray-400 flex-shrink-0">{formatTs(c.createdAt)}</p>
                      </div>

                      <ChangeDiff before={c.before} after={c.after} />

                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-50">
                        <Avatar name={c.user.name} />
                        <span className="text-xs font-medium text-gray-600">{c.user.name}</span>
                        <span className="text-xs text-gray-400">{c.user.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
