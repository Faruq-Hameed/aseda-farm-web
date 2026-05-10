import Link from "next/link";
import { CATEGORY_COLORS, CATEGORY_LABELS, formatDate } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  category: string;
  dueDate: Date;
  priority: string;
  batch: { id: string; name: string } | null;
}

export function UpcomingTasks({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center text-gray-400">
        <p className="text-2xl mb-2">✅</p>
        <p className="text-sm">No tasks due this week</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {tasks.slice(0, 8).map((task, i) => {
        const color = CATEGORY_COLORS[task.category] || "#9E9E9E";
        const daysUntil = Math.ceil(
          (new Date(task.dueDate).getTime() - Date.now()) / 86400000
        );
        return (
          <Link
            key={task.id}
            href={`/tasks`}
            className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${i > 0 ? "border-t border-gray-50" : ""}`}
          >
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
              <p className="text-xs text-gray-400">
                {task.batch?.name || "Farm-wide"} • {CATEGORY_LABELS[task.category] || task.category}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-xs font-medium ${daysUntil === 0 ? "text-red-600" : daysUntil <= 2 ? "text-orange-500" : "text-gray-500"}`}>
                {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
