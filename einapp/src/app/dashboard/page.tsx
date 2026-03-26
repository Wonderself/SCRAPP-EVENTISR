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
  if (!mounted) return <div className="h-[100dvh] bg-sky-100" />;

  return (
    <div className={`h-[100dvh] flex flex-col overflow-hidden ${isDay ? "bg-sky-50" : "bg-[#0d0820]"}`}>

      {/* ===== COMPACT HERO — minimal height ===== */}
      <div
        className={`relative overflow-hidden shrink-0 ${
          isDay
            ? "bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-300"
            : "bg-gradient-to-br from-orange-500 via-pink-500 to-purple-700 animate-gradient"
        }`}
      >
        {/* Small sun/moon — top-left */}
        <div className="absolute top-2 left-3 no-color-transition">
          {isDay ? (
            <div className="relative animate-float no-color-transition">
              <div
                className="w-10 h-10 lg:w-16 lg:h-16 rounded-full"
                style={{
                  background: "radial-gradient(circle at 40% 40%, #fff7b0, #fbbf24, #f59e0b)",
                  boxShadow: "0 0 20px rgba(251,191,36,0.5), inset -4px -4px 0 rgba(245,158,11,0.3)",
                }}
              />
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <div
                  key={deg}
                  className="absolute top-1/2 left-1/2 w-1 h-2.5 lg:w-1.5 lg:h-4 bg-yellow-300/40 rounded-full no-color-transition"
                  style={{ transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-24px)` }}
                />
              ))}
            </div>
          ) : (
            <div className="relative animate-float no-color-transition">
              <div
                className="w-9 h-9 lg:w-14 lg:h-14 rounded-full"
                style={{
                  background: "radial-gradient(circle at 35% 35%, #fef9c3, #fde68a, #fbbf24)",
                  boxShadow: "0 0 20px rgba(253,230,138,0.35), inset -4px -4px 0 rgba(251,191,36,0.2)",
                }}
              />
              <div
                className="absolute top-0 right-0 w-6 h-6 lg:w-9 lg:h-9 rounded-full no-color-transition"
                style={{ background: "radial-gradient(circle, rgba(168,85,247,0.7), transparent)" }}
              />
            </div>
          )}
        </div>

        {/* Sparkles */}
        <div className="absolute top-3 right-8 animate-sparkle no-color-transition">
          <svg width="10" height="10" viewBox="0 0 16 16"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="white" opacity="0.4"/></svg>
        </div>
        <div className="absolute top-8 right-20 animate-sparkle no-color-transition" style={{ animationDelay: "1.2s" }}>
          <svg width="8" height="8" viewBox="0 0 16 16"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill={isDay ? "white" : "#fbbf24"} opacity="0.3"/></svg>
        </div>

        {/* Cloud (day only) */}
        {isDay && (
          <div className="absolute top-2 right-3 animate-wave-bob no-color-transition">
            <svg width="40" height="20" viewBox="0 0 56 28"><ellipse cx="28" cy="18" rx="24" ry="9" fill="white" opacity="0.3"/><ellipse cx="20" cy="13" rx="12" ry="8" fill="white" opacity="0.3"/></svg>
          </div>
        )}

        {/* Content — very compact */}
        <div className="relative z-10 px-4 pt-3 pb-5 lg:px-8 lg:pt-4 lg:pb-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-white text-lg lg:text-3xl font-black leading-none animate-bounce-in no-color-transition">
                {getGreeting()}
              </h1>
              <p className="text-white/40 text-[8px] lg:text-xs mt-0.5 tracking-[0.2em] uppercase font-bold">
                Sea Vibes Vacation
              </p>
            </div>
            <p className="text-white/50 text-[8px] lg:text-xs font-bold">
              {formatHebrewDate(today)}
            </p>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="w-full h-3 lg:h-4 block">
            <path fill={isDay ? "#f0f9ff" : "#0d0820"} d="M0,20C360,35,720,8,1080,20C1260,28,1380,12,1440,20L1440,40L0,40Z" />
          </svg>
        </div>
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="flex-1 overflow-y-auto px-3 lg:px-8 py-2 lg:py-3 max-w-4xl mx-auto w-full space-y-2 lg:space-y-3">

        {/* Weather */}
        <WeatherWidget isDay={isDay} />

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2 lg:gap-3">
          <button
            onClick={() => router.push("/chat")}
            className={`cartoon-btn rounded-2xl p-2.5 lg:p-5 flex flex-col items-center gap-1 lg:gap-2 animate-slide-right no-color-transition ${
              isDay ? "cartoon-card-day" : "cartoon-card-sunset"
            }`}
            style={{ animationDelay: "0.1s" }}
          >
            <div
              className={`w-9 h-9 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center ${
                isDay ? "bg-gradient-to-br from-cyan-400 to-sky-500" : "bg-gradient-to-br from-orange-400 to-pink-500"
              }`}
              style={{ boxShadow: isDay ? "0 2px 0 #0891b2" : "0 2px 0 #c2410c" }}
            >
              <MessageCircle size={16} className="text-white lg:hidden" strokeWidth={2.5} />
              <MessageCircle size={24} className="text-white hidden lg:block" strokeWidth={2.5} />
            </div>
            <span className={`text-[11px] lg:text-base font-black ${isDay ? "text-sky-700" : "text-orange-200"}`}>
              דברי עם Einapp
            </span>
          </button>

          <button
            onClick={() => setShowAddTask(true)}
            className={`cartoon-btn rounded-2xl p-2.5 lg:p-5 flex flex-col items-center gap-1 lg:gap-2 animate-slide-left no-color-transition ${
              isDay ? "cartoon-card-day" : "cartoon-card-sunset"
            }`}
            style={{ animationDelay: "0.15s" }}
          >
            <div
              className={`w-9 h-9 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center ${
                isDay ? "bg-gradient-to-br from-emerald-400 to-teal-500" : "bg-gradient-to-br from-fuchsia-500 to-purple-600"
              }`}
              style={{ boxShadow: isDay ? "0 2px 0 #0d9488" : "0 2px 0 #7e22ce" }}
            >
              <Plus size={18} className="text-white lg:hidden" strokeWidth={3} />
              <Plus size={26} className="text-white hidden lg:block" strokeWidth={3} />
            </div>
            <span className={`text-[11px] lg:text-base font-black ${isDay ? "text-teal-700" : "text-fuchsia-200"}`}>
              משימה חדשה
            </span>
          </button>
        </div>

        {/* Week view */}
        <div className="animate-fade-up no-color-transition" style={{ animationDelay: "0.2s" }}>
          <h2 className={`text-xs lg:text-lg font-black mb-1 lg:mb-2 ${isDay ? "text-sky-800" : "text-orange-200"}`}>
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
