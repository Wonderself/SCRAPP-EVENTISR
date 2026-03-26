"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageCircle, Sparkles } from "lucide-react";
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
    <div className={`h-[100dvh] flex flex-col overflow-hidden ${
      isDay
        ? "bg-gradient-to-b from-sky-50 via-cyan-50 to-white"
        : "bg-gradient-to-b from-[#1a0e2e] via-[#12081f] to-[#0a0514]"
    }`}>

      {/* ===== HERO — Glass style ===== */}
      <div className={`relative overflow-hidden shrink-0 ${
        isDay
          ? "bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-300"
          : "bg-gradient-to-br from-rose-500 via-fuchsia-600 to-violet-700"
      }`}>
        {/* Ambient glow circles */}
        <div className={`absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl ${
          isDay ? "bg-yellow-300/30" : "bg-orange-500/20"
        }`} />
        <div className={`absolute -top-5 -right-10 w-24 h-24 rounded-full blur-2xl ${
          isDay ? "bg-white/20" : "bg-pink-400/15"
        }`} />

        {/* Floating particles */}
        <div className="absolute top-3 right-12 w-1 h-1 rounded-full bg-white/40 animate-float" />
        <div className="absolute top-6 right-24 w-1.5 h-1.5 rounded-full bg-white/25 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-2 left-[40%] w-1 h-1 rounded-full bg-white/30 animate-float" style={{ animationDelay: "2s" }} />

        {/* Content */}
        <div className="relative z-10 px-5 pt-4 pb-5 lg:px-10 lg:pt-5 lg:pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-[9px] lg:text-xs font-semibold tracking-wider mb-0.5">
                {formatHebrewDate(today)}
              </p>
              <h1 className="text-white text-xl lg:text-3xl font-black leading-tight">
                {getGreeting()}
              </h1>
            </div>
            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center backdrop-blur-md ${
              isDay ? "bg-white/20 shadow-lg shadow-cyan-500/10" : "bg-white/10 shadow-lg shadow-fuchsia-500/10"
            }`}>
              <Sparkles size={18} className="text-white/80 lg:hidden" />
              <Sparkles size={22} className="text-white/80 hidden lg:block" />
            </div>
          </div>
        </div>

        {/* Smooth edge */}
        <div className={`h-4 lg:h-5 ${
          isDay
            ? "bg-gradient-to-b from-transparent to-sky-50/80"
            : "bg-gradient-to-b from-transparent to-[#1a0e2e]"
        }`} />
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-10 pb-2 max-w-4xl mx-auto w-full space-y-3 lg:space-y-4">

        {/* Weather */}
        <WeatherWidget isDay={isDay} />

        {/* Quick actions — Glass cards */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <button
            onClick={() => router.push("/chat")}
            className={`group relative overflow-hidden rounded-[20px] lg:rounded-3xl p-4 lg:p-6 flex flex-col items-center gap-2 lg:gap-3 transition-all active:scale-[0.97] ${
              isDay
                ? "bg-white/80 backdrop-blur-sm border border-sky-100 shadow-[0_2px_20px_rgba(14,165,233,0.08)] hover:shadow-[0_4px_25px_rgba(14,165,233,0.15)]"
                : "bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] shadow-[0_2px_20px_rgba(168,85,247,0.06)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.12)]"
            }`}
          >
            {/* Gradient glow behind icon */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full blur-2xl opacity-30 ${
              isDay ? "bg-cyan-400" : "bg-orange-500"
            }`} />
            <div
              className={`relative w-11 h-11 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                isDay
                  ? "bg-gradient-to-br from-cyan-400 to-blue-500 shadow-cyan-500/25"
                  : "bg-gradient-to-br from-orange-400 to-rose-500 shadow-rose-500/25"
              }`}
            >
              <MessageCircle size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <span className={`text-xs lg:text-sm font-bold ${isDay ? "text-sky-800" : "text-white/80"}`}>
              דברי עם Einapp
            </span>
          </button>

          <button
            onClick={() => setShowAddTask(true)}
            className={`group relative overflow-hidden rounded-[20px] lg:rounded-3xl p-4 lg:p-6 flex flex-col items-center gap-2 lg:gap-3 transition-all active:scale-[0.97] ${
              isDay
                ? "bg-white/80 backdrop-blur-sm border border-sky-100 shadow-[0_2px_20px_rgba(14,165,233,0.08)] hover:shadow-[0_4px_25px_rgba(14,165,233,0.15)]"
                : "bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] shadow-[0_2px_20px_rgba(168,85,247,0.06)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.12)]"
            }`}
          >
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full blur-2xl opacity-30 ${
              isDay ? "bg-emerald-400" : "bg-violet-500"
            }`} />
            <div
              className={`relative w-11 h-11 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                isDay
                  ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/25"
                  : "bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/25"
              }`}
            >
              <Plus size={22} className="text-white" strokeWidth={2.5} />
            </div>
            <span className={`text-xs lg:text-sm font-bold ${isDay ? "text-teal-800" : "text-white/80"}`}>
              משימה חדשה
            </span>
          </button>
        </div>

        {/* Week view */}
        <div>
          <h2 className={`text-sm lg:text-base font-bold mb-2 lg:mb-3 ${isDay ? "text-sky-900/70" : "text-white/40"}`}>
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
