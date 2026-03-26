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

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError("wrong code");
      }
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
          ? "bg-gradient-to-b from-[#87CEEB] via-[#a8dce8] to-[#f5efe6]"
          : "bg-gradient-to-b from-[#1a1025] via-[#2d1540] to-[#4a1a3a]"
      }`}
    >
      {/* Decorative waves */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 1440 320" className="w-full" preserveAspectRatio="none">
          <path
            fill={isDay ? "rgba(33,150,200,0.15)" : "rgba(230,81,0,0.12)"}
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,176C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L0,320Z"
          />
          <path
            fill={isDay ? "rgba(33,150,200,0.08)" : "rgba(194,24,91,0.08)"}
            d="M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,181L1440,320L0,320Z"
          />
        </svg>
      </div>

      {/* Dolphin silhouette */}
      <div className={`mb-8 animate-float no-color-transition ${mounted ? "animate-fade-up" : "opacity-0"}`}>
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
          <path
            d="M75 35c-5-15-20-20-35-15-10 3-18 12-20 22-1 5 0 10 3 14 4 5 10 8 17 8 3 0 6-1 9-2l12 8-3-10c8-6 13-15 12-20 0-2-1-3-2-5h7z"
            fill={isDay ? "#2196c8" : "#e65100"}
            opacity="0.9"
          />
          <circle cx="52" cy="38" r="2.5" fill="white" opacity="0.9" />
        </svg>
      </div>

      {/* Card */}
      <div
        className={`w-full max-w-sm mx-4 rounded-3xl p-8 text-center shadow-2xl ${
          mounted ? "animate-fade-up" : "opacity-0"
        } ${
          isDay
            ? "bg-white/85 backdrop-blur-md shadow-blue-200/40"
            : "bg-[#2a2035]/85 backdrop-blur-md shadow-purple-900/40"
        }`}
        style={{ animationDelay: "0.15s" }}
      >
        <h1
          className={`text-3xl font-extrabold tracking-tight mb-1 ${
            isDay ? "text-[#1a3a4a]" : "text-[#f5e6d8]"
          }`}
        >
          Einapp
        </h1>
        <p
          className={`text-sm font-light mb-8 ${
            isDay ? "text-[#4a7a8a]" : "text-[#c8a88a]"
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
                className={`w-full px-5 py-4 rounded-2xl text-center text-2xl font-light tracking-[0.5em] outline-none transition-all ${
                  isDay
                    ? "bg-[#f0f7fa] border border-[#d8eef5] focus:border-[#2196c8] focus:ring-2 focus:ring-[#2196c8]/20 text-[#1a3a4a] placeholder-[#b0d0e0]"
                    : "bg-[#1a1520] border border-[#3a2540] focus:border-[#e65100] focus:ring-2 focus:ring-[#e65100]/20 text-[#f5e6d8] placeholder-[#4a3050]"
                }`}
                autoFocus
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium ${
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
              className={`w-full py-4 rounded-2xl text-white text-lg font-semibold transition-all disabled:opacity-40 ${
                isDay
                  ? "bg-gradient-to-l from-[#1a7fb5] to-[#47b8e0] hover:shadow-lg hover:shadow-[#2196c8]/30"
                  : "bg-gradient-to-l from-[#c2185b] to-[#e65100] hover:shadow-lg hover:shadow-[#e65100]/30"
              }`}
            >
              {loading ? "..." : "enter"}
            </button>
          </form>
        )}

        <p
          className={`mt-8 text-xs font-light tracking-widest uppercase ${
            isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]"
          }`}
        >
          Good Vibes Only
        </p>
      </div>
    </div>
  );
}
