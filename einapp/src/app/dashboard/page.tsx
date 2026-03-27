"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageCircle, Lightbulb, Flame } from "lucide-react";
import WeekView from "@/components/WeekView";
import AddTaskModal from "@/components/AddTaskModal";
import BottomTabs from "@/components/BottomTabs";
import WeatherWidget from "@/components/WeatherWidget";
import { formatHebrewDate, isErevShabbat, isShabbat, getJewishHolidayGreeting, getShabbatGreeting } from "@/lib/hebrew";

function getTimeMode(): "day" | "sunset" {
  const now = new Date();
  const m = now.getHours() * 60 + now.getMinutes();
  return m >= 990 || m < 300 ? "sunset" : "day";
}

function getGreeting(): string {
  const now = new Date();
  const h = now.getHours();
  const holidayGreeting = getJewishHolidayGreeting(now);
  if (holidayGreeting) return holidayGreeting;
  if (isErevShabbat(now)) return getShabbatGreeting();
  if (isShabbat(now)) return "שבת שלום נשמהההה! 🕯️💛";
  if (h < 12) return "בוקר טוב נשמה ☀️";
  if (h < 17) return "צהריים טובים מאמי 🌊";
  return "ערב טוב נשמה 🌙";
}

export default function DashboardPage() {
  const [showAddTask, setShowAddTask] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mode, setMode] = useState<"day" | "sunset">("day");
  const [mounted, setMounted] = useState(false);
  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const router = useRouter();
  const today = new Date();

  useEffect(() => {
    setMounted(true);
    setMode(getTimeMode());
    const interval = setInterval(() => setMode(getTimeMode()), 60000);

    fetch("/api/daily-tip").then(r => r.ok ? r.json() : null).then(d => d && setDailyTip(d.tip)).catch(() => null);

    // Load streak from localStorage
    const saved = localStorage.getItem("einapp_streak");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const todayStr = today.toISOString().split("T")[0];
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        if (data.lastDate === todayStr) {
          setStreak(data.count);
        } else if (data.lastDate === yesterdayStr) {
          setStreak(data.count); // Will be updated when tasks are completed
        }
      } catch {}
    }

    return () => clearInterval(interval);
  }, []);

  const isDay = mode === "day";
  if (!mounted) return <div className="h-[100dvh] bg-sky-100" />;

  return (
    <div className={`h-[100dvh] flex flex-col overflow-hidden ${
      isDay
        ? "bg-gradient-to-b from-sky-50 via-cyan-50/50 to-white"
        : "bg-gradient-to-b from-[#1a0e2e] via-[#12081f] to-[#0a0514]"
    }`}>

      {/* ===== HERO (compact) ===== */}
      <div className={`relative overflow-hidden shrink-0 ${
        isDay
          ? "bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-300"
          : "bg-gradient-to-br from-rose-500 via-fuchsia-600 to-violet-700"
      }`}>
        <div className={`absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl ${isDay ? "bg-yellow-300/30" : "bg-fuchsia-500/20"}`} />

        <div className="relative z-10 px-5 pt-3 pb-3 lg:px-10 lg:pt-5 lg:pb-4 flex items-center justify-between">
          <div>
            <p className="text-white/50 text-[10px] lg:text-xs font-semibold tracking-wider mb-0.5">
              {formatHebrewDate(today)}
            </p>
            <h1 className="text-white text-xl lg:text-3xl font-black leading-tight">
              {getGreeting()}
            </h1>
          </div>
          {/* Streak badge */}
          {streak > 0 && (
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl ${
              isDay ? "bg-white/20" : "bg-white/10"
            }`}>
              <Flame size={16} className="text-orange-300" />
              <span className="text-white text-sm font-black">{streak}</span>
            </div>
          )}
        </div>

        <div className={`h-2 ${
          isDay ? "bg-gradient-to-b from-transparent to-sky-50" : "bg-gradient-to-b from-transparent to-[#1a0e2e]"
        }`} />
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-10 pb-2 max-w-4xl mx-auto w-full space-y-3 lg:space-y-4">

        {/* Quick action buttons — big, simple, mobile-first */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/chat")}
            className={`rounded-2xl p-4 lg:p-5 flex items-center gap-3 transition-all active:scale-[0.97] ${
              isDay
                ? "bg-white border-2 border-sky-100 shadow-sm"
                : "bg-white/10 border-2 border-white/15"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
              isDay ? "bg-gradient-to-br from-cyan-400 to-blue-500" : "bg-gradient-to-br from-orange-400 to-rose-500"
            }`}>
              <MessageCircle size={22} className="text-white" strokeWidth={2.5} />
            </div>
            <span className={`text-sm font-black ${isDay ? "text-sky-800" : "text-white/80"}`}>
              דברי איתי
            </span>
          </button>

          <button
            onClick={() => setShowAddTask(true)}
            className={`rounded-2xl p-4 lg:p-5 flex items-center gap-3 transition-all active:scale-[0.97] ${
              isDay
                ? "bg-white border-2 border-sky-100 shadow-sm"
                : "bg-white/10 border-2 border-white/15"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
              isDay ? "bg-gradient-to-br from-emerald-400 to-teal-500" : "bg-gradient-to-br from-violet-500 to-indigo-600"
            }`}>
              <Plus size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <span className={`text-sm font-black ${isDay ? "text-teal-800" : "text-white/80"}`}>
              משימה חדשה
            </span>
          </button>
        </div>

        {/* Weather (compact) */}
        <WeatherWidget isDay={isDay} />

        {/* Daily tip */}
        {dailyTip && (
          <div className={`rounded-2xl p-3 flex items-start gap-2.5 ${
            isDay
              ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60"
              : "bg-gradient-to-r from-amber-500/10 to-orange-500/[0.06] border border-amber-500/15"
          }`}>
            <Lightbulb size={16} className={`shrink-0 mt-0.5 ${isDay ? "text-amber-500" : "text-amber-400"}`} />
            <p className={`text-xs font-semibold leading-relaxed ${isDay ? "text-amber-800" : "text-amber-200/90"}`} dir="rtl">
              {dailyTip}
            </p>
          </div>
        )}

        {/* Week view — today big, other days compact */}
        <WeekView isDay={isDay} refreshKey={refreshKey} onStreakUpdate={(s: number) => setStreak(s)} />
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
