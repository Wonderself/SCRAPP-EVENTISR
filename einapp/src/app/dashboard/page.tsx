"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageCircle, Flame, CheckCircle } from "lucide-react";
import WeekView from "@/components/WeekView";
import AddTaskModal from "@/components/AddTaskModal";
import BottomTabs from "@/components/BottomTabs";
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
  const [streak, setStreak] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();
  const today = new Date();

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  useEffect(() => {
    setMounted(true);
    setMode(getTimeMode());
    const interval = setInterval(() => setMode(getTimeMode()), 60000);

    const saved = localStorage.getItem("einapp_streak");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const todayStr = today.toISOString().split("T")[0];
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        if (data.lastDate === todayStr || data.lastDate === yesterdayStr) {
          setStreak(data.count);
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

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-fade-up">
          <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl ${
            isDay ? "bg-emerald-500 text-white" : "bg-emerald-600 text-white"
          }`}>
            <CheckCircle size={18} />
            <span className="text-sm font-black">{toast}</span>
          </div>
        </div>
      )}

      {/* ===== HERO ===== */}
      <div className={`relative overflow-hidden shrink-0 ${
        isDay
          ? "bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-300"
          : "bg-gradient-to-br from-rose-500 via-fuchsia-600 to-violet-700"
      }`}>
        <div className={`absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl ${isDay ? "bg-yellow-300/30" : "bg-fuchsia-500/20"}`} />

        <div className="relative z-10 px-4 pt-[env(safe-area-inset-top,8px)] pb-2 sm:px-5 sm:pt-3 sm:pb-3 lg:px-10 lg:pt-5 lg:pb-4 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-white/50 text-[10px] sm:text-[11px] lg:text-xs font-semibold tracking-wider mb-0.5 truncate">
              {formatHebrewDate(today)}
            </p>
            <h1 className="text-white text-lg sm:text-xl lg:text-3xl font-black leading-tight truncate">
              {getGreeting()}
            </h1>
          </div>
          {streak > 0 && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-2xl shrink-0 ml-2 ${
              isDay ? "bg-white/20" : "bg-white/10"
            }`}>
              <Flame size={14} className="text-orange-300" />
              <span className="text-white text-xs sm:text-sm font-black">{streak}</span>
            </div>
          )}
        </div>

        <div className={`h-1.5 ${
          isDay ? "bg-gradient-to-b from-transparent to-sky-50" : "bg-gradient-to-b from-transparent to-[#1a0e2e]"
        }`} />
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-10 pb-1 max-w-4xl mx-auto w-full space-y-2.5 sm:space-y-3 lg:space-y-4">

        {/* Quick action buttons — clearly explained */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1.5">
          <button
            onClick={() => router.push("/chat")}
            className={`rounded-2xl p-3.5 sm:p-4 lg:p-5 flex flex-col items-center gap-2 transition-all active:scale-[0.97] ${
              isDay
                ? "bg-white border-2 border-sky-100 shadow-sm"
                : "bg-white/10 border-2 border-white/15"
            }`}
          >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-md ${
              isDay ? "bg-gradient-to-br from-cyan-400 to-blue-500" : "bg-gradient-to-br from-orange-400 to-rose-500"
            }`}>
              <MessageCircle size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <p className={`text-sm sm:text-base font-black ${isDay ? "text-sky-800" : "text-white/90"}`}>
                דברי איתי
              </p>
              <p className={`text-[10px] sm:text-[11px] font-semibold mt-0.5 ${isDay ? "text-sky-400" : "text-white/40"}`}>
                שאלי, ספרי, או בקשי משהו
              </p>
            </div>
          </button>

          <button
            onClick={() => setShowAddTask(true)}
            className={`rounded-2xl p-3.5 sm:p-4 lg:p-5 flex flex-col items-center gap-2 transition-all active:scale-[0.97] ${
              isDay
                ? "bg-white border-2 border-sky-100 shadow-sm"
                : "bg-white/10 border-2 border-white/15"
            }`}
          >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-md ${
              isDay ? "bg-gradient-to-br from-emerald-400 to-teal-500" : "bg-gradient-to-br from-violet-500 to-indigo-600"
            }`}>
              <Plus size={26} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <p className={`text-sm sm:text-base font-black ${isDay ? "text-teal-800" : "text-white/90"}`}>
                משימה חדשה
              </p>
              <p className={`text-[10px] sm:text-[11px] font-semibold mt-0.5 ${isDay ? "text-teal-400" : "text-white/40"}`}>
                הוסיפי תזכורת או מטלה
              </p>
            </div>
          </button>
        </div>

        {/* Week view — today big, other days compact */}
        <WeekView
          isDay={isDay}
          refreshKey={refreshKey}
          onStreakUpdate={(s: number) => setStreak(s)}
          onTaskToggle={(completed: boolean) => {
            showToast(completed ? "משימה בוצעה! 👑" : "משימה חזרה לרשימה");
          }}
        />
      </div>

      <AddTaskModal
        open={showAddTask}
        isDay={isDay}
        onClose={() => setShowAddTask(false)}
        onCreated={() => {
          setRefreshKey((k) => k + 1);
          showToast("משימה נוספה! ✅");
        }}
      />

      <BottomTabs isDay={isDay} />
    </div>
  );
}
