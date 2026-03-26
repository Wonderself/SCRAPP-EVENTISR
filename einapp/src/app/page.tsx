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
          ? "bg-gradient-to-b from-[#6db8e0] via-[#8ecae6] to-[#f5efe6]"
          : "bg-gradient-to-b from-[#0d0a14] via-[#2d1540] to-[#6a1b4d]"
      }`}
    >
      {/* Sun / Moon */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 animate-float no-color-transition">
        {isDay ? (
          <div
            className="w-28 h-28 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-[#fff8c4] to-[#ffd54f] opacity-80"
            style={{ boxShadow: "0 0 60px rgba(255,213,79,0.4), 0 0 120px rgba(255,213,79,0.15)" }}
          />
        ) : (
          <div
            className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-[#ffecd2] to-[#fcb69f] opacity-50"
            style={{ boxShadow: "0 0 50px rgba(252,182,159,0.25)" }}
          />
        )}
      </div>

      {/* Waves */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 1440 200" className="w-full" preserveAspectRatio="none">
          <path
            fill={isDay ? "rgba(33,150,200,0.12)" : "rgba(230,81,0,0.1)"}
            d="M0,120L60,130C120,140,240,160,360,150C480,140,600,100,720,90C840,80,960,100,1080,115C1200,130,1320,140,1380,145L1440,150L1440,200L0,200Z"
          />
          <path
            fill={isDay ? "rgba(33,150,200,0.06)" : "rgba(194,24,91,0.06)"}
            d="M0,160L60,155C120,150,240,140,360,145C480,150,600,170,720,175C840,180,960,170,1080,160C1200,150,1320,140,1380,135L1440,130L1440,200L0,200Z"
          />
        </svg>
      </div>

      {/* Dolphin */}
      <div className={`mb-6 mt-20 animate-float no-color-transition ${mounted ? "animate-fade-up" : "opacity-0"}`}>
        <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
          <path
            d="M75 35c-5-15-20-20-35-15-10 3-18 12-20 22-1 5 0 10 3 14 4 5 10 8 17 8 3 0 6-1 9-2l12 8-3-10c8-6 13-15 12-20 0-2-1-3-2-5h7z"
            fill={isDay ? "#2196c8" : "#e65100"}
            opacity="0.85"
          />
          <circle cx="52" cy="38" r="2.5" fill="white" opacity="0.9" />
        </svg>
      </div>

      {/* Card */}
      <div
        className={`w-full max-w-md mx-6 rounded-3xl p-10 text-center shadow-2xl ${
          mounted ? "animate-fade-up" : "opacity-0"
        } ${
          isDay
            ? "bg-white/80 backdrop-blur-xl shadow-blue-200/30"
            : "bg-[#2a2035]/80 backdrop-blur-xl shadow-purple-900/30"
        }`}
        style={{ animationDelay: "0.15s" }}
      >
        <h1 className={`text-4xl lg:text-5xl font-extrabold tracking-tight mb-1 ${
          isDay ? "text-[#1a3a4a]" : "text-[#f5e6d8]"
        }`}>
          Einapp
        </h1>
        <p className={`text-sm lg:text-base font-light mb-10 ${
          isDay ? "text-[#4a7a8a]" : "text-[#c8a88a]"
        }`}>
          Dolphin Village
        </p>

        {mounted && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                inputMode="numeric"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="----"
                className={`w-full px-6 py-5 rounded-2xl text-center text-3xl font-light tracking-[0.5em] outline-none transition-all ${
                  isDay
                    ? "bg-[#f0f7fa] border-2 border-[#d8eef5] focus:border-[#2196c8] focus:ring-2 focus:ring-[#2196c8]/20 text-[#1a3a4a] placeholder-[#b0d0e0]"
                    : "bg-[#1a1520] border-2 border-[#3a2540] focus:border-[#e65100] focus:ring-2 focus:ring-[#e65100]/20 text-[#f5e6d8] placeholder-[#4a3050]"
                }`}
                autoFocus
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute left-5 top-1/2 -translate-y-1/2 text-xs font-medium ${
                  isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]"
                }`}
              >
                {showPassword ? "hide" : "show"}
              </button>
            </div>

            {error && (
              <p className="text-[#e53935] text-sm font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className={`w-full py-5 rounded-2xl text-white text-lg lg:text-xl font-bold transition-all disabled:opacity-40 ${
                isDay
                  ? "bg-gradient-to-l from-[#1a7fb5] to-[#47b8e0] hover:shadow-xl hover:shadow-[#2196c8]/30 active:scale-[0.98]"
                  : "bg-gradient-to-l from-[#c2185b] to-[#e65100] hover:shadow-xl hover:shadow-[#e65100]/30 active:scale-[0.98]"
              }`}
            >
              {loading ? "..." : "enter"}
            </button>
          </form>
        )}

        <p className={`mt-10 text-xs lg:text-sm font-light tracking-[0.25em] uppercase ${
          isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]"
        }`}>
          Sea Vibes Vacation
        </p>
      </div>
    </div>
  );
}
