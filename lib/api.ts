const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

if (typeof window !== "undefined") {
  console.log("API_URL configured as:", API_URL);
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("aseda_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${API_URL}${path}`;
  console.log(`Making ${options.method || "GET"} request to:`, url);
  console.log("Headers:", headers);
  if (options.body) console.log("Body:", options.body);

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
    console.log(`Response status: ${res.status}`);
  } catch (error) {
    console.error("Fetch error:", error);
    throw new Error("Cannot reach the server. Make sure the API is running.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    console.error("API error:", res.status, err);

    if (res.status === 401) {
      console.error("Backend rejected login. Response:", err);
      if (typeof window !== "undefined") {
        localStorage.removeItem("aseda_token");
        localStorage.removeItem("aseda_user");
      }
    }
    throw new Error(
      err.message || `API request failed with status ${res.status}`,
    );
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ access_token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    farmName?: string;
    farmLocation?: string;
    totalAcres?: number;
  }) =>
    request<{ access_token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getProfile: () => request<any>("/auth/profile"),

  // Members
  addMember: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: "MANAGER" | "WORKER" | "VIEWER";
  }) =>
    request<any>("/auth/members", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMembers: () => request<any[]>("/members"),
  updateMemberRole: (memberId: string, role: "MANAGER" | "WORKER" | "VIEWER") =>
    request<any>(`/members/${memberId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  removeMember: (memberId: string) =>
    request<any>(`/members/${memberId}`, { method: "DELETE" }),
  getMemberActivities: (userId?: string) => {
    const qs = userId ? `?userId=${userId}` : "";
    return request<any[]>(`/members/audit/activities${qs}`);
  },
  getMemberChanges: (userId?: string) => {
    const qs = userId ? `?userId=${userId}` : "";
    return request<any[]>(`/members/audit/changes${qs}`);
  },

  // Batches
  getBatches: () => request<any[]>("/batches"),
  getBatch: (id: string) => request<any>(`/batches/${id}`),
  createBatch: (data: any) =>
    request<any>("/batches", { method: "POST", body: JSON.stringify(data) }),
  updateBatch: (id: string, data: any) =>
    request<any>(`/batches/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteBatch: (id: string) =>
    request<any>(`/batches/${id}`, { method: "DELETE" }),
  getBatchHistory: (id: string) => request<any[]>(`/batches/${id}/history`),

  // Tasks
  getTasks: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any[]>(`/tasks${qs}`);
  },
  getTask: (id: string) => request<any>(`/tasks/${id}`),
  createTask: (data: any) =>
    request<any>("/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) =>
    request<any>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTask: (id: string) =>
    request<any>(`/tasks/${id}`, { method: "DELETE" }),
  completeTask: (id: string, data: any) =>
    request<any>(`/tasks/${id}/complete`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Activities
  getActivities: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any[]>(`/activities${qs}`);
  },
  getActivity: (id: string) => request<any>(`/activities/${id}`),
  createActivity: (data: any) =>
    request<any>("/activities", { method: "POST", body: JSON.stringify(data) }),
  updateActivity: (id: string, data: any) =>
    request<any>(`/activities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteActivity: (id: string) =>
    request<any>(`/activities/${id}`, { method: "DELETE" }),

  // Harvests
  getHarvests: () => request<any[]>("/harvests"),
  getHarvest: (id: string) => request<any>(`/harvests/${id}`),
  getSuckerHarvests: () => request<any[]>("/harvests?type=sucker"),
  getSuckerHarvest: (id: string) => request<any>(`/harvests/${id}?type=sucker`),
  createHarvest: (data: any) =>
    request<any>("/harvests", { method: "POST", body: JSON.stringify(data) }),
  createSuckerHarvest: (data: any) =>
    request<any>("/harvests", {
      method: "POST",
      body: JSON.stringify({ ...data, type: "sucker" }),
    }),
  updateHarvest: (id: string, data: any) =>
    request<any>(`/harvests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateSuckerHarvest: (id: string, data: any) =>
    request<any>(`/harvests/${id}?type=sucker`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteHarvest: (id: string) =>
    request<any>(`/harvests/${id}`, { method: "DELETE" }),
  deleteSuckerHarvest: (id: string) =>
    request<any>(`/harvests/${id}?type=sucker`, { method: "DELETE" }),

  // Expenses
  getExpenses: () => request<any[]>("/expenses"),
  getExpense: (id: string) => request<any>(`/expenses/${id}`),
  createExpense: (data: any) =>
    request<any>("/expenses", { method: "POST", body: JSON.stringify(data) }),
  updateExpense: (id: string, data: any) =>
    request<any>(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteExpense: (id: string) =>
    request<any>(`/expenses/${id}`, { method: "DELETE" }),

  // Analytics
  getAnalytics: () => request<any>("/analytics"),

  // Notifications
  getNotifications: (limit = 50) =>
    request<any[]>(`/notifications?limit=${limit}`),
  markRead: (id: string) =>
    request<any>(`/notifications/${id}/read`, { method: "POST" }),
  markAllRead: () => request<any>("/notifications/read-all", { method: "PUT" }),
  deleteNotification: (id: string) =>
    request<any>(`/notifications/${id}`, { method: "DELETE" }),
  deleteAllNotifications: () =>
    request<any>("/notifications/all", { method: "DELETE" }),

  // Settings
  getSettings: () => request<any>("/settings"),
  updateSettings: (data: any) =>
    request<any>("/settings", { method: "PUT", body: JSON.stringify(data) }),

  // Seed
  seed: () => request<any>("/seed", { method: "POST" }),
};
