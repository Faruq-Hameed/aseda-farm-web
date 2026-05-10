"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const CHANNEL_LABELS: Record<string, string> = {
  farm_gate: "Farm Gate",
  olomi_market: "Olomi Market",
  bodija_market: "Bodija Market",
  restaurant: "Restaurant/Buka",
  lagos_buyer: "Lagos Buyer",
  other: "Other",
};

const PIE_COLORS = ["#1B5E20", "#2E7D32", "#4CAF50", "#81C784", "#C8E6C9", "#A5D6A7"];

interface Props {
  revenueData: { month: string; revenue: number }[];
  channelData: { name: string; value: number }[];
  expenseData: { name: string; value: number }[];
  taskStatus: { completed: number; overdue: number; pending: number; in_progress: number };
  totalRevenue: number;
  totalExpenses: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium text-gray-900">{label}</p>
        <p style={{ color: payload[0].color }}>N{payload[0].value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export function AnalyticsCharts({ revenueData, channelData, expenseData, taskStatus }: Props) {
  const taskData = [
    { name: "Completed", value: taskStatus.completed, color: "#2E7D32" },
    { name: "In Progress", value: taskStatus.in_progress, color: "#1565C0" },
    { name: "Pending", value: taskStatus.pending, color: "#F9A825" },
    { name: "Overdue", value: taskStatus.overdue, color: "#B71C1C" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Revenue chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Monthly Revenue (N)</h3>
        {revenueData.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No revenue data yet — first harvest expected April 2027</div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `N${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#1B5E20" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales channel */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue by Sales Channel</h3>
          {channelData.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No sales recorded yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={channelData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, percent }: any) => `${CHANNEL_LABELS[name as string] || name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {channelData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: any) => [`N${value.toLocaleString()}`, "Revenue"]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Expense breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
          {expenseData.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No expenses recorded yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={expenseData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                  {expenseData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: any, name: any) => [`N${value.toLocaleString()}`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Task completion donut */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Task Completion Status</h3>
        <div className="flex items-center gap-8">
          {taskData.length > 0 ? (
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={taskData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {taskData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-400 text-sm py-4">No tasks yet</div>
          )}
          <div className="space-y-2">
            {[
              { label: "Completed", value: taskStatus.completed, color: "#2E7D32" },
              { label: "In Progress", value: taskStatus.in_progress, color: "#1565C0" },
              { label: "Pending", value: taskStatus.pending, color: "#F9A825" },
              { label: "Overdue", value: taskStatus.overdue, color: "#B71C1C" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                <span className="text-gray-700">{s.label}</span>
                <span className="font-bold text-gray-900 ml-auto">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
