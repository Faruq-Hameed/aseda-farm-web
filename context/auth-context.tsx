"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";

export type MemberRole = "OWNER" | "MANAGER" | "WORKER" | "VIEWER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: MemberRole;
  farmId: string | null;
  farmName?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    farmName?: string;
    farmLocation?: string;
    totalAcres?: number;
  }) => Promise<void>;
  logout: () => void;
  isOwnerOrManager: boolean;
  isViewer: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isOwnerOrManager: false,
  isViewer: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("aseda_token");
    const storedUser = localStorage.getItem("aseda_user");
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("aseda_token");
        localStorage.removeItem("aseda_user");
      }
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const data = await api.login(email, password);
    localStorage.setItem("aseda_token", data.access_token);
    localStorage.setItem("aseda_user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  }

  async function register(registerData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    farmName?: string;
    farmLocation?: string;
    totalAcres?: number;
  }) {
    const data = await api.register(registerData);
    localStorage.setItem("aseda_token", data.access_token);
    localStorage.setItem("aseda_user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("aseda_token");
    localStorage.removeItem("aseda_user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  }

  const isOwnerOrManager = user?.role === "OWNER" || user?.role === "MANAGER";
  const isViewer = user?.role === "VIEWER";

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isOwnerOrManager, isViewer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
