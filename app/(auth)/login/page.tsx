"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Invalid email or password";
      console.error("Login failed:", errorMessage, err);
      setError(errorMessage);
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#FAFAF5" }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: "#1B5E20" }}
          >
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "#1B5E20" }}>
            ASEDA Farm
          </h1>
          <p className="text-gray-500 mt-1">Farm Management System</p>
          <p className="text-xs text-gray-400 mt-1">
            Adesiyan Village, Olojuoro Road, Ibadan
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Sign in to your account
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@asedafarm.ng"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
                style={{ "--tw-ring-color": "#1B5E20" } as any}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg text-white font-medium text-sm transition-opacity disabled:opacity-60"
              style={{ background: "#1B5E20" }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div
            className="mt-6 p-4 rounded-lg"
            style={{ background: "#E8F5E9" }}
          >
            <p className="text-xs font-medium text-green-800 mb-1">
              Default credentials:
            </p>
            <p className="text-xs text-green-700">Email: admin@asedafarm.ng</p>
            <p className="text-xs text-green-700">Password: aseda2026</p>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            New to ASEDA Farm?{" "}
            <Link
              href="/register"
              className="font-medium"
              style={{ color: "#1B5E20" }}
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
