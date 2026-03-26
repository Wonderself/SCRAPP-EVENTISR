"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageCircle, ListChecks, Waves } from "lucide-react";
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

  if (!mounted) return <div className="min-h-screen bg-[#F0F7FA]" />;

  return (
    <div className={`min-h-screen pb-28 ${isDay ? "bg-[#F0F7FA]" : "bg-[#1a1520]"}`}>
      {/* Hero Header */}
      <div
        className={`relative overflow-hidden px-6 pt-14 pb-12 ${
          isDay
            ? "bg-gradient-to-bl from-[#0d6eaa] via-[#1a8ec8] to-[#5bc0eb]"
            : "bg-gradient-to-bl from-[#0d0a14] via-[#2d1540] to-[#6a1b4d]"
        }`}
      >
        {/* Animated sun / moon */}
        <div className="absolute top-8 left-8 animate-float no-color-transition">
          {isDay ? (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff8c4] to-[#ffd54f] opacity-80 blur-[1px]"
              style={{ boxShadow: "0 0 40px rgba(255,213,79,0.5), 0 0 80px rgba(255,213,79,0.2)" }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ffecd2] to-[#fcb69f] opacity-60"
              style={{ boxShadow: "0 0 30px rgba(252,182,159,0.3)" }}
            />
          )}
        </div>

        {/* Decorative circles */}
        <div className={`absolute -bottom-16 -right-16 w-48 h-48 rounded-full opacity-[0.07] ${isDay ? "bg-white" : "bg-[#e65100]"}`} />
        <div className={`absolute top-4 right-1/3 w-24 h-24 rounded-full opacity-[0.05] ${isDay ? "bg-white" : "bg-[#c2185b]"}`} />

        {/* Waves decoration at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-8">
            <path
              fill={isDay ? "#F0F7FA" : "#1a1520"}
              d="M0,60 C360,100 720,20 1080,60 C1260,80 1380,40 1440,60 L1440,100 L0,100 Z"
            />
          </svg>
        </div>

        <div className="relative z-10">
          <p className="text-white/50 text-sm font-light tracking-wider mb-2">
            {formatHebrewDate(today)}
          </p>
          <h1 className="text-white text-4xl lg:text-5xl font-extrabold leading-tight">
            {getGreeting()}
          </h1>
          <p className="text-white/40 text-sm mt-2 tracking-[0.2em] uppercase font-light">
            Sea Vibes Vacation
          </p>
        </div>
      </div>

      <div className="px-4 lg:px-8 max-w-6xl mx-auto -mt-4 space-y-5">
        {/* Weather */}
        <div className="animate-fade-up no-color-transition">
          <WeatherWidget isDay={isDay} />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4 animate-fade-up no-color-transition" style={{ animationDelay: "0.1s" }}>
          <button
            onClick={() => setShowAddTask(true)}
            className={`rounded-2xl p-6 lg:p-8 flex flex-col items-center gap-3 transition-all active:scale-[0.97] group ${
              isDay
                ? "bg-white border border-[#d8eef5] hover:shadow-lg hover:shadow-[#2196c8]/10"
                : "bg-[#2a2035] border border-[#3a2540] hover:shadow-lg hover:shadow-[#e65100]/10"
            }`}
          >
            <div className={`p-4 rounded-2xl transition-all group-hover:scale-110 ${
              isDay ? "bg-[#2196c8]/10" : "bg-[#e65100]/10"
            }`}>
              <Plus size={28} className={isDay ? "text-[#2196c8]" : "text-[#e65100]"} />
            </div>
            <span className={`text-sm lg:text-base font-semibold ${isDay ? "text-[#1a3a4a]" : "text-[#f5e6d8]"}`}>
              משימה חדשה
            </span>
          </button>

          <button
            onClick={() => router.push("/chat")}
            className={`rounded-2xl p-6 lg:p-8 flex flex-col items-center gap-3 transition-all active:scale-[0.97] group ${
              isDay
                ? "bg-white border border-[#d8eef5] hover:shadow-lg hover:shadow-[#2196c8]/10"
                : "bg-[#2a2035] border border-[#3a2540] hover:shadow-lg hover:shadow-[#e65100]/10"
            }`}
          >
            <div className={`p-4 rounded-2xl transition-all group-hover:scale-110 ${
              isDay ? "bg-[#47b8e0]/10" : "bg-[#c2185b]/10"
            }`}>
              <MessageCircle size={28} className={isDay ? "text-[#47b8e0]" : "text-[#c2185b]"} />
            </div>
            <span className={`text-sm lg:text-base font-semibold ${isDay ? "text-[#1a3a4a]" : "text-[#f5e6d8]"}`}>
              דברי עם Einapp
            </span>
          </button>
        </div>

        {/* Week View */}
        <div className="animate-fade-up no-color-transition" style={{ animationDelay: "0.2s" }}>
          <h2 className={`text-base lg:text-lg font-bold mb-4 flex items-center gap-2 ${
            isDay ? "text-[#1a3a4a]" : "text-[#f5e6d8]"
          }`}>
            <Waves size={18} className={isDay ? "text-[#2196c8]" : "text-[#e65100]"} />
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
