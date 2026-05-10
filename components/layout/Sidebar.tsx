"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/batches", label: "Batches", icon: "🌱" },
  { href: "/tasks", label: "Tasks", icon: "✅" },
  { href: "/activities", label: "Activities", icon: "📋" },
  { href: "/harvests", label: "Harvests", icon: "🌾" },
  { href: "/expenses", label: "Expenses", icon: "💰" },
  { href: "/analytics", label: "Analytics", icon: "📊" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  WORKER: "Worker",
  VIEWER: "Viewer",
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isOwnerOrManager } = useAuth();

  return (
    <aside className="w-64 flex flex-col h-screen sticky top-0" style={{ background: "#1B5E20" }}>
      <div className="p-6 border-b border-green-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌿</span>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">ASEDA Farm</h1>
            <p className="text-green-300 text-xs">{user?.farmName || "Farm Manager"}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-green-700 text-white" : "text-green-100 hover:bg-green-700 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {isOwnerOrManager && (
          <Link
            href="/members"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/members" ? "bg-green-700 text-white" : "text-green-100 hover:bg-green-700 hover:text-white"
            }`}
          >
            <span className="text-base">👥</span>
            Team Members
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-green-700">
        {user && (
          <div className="mb-3 px-3">
            <p className="text-white text-xs font-semibold truncate">{user.name}</p>
            <p className="text-green-300 text-xs">{ROLE_LABELS[user.role] ?? user.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full text-left text-xs text-green-300 hover:text-white flex items-center gap-2 py-2 px-3 rounded hover:bg-green-700 transition-colors"
        >
          <span>🚪</span> Sign out
        </button>
      </div>
    </aside>
  );
}
