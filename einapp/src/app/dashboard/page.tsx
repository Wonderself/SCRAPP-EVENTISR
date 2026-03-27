"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageCircle, Lightbulb } from "lucide-react";
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

  // Jewish holiday greeting takes priority
  const holidayGreeting = getJewishHolidayGreeting(now);
  if (holidayGreeting) return holidayGreeting;

  // Shabbat greetings
  if (isErevShabbat(now)) return getShabbatGreeting();
  if (isShabbat(now)) return "שבת שלום נשמהההה! 🕯️💛 תהני מהמנוחה!";

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
  const router = useRouter();
  const today = new Date();

  useEffect(() => {
    setMounted(true);
    setMode(getTimeMode());
    const interval = setInterval(() => setMode(getTimeMode()), 60000);

    fetch("/api/daily-tip")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setDailyTip(d.tip))
      .catch(() => null);

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

      {/* ===== HERO ===== */}
      <div className={`relative overflow-hidden shrink-0 ${
        isDay
          ? "bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-300"
          : "bg-gradient-to-br from-rose-500 via-fuchsia-600 to-violet-700"
      }`}>
        {/* Ambient glows */}
        <div className={`absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl ${
          isDay ? "bg-yellow-300/30" : "bg-fuchsia-500/20"
        }`} />
        <div className={`absolute -top-5 -right-10 w-24 h-24 rounded-full blur-2xl ${
          isDay ? "bg-white/20" : "bg-violet-500/15"
        }`} />

        {/* Content */}
        <div className="relative z-10 px-5 pt-4 pb-4 lg:px-10 lg:pt-6 lg:pb-5">
          <p className="text-white/50 text-[10px] lg:text-xs font-semibold tracking-wider mb-0.5">
            {formatHebrewDate(today)}
          </p>
          <h1 className="text-white text-2xl lg:text-4xl font-black leading-tight">
            {getGreeting()}
          </h1>
        </div>

        <div className={`h-3 ${
          isDay
            ? "bg-gradient-to-b from-transparent to-sky-50"
            : "bg-gradient-to-b from-transparent to-[#1a0e2e]"
        }`} />
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-10 pb-2 max-w-4xl mx-auto w-full space-y-3 lg:space-y-4">

        {/* Weather */}
        <WeatherWidget isDay={isDay} />

        {/* Daily tip */}
        {dailyTip && (
          <div className={`rounded-[20px] p-3.5 lg:p-5 flex items-start gap-3 ${
            isDay
              ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60"
              : "bg-gradient-to-r from-amber-500/10 to-orange-500/[0.06] border border-amber-500/15"
          }`}>
            <div className={`w-9 h-9 lg:w-11 lg:h-11 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 ${
              isDay
                ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-400/20"
                : "bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/15"
            }`}>
              <Lightbulb size={18} className="text-white lg:hidden" />
              <Lightbulb size={22} className="text-white hidden lg:block" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] lg:text-xs font-bold mb-0.5 ${
                isDay ? "text-amber-600/70" : "text-amber-400/80"
              }`}>
                טיפ יומי לשיפור המלון
              </p>
              <p className={`text-xs lg:text-sm font-semibold leading-relaxed ${
                isDay ? "text-amber-800" : "text-amber-200/90"
              }`} dir="rtl">
                {dailyTip}
              </p>
            </div>
          </div>
        )}

        {/* 2 Action buttons */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          {/* Chat */}
          <button
            onClick={() => router.push("/chat")}
            className={`group rounded-[24px] p-5 lg:p-7 flex flex-col items-center gap-2.5 lg:gap-3 transition-all active:scale-[0.96] ${
              isDay
                ? "bg-white border-2 border-sky-100 shadow-[0_4px_24px_rgba(14,165,233,0.1)]"
                : "bg-white/10 border-2 border-white/15 shadow-[0_4px_24px_rgba(168,85,247,0.08)]"
            }`}
          >
            <div className={`w-14 h-14 lg:w-18 lg:h-18 rounded-2xl flex items-center justify-center shadow-lg ${
              isDay
                ? "bg-gradient-to-br from-cyan-400 to-blue-500 shadow-cyan-500/25"
                : "bg-gradient-to-br from-orange-400 to-rose-500 shadow-rose-500/25"
            }`}>
              <MessageCircle size={26} className="text-white lg:hidden" strokeWidth={2.5} />
              <MessageCircle size={32} className="text-white hidden lg:block" strokeWidth={2.5} />
            </div>
            <span className={`text-sm lg:text-base font-black ${isDay ? "text-sky-800" : "text-white/80"}`}>
              דברי איתי 💬
            </span>
          </button>

          {/* Add task */}
          <button
            onClick={() => setShowAddTask(true)}
            className={`group rounded-[24px] p-5 lg:p-7 flex flex-col items-center gap-2.5 lg:gap-3 transition-all active:scale-[0.96] ${
              isDay
                ? "bg-white border-2 border-sky-100 shadow-[0_4px_24px_rgba(14,165,233,0.1)]"
                : "bg-white/10 border-2 border-white/15 shadow-[0_4px_24px_rgba(168,85,247,0.08)]"
            }`}
          >
            <div className={`w-14 h-14 lg:w-18 lg:h-18 rounded-2xl flex items-center justify-center shadow-lg ${
              isDay
                ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/25"
                : "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/25"
            }`}>
              <Plus size={28} className="text-white lg:hidden" strokeWidth={2.5} />
              <Plus size={34} className="text-white hidden lg:block" strokeWidth={2.5} />
            </div>
            <span className={`text-sm lg:text-base font-black ${isDay ? "text-teal-800" : "text-white/80"}`}>
              משימה חדשה ✨
            </span>
          </button>
        </div>

        {/* Week view — today big, other days compact */}
        <WeekView isDay={isDay} refreshKey={refreshKey} />
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
