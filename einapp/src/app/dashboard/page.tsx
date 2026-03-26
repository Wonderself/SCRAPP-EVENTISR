"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageCircle } from "lucide-react";
import WeekView from "@/components/WeekView";
import AddTaskModal from "@/components/AddTaskModal";
import BottomTabs from "@/components/BottomTabs";
import WeatherWidget from "@/components/WeatherWidget";
import { formatHebrewDate } from "@/lib/hebrew";

function getTimeMode(): "day" | "sunset" {
  const now = new Date();
  const m = now.getHours() * 60 + now.getMinutes();
  return m >= 990 || m < 300 ? "sunset" : "day";
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "בוקר טוב, עינת";
  if (h < 17) return "צהריים טובים, עינת";
  return "ערב טוב, עינת";
}

export default function DashboardPage() {
  const [showAddTask, setShowAddTask] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mode, setMode] = useState<"day" | "sunset">("day");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const today = new Date();

  useEffect(() => {
    setMounted(true);
    setMode(getTimeMode());
    const interval = setInterval(() => setMode(getTimeMode()), 60000);
    return () => clearInterval(interval);
  }, []);

  const isDay = mode === "day";

  if (!mounted) return <div className="min-h-screen bg-sky-100" />;

  return (
    <div className={`min-h-screen pb-28 ${isDay ? "bg-sky-100" : "bg-[#0d0820]"}`}>

      {/* ===== HERO ===== */}
      <div
        className={`relative overflow-hidden ${
          isDay
            ? "bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-300"
            : "bg-gradient-to-br from-orange-500 via-pink-500 to-purple-700 animate-gradient"
        }`}
      >
        {/* BIG cartoon sun / moon */}
        <div className="absolute top-4 left-4 lg:top-6 lg:left-8 no-color-transition">
          {isDay ? (
            <div className="relative animate-float no-color-transition">
              <div
                className="w-24 h-24 lg:w-32 lg:h-32 rounded-full"
                style={{
                  background: "radial-gradient(circle at 40% 40%, #fff7b0, #fbbf24, #f59e0b)",
                  boxShadow: "0 0 40px rgba(251,191,36,0.6), 0 0 80px rgba(251,191,36,0.3), inset -8px -8px 0 rgba(245,158,11,0.3)",
                }}
              />
              {/* Cartoon sun rays */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <div
                  key={deg}
                  className="absolute top-1/2 left-1/2 w-2 lg:w-3 h-6 lg:h-8 bg-yellow-300/50 rounded-full no-color-transition"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-52px)`,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="relative animate-float no-color-transition">
              <div
                className="w-20 h-20 lg:w-28 lg:h-28 rounded-full"
                style={{
                  background: "radial-gradient(circle at 35% 35%, #fef9c3, #fde68a, #fbbf24)",
                  boxShadow: "0 0 40px rgba(253,230,138,0.4), 0 0 80px rgba(253,230,138,0.15), inset -6px -6px 0 rgba(251,191,36,0.2)",
                }}
              />
              {/* Crescent shadow */}
              <div
                className="absolute top-1 right-1 w-14 h-14 lg:w-20 lg:h-20 rounded-full no-color-transition"
                style={{ background: "radial-gradient(circle, rgba(168,85,247,0.7), transparent)" }}
              />
            </div>
          )}
        </div>

        {/* Cartoon clouds + sparkles (day) / stars + sparkles (night) */}
        {isDay ? (
          <>
            <div className="absolute top-8 right-6 no-color-transition animate-wave-bob" style={{ animationDelay: "0s" }}>
              <svg width="80" height="40" viewBox="0 0 80 40"><ellipse cx="40" cy="25" rx="35" ry="14" fill="white" opacity="0.35"/><ellipse cx="28" cy="18" rx="18" ry="12" fill="white" opacity="0.35"/><ellipse cx="52" cy="20" rx="15" ry="10" fill="white" opacity="0.35"/></svg>
            </div>
            <div className="absolute top-20 right-28 lg:right-48 no-color-transition animate-wave-bob" style={{ animationDelay: "1s" }}>
              <svg width="60" height="30" viewBox="0 0 60 30"><ellipse cx="30" cy="18" rx="28" ry="11" fill="white" opacity="0.25"/><ellipse cx="20" cy="13" rx="14" ry="9" fill="white" opacity="0.25"/></svg>
            </div>
            {/* Sparkles */}
            <div className="absolute top-16 right-16 animate-sparkle no-color-transition" style={{ animationDelay: "0s" }}>
              <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="white" opacity="0.5"/></svg>
            </div>
            <div className="absolute top-32 right-40 animate-sparkle no-color-transition" style={{ animationDelay: "1.5s" }}>
              <svg width="12" height="12" viewBox="0 0 16 16"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="white" opacity="0.4"/></svg>
            </div>
            <div className="absolute top-12 left-[55%] animate-sparkle no-color-transition" style={{ animationDelay: "0.8s" }}>
              <svg width="10" height="10" viewBox="0 0 16 16"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="white" opacity="0.35"/></svg>
            </div>
          </>
        ) : (
          <>
            <div className="absolute top-6 right-8 w-2 h-2 rounded-full bg-white/50 animate-pulse-glow no-color-transition" />
            <div className="absolute top-14 right-20 w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse-glow no-color-transition" style={{ animationDelay: "1s" }} />
            <div className="absolute top-10 right-36 w-2.5 h-2.5 rounded-full bg-yellow-200/30 animate-pulse-glow no-color-transition" style={{ animationDelay: "0.5s" }} />
            <div className="absolute top-24 right-12 w-1 h-1 rounded-full bg-white/30 no-color-transition" />
            <div className="absolute top-4 right-52 w-1.5 h-1.5 rounded-full bg-white/25 animate-pulse-glow no-color-transition" style={{ animationDelay: "2s" }} />
            {/* Sparkles sunset */}
            <div className="absolute top-20 right-24 animate-sparkle no-color-transition" style={{ animationDelay: "0.3s" }}>
              <svg width="14" height="14" viewBox="0 0 16 16"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="#fbbf24" opacity="0.4"/></svg>
            </div>
            <div className="absolute top-8 right-44 animate-sparkle no-color-transition" style={{ animationDelay: "1.8s" }}>
              <svg width="10" height="10" viewBox="0 0 16 16"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="#fbbf24" opacity="0.3"/></svg>
            </div>
            <div className="absolute top-28 left-[40%] animate-sparkle no-color-transition" style={{ animationDelay: "1s" }}>
              <svg width="12" height="12" viewBox="0 0 16 16"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="white" opacity="0.25"/></svg>
            </div>
          </>
        )}

        {/* Greeting content */}
        <div className="relative z-10 px-6 pt-20 pb-24 lg:pt-24 lg:pb-28">
          <p className="text-white/60 text-xs lg:text-sm font-medium tracking-wider mb-2 animate-fade-up no-color-transition">
            {formatHebrewDate(today)}
          </p>
          <h1 className="text-white text-4xl lg:text-7xl font-black leading-tight animate-bounce-in no-color-transition">
            {getGreeting()}
          </h1>
          <p className="text-white/40 text-xs lg:text-base mt-3 tracking-[0.25em] uppercase font-bold">
            Sea Vibes Vacation
          </p>
        </div>

        {/* Cartoon wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-12 lg:h-16 block">
            <path
              fill={isDay ? "#e0f2fe" : "#0d0820"}
              d="M0,50 C180,90 360,20 540,50 C720,80 900,30 1080,55 C1260,80 1380,35 1440,50 L1440,100 L0,100 Z"
            />
          </svg>
        </div>

        {/* Cartoon dolphin */}
        <div className="absolute bottom-6 right-6 lg:bottom-10 lg:right-12 animate-wiggle no-color-transition">
          <svg width="48" height="48" viewBox="0 0 100 100" className="lg:w-16 lg:h-16">
            <path
              d="M75 35c-5-15-20-20-35-15-10 3-18 12-20 22-1 5 0 10 3 14 4 5 10 8 17 8 3 0 6-1 9-2l12 8-3-10c8-6 13-15 12-20 0-2-1-3-2-5h7z"
              fill="white" opacity="0.4"
            />
            <circle cx="52" cy="38" r="3" fill="white" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="px-5 lg:px-12 max-w-4xl mx-auto -mt-8 space-y-5 lg:space-y-8 relative z-10">

        {/* Weather */}
        <div className="animate-fade-up no-color-transition" style={{ animationDelay: "0.1s" }}>
          <WeatherWidget isDay={isDay} />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4 lg:gap-6">
          <button
            onClick={() => router.push("/chat")}
            className={`cartoon-btn rounded-3xl p-6 lg:p-10 flex flex-col items-center gap-3 lg:gap-5 animate-slide-right no-color-transition ${
              isDay
                ? "cartoon-card-day hover:translate-y-[-4px]"
                : "cartoon-card-sunset hover:translate-y-[-4px]"
            }`}
            style={{ animationDelay: "0.15s" }}
          >
            <div className="relative">
              <div
                className={`w-16 h-16 lg:w-24 lg:h-24 rounded-2xl lg:rounded-3xl flex items-center justify-center animate-heartbeat no-color-transition ${
                  isDay
                    ? "bg-gradient-to-br from-cyan-400 to-sky-500"
                    : "bg-gradient-to-br from-orange-400 to-pink-500"
                }`}
                style={{ boxShadow: isDay ? "0 4px 0 #0891b2" : "0 4px 0 #c2410c" }}
              >
                <MessageCircle size={28} className="text-white lg:hidden" strokeWidth={2.5} />
                <MessageCircle size={40} className="text-white hidden lg:block" strokeWidth={2.5} />
              </div>
              {/* Sparkle on icon */}
              <div className="absolute -top-1 -right-1 animate-sparkle no-color-transition" style={{ animationDelay: "0.5s" }}>
                <svg width="14" height="14" viewBox="0 0 16 16"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill={isDay ? "#0ea5e9" : "#fb923c"} opacity="0.6"/></svg>
              </div>
            </div>
            <span className={`text-base lg:text-2xl font-black ${isDay ? "text-sky-700" : "text-orange-200"}`}>
              דברי עם Einapp
            </span>
          </button>

          <button
            onClick={() => setShowAddTask(true)}
            className={`cartoon-btn rounded-3xl p-6 lg:p-10 flex flex-col items-center gap-3 lg:gap-5 animate-slide-left no-color-transition ${
              isDay
                ? "cartoon-card-day hover:translate-y-[-4px]"
                : "cartoon-card-sunset hover:translate-y-[-4px]"
            }`}
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative">
              <div
                className={`w-16 h-16 lg:w-24 lg:h-24 rounded-2xl lg:rounded-3xl flex items-center justify-center animate-swing no-color-transition ${
                  isDay
                    ? "bg-gradient-to-br from-emerald-400 to-teal-500"
                    : "bg-gradient-to-br from-fuchsia-500 to-purple-600"
                }`}
                style={{ boxShadow: isDay ? "0 4px 0 #0d9488" : "0 4px 0 #7e22ce" }}
              >
                <Plus size={32} className="text-white lg:hidden" strokeWidth={3} />
                <Plus size={44} className="text-white hidden lg:block" strokeWidth={3} />
              </div>
              <div className="absolute -top-1 -left-1 animate-sparkle no-color-transition" style={{ animationDelay: "1.2s" }}>
                <svg width="12" height="12" viewBox="0 0 16 16"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill={isDay ? "#14b8a6" : "#c084fc"} opacity="0.6"/></svg>
              </div>
            </div>
            <span className={`text-base lg:text-2xl font-black ${isDay ? "text-teal-700" : "text-fuchsia-200"}`}>
              משימה חדשה
            </span>
          </button>
        </div>

        {/* Week view */}
        <div className="animate-fade-up no-color-transition" style={{ animationDelay: "0.3s" }}>
          <h2 className={`text-lg lg:text-3xl font-black mb-3 lg:mb-5 flex items-center gap-2 ${isDay ? "text-sky-800" : "text-orange-200"}`}>
            <span className="animate-wave-bob no-color-transition inline-block">
              {isDay ? "🌊" : "🌙"}
            </span>
            השבוע שלך
          </h2>
          <WeekView isDay={isDay} refreshKey={refreshKey} />
        </div>
      </div>

      <AddTaskModal
        open={showAddTask}
        isDay={isDay}
        onClose={() => setShowAddTask(false)}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />

      <BottomTabs isDay={isDay} />
    </div>
  );
}
