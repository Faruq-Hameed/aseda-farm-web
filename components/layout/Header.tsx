"use client";
import { useAuth } from "@/context/auth-context";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function Header({ title }: { title?: string }) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        {title && <h1 className="text-xl font-semibold text-gray-900">{title}</h1>}
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ background: "#1B5E20" }}>
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <span className="text-sm text-gray-700 hidden sm:block">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
