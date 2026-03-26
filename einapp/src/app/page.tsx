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
      className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden ${
        isDay
          ? "bg-gradient-to-b from-[#0e7490] via-[#0891b2] to-[#67e8f9]"
          : "bg-gradient-to-b from-[#7c2d12] via-[#be185d] to-[#581c87] animate-gradient"
      }`}
    >
      {/* Sun / Moon */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 no-color-transition">
        {isDay ? (
          <div
            className="w-28 h-28 rounded-full animate-pulse-glow no-color-transition"
            style={{
              background: "radial-gradient(circle, #fef3c7, #fbbf24, #f59e0b)",
              boxShadow: "0 0 60px rgba(251,191,36,0.5), 0 0 120px rgba(251,191,36,0.2)",
            }}
          />
        ) : (
          <div
            className="w-24 h-24 rounded-full animate-pulse-glow no-color-transition"
            style={{
              background: "radial-gradient(circle at 35% 35%, #fef3c7, #fde68a, #fbbf24)",
              boxShadow: "0 0 50px rgba(253,230,138,0.3), 0 0 100px rgba(253,230,138,0.15)",
            }}
          />
        )}
      </div>

      {/* Stars (sunset only) */}
      {!isDay && (
        <>
          <div className="absolute top-20 left-12 w-1 h-1 rounded-full bg-white/30" />
          <div className="absolute top-32 right-16 w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="absolute top-16 right-32 w-1 h-1 rounded-full bg-white/25" />
          <div className="absolute bottom-40 left-20 w-1 h-1 rounded-full bg-white/15" />
        </>
      )}

      {/* Waves */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 1440 200" className="w-full" preserveAspectRatio="none">
          <path
            fill={isDay ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)"}
            d="M0,120L60,130C120,140,240,160,360,150C480,140,600,100,720,90C840,80,960,100,1080,115C1200,130,1320,140,1380,145L1440,150L1440,200L0,200Z"
          />
          <path
            fill={isDay ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)"}
            d="M0,160L60,155C120,150,240,140,360,145C480,150,600,170,720,175C840,180,960,170,1080,160C1200,150,1320,140,1380,135L1440,130L1440,200L0,200Z"
          />
        </svg>
      </div>

      {/* Dolphin */}
      <div className={`mb-6 mt-28 animate-float no-color-transition ${mounted ? "animate-fade-up" : "opacity-0"}`}>
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
          <path
            d="M75 35c-5-15-20-20-35-15-10 3-18 12-20 22-1 5 0 10 3 14 4 5 10 8 17 8 3 0 6-1 9-2l12 8-3-10c8-6 13-15 12-20 0-2-1-3-2-5h7z"
            fill="white"
            opacity="0.25"
          />
          <circle cx="52" cy="38" r="2.5" fill="white" opacity="0.4" />
        </svg>
      </div>

      {/* Card */}
      <div
        className={`w-full max-w-sm mx-6 rounded-3xl p-8 text-center shadow-2xl ${
          mounted ? "animate-fade-up" : "opacity-0"
        } ${
          isDay
            ? "bg-white/80 backdrop-blur-xl shadow-cyan-900/20"
            : "bg-black/20 backdrop-blur-xl shadow-black/30 border border-white/10"
        }`}
        style={{ animationDelay: "0.15s" }}
      >
        <h1
          className={`text-4xl font-extrabold tracking-tight mb-1 ${
            isDay ? "text-cyan-900" : "text-white"
          }`}
        >
          Einapp
        </h1>
        <p
          className={`text-sm font-light mb-8 ${
            isDay ? "text-cyan-600" : "text-white/50"
          }`}
        >
          Dolphin Village
        </p>

        {mounted && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                inputMode="numeric"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="----"
                className={`w-full px-6 py-5 rounded-2xl text-center text-3xl font-light tracking-[0.5em] outline-none transition-all ${
                  isDay
                    ? "bg-cyan-50 border-2 border-cyan-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 text-cyan-900 placeholder-cyan-200"
                    : "bg-white/5 border-2 border-white/10 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-white placeholder-white/15"
                }`}
                autoFocus
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium ${
                  isDay ? "text-cyan-300" : "text-white/30"
                }`}
              >
                {showPassword ? "hide" : "show"}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className={`w-full py-5 rounded-2xl text-white text-lg font-bold transition-all disabled:opacity-30 ${
                isDay
                  ? "bg-gradient-to-r from-cyan-500 to-teal-400 hover:shadow-xl hover:shadow-cyan-300/30 active:scale-[0.98]"
                  : "bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98]"
              }`}
            >
              {loading ? "..." : "enter"}
            </button>
          </form>
        )}

        <p
          className={`mt-8 text-[10px] font-light tracking-[0.3em] uppercase ${
            isDay ? "text-cyan-300" : "text-white/20"
          }`}
        >
          Sea Vibes Vacation
        </p>
      </div>
    </div>
  );
}
