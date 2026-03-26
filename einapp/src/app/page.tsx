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
          : "bg-gradient-to-b from-orange-500 via-pink-600 to-purple-800 animate-gradient"
      }`}
    >
      {/* Cartoon sun/moon */}
      <div className="absolute top-4 left-6 lg:top-8 lg:left-10 no-color-transition">
        {isDay ? (
          <div className="relative animate-float no-color-transition">
            <div
              className="w-16 h-16 lg:w-24 lg:h-24 rounded-full"
              style={{
                background: "radial-gradient(circle at 40% 40%, #fff7b0, #fbbf24, #f59e0b)",
                boxShadow: "0 0 30px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.2), inset -10px -10px 0 rgba(245,158,11,0.3)",
              }}
            />
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <div
                key={deg}
                className="absolute top-1/2 left-1/2 w-1.5 h-4 lg:w-2 lg:h-5 bg-yellow-300/50 rounded-full no-color-transition"
                style={{ transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-36px)` }}
              />
            ))}
          </div>
        ) : (
          <div className="relative animate-float no-color-transition">
            <div
              className="w-14 h-14 lg:w-20 lg:h-20 rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 35%, #fef9c3, #fde68a, #fbbf24)",
                boxShadow: "0 0 50px rgba(253,230,138,0.4), inset -8px -8px 0 rgba(251,191,36,0.2)",
              }}
            />
            <div
              className="absolute top-1 right-1 w-10 h-10 lg:w-14 lg:h-14 rounded-full no-color-transition"
              style={{ background: "radial-gradient(circle, rgba(168,85,247,0.6), transparent)" }}
            />
          </div>
        )}
      </div>

      {/* Sparkles */}
      <div className="absolute top-8 right-8 animate-sparkle no-color-transition">
        <svg width="14" height="14" viewBox="0 0 16 16"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="white" opacity="0.4"/></svg>
      </div>
      <div className="absolute top-20 right-24 animate-sparkle no-color-transition" style={{ animationDelay: "1.2s" }}>
        <svg width="10" height="10" viewBox="0 0 16 16"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill={isDay ? "white" : "#fbbf24"} opacity="0.3"/></svg>
      </div>

      {/* Cloud (day) / stars (sunset) */}
      {isDay ? (
        <div className="absolute top-6 right-4 animate-wave-bob no-color-transition">
          <svg width="56" height="28" viewBox="0 0 56 28"><ellipse cx="28" cy="18" rx="24" ry="9" fill="white" opacity="0.3"/><ellipse cx="20" cy="13" rx="12" ry="8" fill="white" opacity="0.3"/></svg>
        </div>
      ) : (
        <>
          <div className="absolute top-16 right-12 w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse-glow no-color-transition" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-24 left-16 w-1.5 h-1.5 rounded-full bg-white/20 no-color-transition" />
        </>
      )}

      {/* Waves */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 80" className="w-full h-10" preserveAspectRatio="none">
          <path fill={isDay ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)"} d="M0,40C240,60,480,13,720,40C960,67,1200,20,1440,40L1440,80L0,80Z" />
          <path fill={isDay ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)"} d="M0,53C360,33,720,67,1080,47C1300,37,1400,53,1440,50L1440,80L0,80Z" />
        </svg>
      </div>

      {/* Dolphin */}
      <div className={`mb-3 animate-wiggle no-color-transition ${mounted ? "" : "opacity-0"}`}>
        <svg width="50" height="50" viewBox="0 0 100 100" className="lg:w-16 lg:h-16">
          <path d="M75 35c-5-15-20-20-35-15-10 3-18 12-20 22-1 5 0 10 3 14 4 5 10 8 17 8 3 0 6-1 9-2l12 8-3-10c8-6 13-15 12-20 0-2-1-3-2-5h7z" fill="white" opacity="0.35" />
          <circle cx="52" cy="38" r="3" fill="white" opacity="0.5" />
        </svg>
      </div>

      {/* Card */}
      <div
        className={`w-full max-w-sm lg:max-w-md mx-6 rounded-[32px] p-6 lg:p-10 text-center ${
          mounted ? "animate-bounce-in" : "opacity-0"
        } ${
          isDay
            ? "bg-white border-4 border-sky-200 shadow-[0_8px_0_#bae6fd,0_12px_30px_rgba(14,116,144,0.1)]"
            : "bg-[#1e1330] border-4 border-orange-500/20 shadow-[0_8px_0_rgba(251,146,60,0.1),0_12px_30px_rgba(0,0,0,0.4)]"
        }`}
      >
        <h1 className={`text-4xl lg:text-6xl font-black tracking-tight mb-0.5 ${isDay ? "text-sky-700" : "text-white"}`}>
          Einapp
        </h1>
        <p className={`text-sm lg:text-lg font-bold mb-6 ${isDay ? "text-sky-400" : "text-orange-300/60"}`}>
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
                    ? "bg-sky-50 border-3 border-sky-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 text-sky-800 placeholder-sky-200"
                    : "bg-white/5 border-3 border-white/10 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 text-white placeholder-white/15"
                }`}
                autoFocus
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-xs lg:text-sm font-bold ${
                  isDay ? "text-sky-300" : "text-white/30"
                }`}
              >
                {showPassword ? "hide" : "show"}
              </button>
            </div>

            {error && <p className="text-red-400 text-sm font-bold">{error}</p>}

            <button
              type="submit"
              disabled={loading || !password}
              className={`cartoon-btn w-full py-4 lg:py-5 rounded-2xl text-white text-lg lg:text-2xl font-black transition-all disabled:opacity-30 ${
                isDay
                  ? "bg-gradient-to-r from-sky-500 to-cyan-400 shadow-[0_5px_0_#0891b2] hover:shadow-[0_5px_0_#0891b2,0_8px_20px_rgba(14,116,144,0.2)]"
                  : "bg-gradient-to-r from-orange-500 to-pink-500 shadow-[0_5px_0_#c2410c] hover:shadow-[0_5px_0_#c2410c,0_8px_20px_rgba(234,88,12,0.2)]"
              }`}
            >
              {loading ? "..." : "enter"}
            </button>
          </form>
        )}

        <p className={`mt-5 text-[10px] lg:text-xs font-bold tracking-[0.3em] uppercase ${
          isDay ? "text-sky-300" : "text-white/15"
        }`}>
          Sea Vibes Vacation
        </p>
      </div>
    </div>
  );
}
