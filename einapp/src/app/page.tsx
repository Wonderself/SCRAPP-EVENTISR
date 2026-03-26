"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function getTimeMode(): "day" | "sunset" {
  const now = new Date();
  const m = now.getHours() * 60 + now.getMinutes();
  return m >= 990 || m < 300 ? "sunset" : "day";
}

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"day" | "sunset">("day");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setMode(getTimeMode());
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) router.push("/dashboard");
      else setError("wrong code");
    } catch {
      setError("connection error");
    } finally {
      setLoading(false);
    }
  }

  const isDay = mode === "day";

  return (
    <div
      className={`h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden ${
        isDay
          ? "bg-gradient-to-b from-sky-400 via-cyan-300 to-teal-200"
          : "bg-gradient-to-b from-rose-500 via-fuchsia-600 to-violet-800"
      }`}
    >
      {/* Ambient glows */}
      <div className={`absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl ${
        isDay ? "bg-yellow-300/20" : "bg-orange-500/15"
      }`} />
      <div className={`absolute -bottom-20 -right-20 w-60 h-60 rounded-full blur-3xl ${
        isDay ? "bg-white/20" : "bg-fuchsia-500/15"
      }`} />

      {/* Card */}
      <div
        className={`w-full max-w-sm lg:max-w-md mx-6 rounded-[32px] p-6 lg:p-10 text-center ${
          mounted ? "" : "opacity-0"
        } ${
          isDay
            ? "bg-white/90 backdrop-blur-xl border border-sky-200/60 shadow-2xl shadow-sky-500/10"
            : "bg-[#1a0e2e]/90 backdrop-blur-xl border border-white/15 shadow-2xl shadow-fuchsia-500/10"
        }`}
      >
        <h1 className={`text-4xl lg:text-6xl font-black tracking-tight mb-0.5 ${isDay ? "text-sky-700" : "text-white"}`}>
          Einapp
        </h1>
        <p className={`text-sm lg:text-lg font-bold mb-6 ${isDay ? "text-sky-400" : "text-fuchsia-300/80"}`}>
          Dolphin Village
        </p>

        {mounted && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                inputMode="numeric"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="----"
                className={`w-full px-6 py-4 lg:py-5 rounded-2xl text-center text-2xl lg:text-3xl font-bold tracking-[0.5em] outline-none transition-all ${
                  isDay
                    ? "bg-sky-50/80 border border-sky-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 text-sky-800 placeholder-sky-200"
                    : "bg-white/10 border border-white/15 focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-400/10 text-white placeholder-white/30"
                }`}
                autoFocus
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-xs lg:text-sm font-bold ${
                  isDay ? "text-sky-300" : "text-white/50"
                }`}
              >
                {showPassword ? "hide" : "show"}
              </button>
            </div>

            {error && <p className="text-red-400 text-sm font-bold">{error}</p>}

            <button
              type="submit"
              disabled={loading || !password}
              className={`w-full py-4 lg:py-5 rounded-2xl text-white text-lg lg:text-2xl font-black transition-all disabled:opacity-30 ${
                isDay
                  ? "bg-gradient-to-r from-sky-400 to-cyan-500 shadow-lg shadow-sky-400/25"
                  : "bg-gradient-to-r from-fuchsia-500 to-violet-600 shadow-lg shadow-fuchsia-500/25"
              }`}
            >
              {loading ? "..." : "enter"}
            </button>
          </form>
        )}

        <p className={`mt-5 text-[10px] lg:text-xs font-bold tracking-[0.3em] uppercase ${
          isDay ? "text-sky-300" : "text-white/40"
        }`}>
          Sea Vibes Vacation
        </p>
      </div>
    </div>
  );
}
