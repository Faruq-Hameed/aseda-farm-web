import { formatDate } from "@/lib/utils";

interface Activity {
  id: string;
  title: string;
  type: string;
  date: Date;
  batch: { name: string } | null;
  user: { id: string; name: string };
}

const TYPE_ICONS: Record<string, string> = {
  fertilizer_applied: "🌿", herbicide_applied: "🟣", weeding_done: "🔵",
  suckers_harvested: "🌱", bunch_harvested: "🌾", propping_done: "🪵",
  gouging_done: "⛏️", inspection: "🔍", pest_treatment: "🐛", irrigation: "💧",
  fertilizer: "🌿", herbicide: "🟣", sucker_harvest: "🌱", bunch_harvest: "🌾",
  propping: "🪵", gouging: "⛏️", pest_control: "🐛", other: "📋",
};

function Avatar({ name }: { name: string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold flex-shrink-0"
      style={{ background: "#1B5E20" }}
      title={name}
    >
      {name[0]?.toUpperCase() ?? "?"}
    </span>
  );
}

export function RecentActivities({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center text-gray-400">
        <p className="text-2xl mb-2">📋</p>
        <p className="text-sm">No activities logged yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {activities.map((activity, i) => (
        <div key={activity.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-gray-50" : ""}`}>
          <span className="text-lg flex-shrink-0">{TYPE_ICONS[activity.type] || "📋"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
            <p className="text-xs text-gray-400">{activity.batch?.name || "Farm-wide"}</p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <p className="text-xs text-gray-400">{formatDate(activity.date)}</p>
            {activity.user && (
              <div className="flex items-center gap-1">
                <Avatar name={activity.user.name} />
                <span className="text-xs text-gray-400">{activity.user.name}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
