"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailEnabled: true,
    emailDaysBefore: 3,
    dailyDigest: true,
    digestTime: "07:00",
    overdueAlerts: true,
    harvestAlerts: true,
    weeklyReport: true,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getSettings()
      .then((d) => { if (d) setSettings(d); })
      .catch((err: Error) => setError(err.message));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    }
    setLoading(false);
  }

  function toggle(key: string) {
    setSettings((p) => ({ ...p, [key]: !p[key as keyof typeof p] }));
  }

  return (
    <div>
      <Header title="Settings" />
      {error && (
        <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="p-6 max-w-2xl space-y-6">
        {/* Profile card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Account</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ background: "#1B5E20" }}>
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Notification settings */}
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Notification Settings</h2>

          {[
            { key: "emailEnabled", label: "Email Notifications", desc: "Receive task reminders and alerts by email" },
            { key: "dailyDigest", label: "Daily Digest", desc: "Morning summary of today's tasks and upcoming work" },
            { key: "overdueAlerts", label: "Overdue Alerts", desc: "Alert when tasks pass their due date without completion" },
            { key: "harvestAlerts", label: "Harvest Alerts", desc: "Notifications when batches approach harvest readiness" },
            { key: "weeklyReport", label: "Weekly Report", desc: "Monday morning summary of the previous week" },
          ].map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 text-sm">{s.label}</p>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(s.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings[s.key as keyof typeof settings] ? "bg-green-600" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${settings[s.key as keyof typeof settings] ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          ))}

          <div className="pt-2 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email reminder X days before due date</label>
            <select
              value={settings.emailDaysBefore}
              onChange={(e) => setSettings((p) => ({ ...p, emailDaysBefore: parseInt(e.target.value) }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value={1}>1 day before</option>
              <option value={2}>2 days before</option>
              <option value={3}>3 days before</option>
              <option value={5}>5 days before</option>
              <option value={7}>7 days before</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="px-6 py-2 text-white rounded-lg font-medium text-sm disabled:opacity-60" style={{ background: "#1B5E20" }}>
            {loading ? "Saving..." : saved ? "✓ Saved!" : "Save Settings"}
          </button>
        </form>

        {/* Farm info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Farm Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Farm Name</span>
              <span className="font-medium">ASEDA Farm</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Location</span>
              <span className="font-medium text-right max-w-xs">Adesiyan Village, Olojuoro Road, Ibadan</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">State</span>
              <span className="font-medium">Oyo State, Nigeria</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Total Area</span>
              <span className="font-medium">5 acres (target)</span>
            </div>
          </div>
        </div>

        {/* Seed button */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800 mb-2">Development Tools</p>
          <button
            onClick={() => {
              if (confirm("Re-seed the database with ASEDA Farm demo data?")) {
                api.seed().then((d) => alert(d.message || "Done")).catch(() => alert("Failed"));
              }
            }}
            className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200"
          >
            Re-seed Database
          </button>
        </div>
      </div>
    </div>
  );
}
