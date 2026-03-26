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
          ? "bg-gradient-to-b from-sky-400 via-cyan-300 to-teal-200"
          : "bg-gradient-to-b from-orange-500 via-pink-600 to-purple-800 animate-gradient"
      }`}
    >
      {/* Cartoon sun/moon */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 no-color-transition">
        {isDay ? (
          <div className="relative animate-float no-color-transition">
            <div
              className="w-32 h-32 lg:w-40 lg:h-40 rounded-full"
              style={{
                background: "radial-gradient(circle at 40% 40%, #fff7b0, #fbbf24, #f59e0b)",
                boxShadow: "0 0 50px rgba(251,191,36,0.5), 0 0 100px rgba(251,191,36,0.2), inset -10px -10px 0 rgba(245,158,11,0.3)",
              }}
            />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <div
                key={deg}
                className="absolute top-1/2 left-1/2 w-2.5 h-7 bg-yellow-300/50 rounded-full no-color-transition"
                style={{ transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-60px)` }}
              />
            ))}
          </div>
        ) : (
          <div className="relative animate-float no-color-transition">
            <div
              className="w-28 h-28 lg:w-36 lg:h-36 rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 35%, #fef9c3, #fde68a, #fbbf24)",
                boxShadow: "0 0 50px rgba(253,230,138,0.4), inset -8px -8px 0 rgba(251,191,36,0.2)",
              }}
            />
            <div
              className="absolute top-1 right-1 w-20 h-20 lg:w-24 lg:h-24 rounded-full no-color-transition"
              style={{ background: "radial-gradient(circle, rgba(168,85,247,0.6), transparent)" }}
            />
          </div>
        )}
      </div>

      {/* Clouds / stars */}
      {isDay ? (
        <>
          <div className="absolute top-24 left-6 animate-wave-bob no-color-transition">
            <svg width="70" height="35" viewBox="0 0 70 35"><ellipse cx="35" cy="22" rx="30" ry="12" fill="white" opacity="0.4"/><ellipse cx="24" cy="16" rx="16" ry="10" fill="white" opacity="0.4"/></svg>
          </div>
          <div className="absolute top-16 right-8 animate-wave-bob no-color-transition" style={{ animationDelay: "1.5s" }}>
            <svg width="50" height="25" viewBox="0 0 50 25"><ellipse cx="25" cy="16" rx="22" ry="9" fill="white" opacity="0.3"/><ellipse cx="18" cy="12" rx="12" ry="7" fill="white" opacity="0.3"/></svg>
          </div>
        </>
      ) : (
        <>
          <div className="absolute top-20 left-12 w-2 h-2 rounded-full bg-white/40 animate-pulse-glow no-color-transition" />
          <div className="absolute top-32 right-16 w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse-glow no-color-transition" style={{ animationDelay: "1s" }} />
          <div className="absolute top-14 right-36 w-2 h-2 rounded-full bg-yellow-200/25 animate-pulse-glow no-color-transition" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-32 left-20 w-1.5 h-1.5 rounded-full bg-white/20 no-color-transition" />
        </>
      )}

      {/* Waves */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 120" className="w-full h-16" preserveAspectRatio="none">
          <path fill={isDay ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)"} d="M0,60C240,90,480,20,720,60C960,100,1200,30,1440,60L1440,120L0,120Z" />
          <path fill={isDay ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)"} d="M0,80C360,50,720,100,1080,70C1300,55,1400,80,1440,75L1440,120L0,120Z" />
        </svg>
      </div>

      {/* Dolphin */}
      <div className={`mb-4 mt-32 lg:mt-40 animate-wiggle no-color-transition ${mounted ? "" : "opacity-0"}`}>
        <svg width="70" height="70" viewBox="0 0 100 100" className="lg:w-24 lg:h-24">
          <path d="M75 35c-5-15-20-20-35-15-10 3-18 12-20 22-1 5 0 10 3 14 4 5 10 8 17 8 3 0 6-1 9-2l12 8-3-10c8-6 13-15 12-20 0-2-1-3-2-5h7z" fill="white" opacity="0.35" />
          <circle cx="52" cy="38" r="3" fill="white" opacity="0.5" />
        </svg>
      </div>

      {/* Card */}
      <div
        className={`w-full max-w-sm lg:max-w-md mx-6 rounded-[32px] p-8 lg:p-12 text-center ${
          mounted ? "animate-bounce-in" : "opacity-0"
        } ${
          isDay
            ? "bg-white border-4 border-sky-200 shadow-[0_8px_0_#bae6fd,0_12px_30px_rgba(14,116,144,0.1)]"
            : "bg-[#1e1330] border-4 border-orange-500/20 shadow-[0_8px_0_rgba(251,146,60,0.1),0_12px_30px_rgba(0,0,0,0.4)]"
        }`}
      >
        <h1 className={`text-5xl lg:text-7xl font-black tracking-tight mb-1 ${isDay ? "text-sky-700" : "text-white"}`}>
          Einapp
        </h1>
        <p className={`text-base lg:text-xl font-bold mb-8 ${isDay ? "text-sky-400" : "text-orange-300/60"}`}>
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
                className={`w-full px-6 py-5 lg:py-6 rounded-2xl text-center text-3xl lg:text-4xl font-bold tracking-[0.5em] outline-none transition-all ${
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
              className={`cartoon-btn w-full py-5 lg:py-6 rounded-2xl text-white text-xl lg:text-2xl font-black transition-all disabled:opacity-30 ${
                isDay
                  ? "bg-gradient-to-r from-sky-500 to-cyan-400 shadow-[0_5px_0_#0891b2] hover:shadow-[0_5px_0_#0891b2,0_8px_20px_rgba(14,116,144,0.2)]"
                  : "bg-gradient-to-r from-orange-500 to-pink-500 shadow-[0_5px_0_#c2410c] hover:shadow-[0_5px_0_#c2410c,0_8px_20px_rgba(234,88,12,0.2)]"
              }`}
            >
              {loading ? "..." : "enter"}
            </button>
          </form>
        )}

        <p className={`mt-8 text-[10px] lg:text-xs font-bold tracking-[0.3em] uppercase ${
          isDay ? "text-sky-300" : "text-white/15"
        }`}>
          Sea Vibes Vacation
        </p>
      </div>
    </div>
  );
}
