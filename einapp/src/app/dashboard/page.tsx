"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageCircle, Waves } from "lucide-react";
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

  if (!mounted) return <div className="min-h-screen bg-[#f0f9ff]" />;

  return (
    <div
      className={`min-h-screen pb-24 ${
        isDay
          ? "bg-gradient-to-b from-[#f0f9ff] to-white"
          : "bg-gradient-to-b from-[#0f0a1a] to-[#1a1228]"
      }`}
    >
      {/* ===== HERO ===== */}
      <div
        className={`relative overflow-hidden ${
          isDay
            ? "bg-gradient-to-br from-[#0e7490] via-[#0891b2] to-[#06b6d4]"
            : "bg-gradient-to-br from-[#7c2d12] via-[#be185d] to-[#581c87] animate-gradient"
        }`}
      >
        {/* Sun / Moon */}
        <div className="absolute top-6 left-6 no-color-transition">
          {isDay ? (
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full animate-pulse-glow no-color-transition"
                style={{
                  background: "radial-gradient(circle, #fef3c7, #fbbf24, #f59e0b)",
                  boxShadow: "0 0 50px rgba(251,191,36,0.5), 0 0 100px rgba(251,191,36,0.25), 0 0 150px rgba(251,191,36,0.1)",
                }}
              />
              {/* Sun rays */}
              <div className="absolute inset-0 animate-float no-color-transition">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-yellow-300/40 rounded-full" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-yellow-300/40 rounded-full" />
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 h-0.5 w-4 bg-yellow-300/40 rounded-full" />
                <div className="absolute top-1/2 -right-2 -translate-y-1/2 h-0.5 w-4 bg-yellow-300/40 rounded-full" />
              </div>
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-full animate-pulse-glow no-color-transition"
              style={{
                background: "radial-gradient(circle at 35% 35%, #fef3c7, #fde68a, #fbbf24)",
                boxShadow: "0 0 40px rgba(253,230,138,0.3), 0 0 80px rgba(253,230,138,0.15)",
              }}
            />
          )}
        </div>

        {/* Decorative dots */}
        {isDay ? (
          <>
            <div className="absolute top-12 right-12 w-2 h-2 rounded-full bg-white/20" />
            <div className="absolute top-24 right-8 w-1.5 h-1.5 rounded-full bg-white/15" />
            <div className="absolute top-8 right-24 w-1 h-1 rounded-full bg-white/25" />
          </>
        ) : (
          <>
            <div className="absolute top-10 right-16 w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="absolute top-20 right-10 w-1 h-1 rounded-full bg-white/30" />
            <div className="absolute top-6 right-32 w-1 h-1 rounded-full bg-white/15" />
            <div className="absolute top-28 right-20 w-0.5 h-0.5 rounded-full bg-white/25" />
            <div className="absolute top-14 right-40 w-1 h-1 rounded-full bg-white/20" />
          </>
        )}

        {/* Content */}
        <div className="relative z-10 px-6 pt-16 pb-20">
          <p className="text-white/50 text-xs font-light tracking-wider mb-3 animate-fade-in no-color-transition">
            {formatHebrewDate(today)}
          </p>
          <h1 className="text-white text-4xl lg:text-5xl font-extrabold leading-tight mb-1 animate-fade-up no-color-transition">
            {getGreeting()}
          </h1>
          <p className="text-white/30 text-[11px] mt-3 tracking-[0.3em] uppercase font-light">
            Sea Vibes Vacation
          </p>
        </div>

        {/* Wave transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-10 block">
            <path
              fill={isDay ? "#f0f9ff" : "#0f0a1a"}
              d="M0,40 C240,70 480,10 720,40 C960,70 1200,10 1440,40 L1440,80 L0,80 Z"
            />
          </svg>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="px-5 lg:px-8 max-w-2xl mx-auto -mt-6 space-y-5 relative z-10">

        {/* Weather widget */}
        <div className="animate-fade-up no-color-transition" style={{ animationDelay: "0.05s" }}>
          <WeatherWidget isDay={isDay} />
        </div>

        {/* Quick actions — 2 big buttons */}
        <div className="grid grid-cols-2 gap-3 animate-fade-up no-color-transition" style={{ animationDelay: "0.1s" }}>
          <button
            onClick={() => router.push("/chat")}
            className={`relative overflow-hidden rounded-2xl p-5 flex flex-col items-center gap-3 transition-all active:scale-[0.97] ${
              isDay ? "glass-day shadow-lg shadow-cyan-100/50" : "glass-sunset shadow-lg shadow-orange-900/20"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                isDay
                  ? "bg-gradient-to-br from-cyan-400 to-cyan-600"
                  : "bg-gradient-to-br from-orange-400 to-pink-500"
              }`}
            >
              <MessageCircle size={26} className="text-white" strokeWidth={2} />
            </div>
            <span className={`text-sm font-bold ${isDay ? "text-cyan-800" : "text-orange-100"}`}>
              דברי עם Einapp
            </span>
          </button>

          <button
            onClick={() => setShowAddTask(true)}
            className={`relative overflow-hidden rounded-2xl p-5 flex flex-col items-center gap-3 transition-all active:scale-[0.97] ${
              isDay ? "glass-day shadow-lg shadow-cyan-100/50" : "glass-sunset shadow-lg shadow-orange-900/20"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                isDay
                  ? "bg-gradient-to-br from-teal-400 to-emerald-500"
                  : "bg-gradient-to-br from-fuchsia-500 to-purple-600"
              }`}
            >
              <Plus size={28} className="text-white" strokeWidth={2.5} />
            </div>
            <span className={`text-sm font-bold ${isDay ? "text-teal-800" : "text-fuchsia-100"}`}>
              משימה חדשה
            </span>
          </button>
        </div>

        {/* Week view */}
        <div className="animate-fade-up no-color-transition" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-2 mb-3">
            <Waves size={16} className={isDay ? "text-cyan-500" : "text-orange-400"} />
            <h2 className={`text-base font-bold ${isDay ? "text-cyan-900" : "text-orange-100"}`}>
              השבוע שלך
            </h2>
          </div>
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
