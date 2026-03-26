"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageCircle, ListChecks, ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className={`min-h-screen pb-24 ${isDay ? "bg-[#F0F7FA]" : "bg-[#1a1520]"}`}>
      {/* Header */}
      <div
        className={`relative overflow-hidden px-5 pt-12 pb-8 ${
          isDay
            ? "bg-gradient-to-bl from-[#1a7fb5] via-[#2d9dd4] to-[#47b8e0]"
            : "bg-gradient-to-bl from-[#1a1025] via-[#4a1a3a] to-[#2d1540]"
        }`}
      >
        {/* Decorative circle */}
        <div
          className={`absolute -top-20 -left-20 w-60 h-60 rounded-full opacity-10 ${
            isDay ? "bg-white" : "bg-[#e65100]"
          }`}
        />
        <div
          className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-5 ${
            isDay ? "bg-white" : "bg-[#c2185b]"
          }`}
        />

        <div className="relative z-10">
          <p className="text-white/60 text-xs font-light tracking-wider mb-1">
            {formatHebrewDate(today)}
          </p>
          <h1 className="text-white text-2xl font-bold">
            {isDay ? "בוקר טוב, עינת" : "ערב טוב, עינת"}
          </h1>
          <p className="text-white/50 text-xs mt-1 tracking-widest uppercase font-light">
            Dolphin Village
          </p>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Weather */}
        <div className="animate-fade-up no-color-transition">
          <WeatherWidget isDay={isDay} />
        </div>

        {/* Quick actions — 2 big clean buttons */}
        <div className="grid grid-cols-2 gap-3 animate-fade-up no-color-transition" style={{ animationDelay: "0.1s" }}>
          <button
            onClick={() => setShowAddTask(true)}
            className={`rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97] ${
              isDay
                ? "bg-white border border-[#d8eef5] hover:shadow-md hover:shadow-[#2196c8]/10"
                : "bg-[#2a2035] border border-[#3a2540] hover:shadow-md hover:shadow-[#e65100]/10"
            }`}
          >
            <div className={`p-3 rounded-xl ${isDay ? "bg-[#2196c8]/10" : "bg-[#e65100]/10"}`}>
              <Plus size={22} className={isDay ? "text-[#2196c8]" : "text-[#e65100]"} />
            </div>
            <span className={`text-xs font-medium ${isDay ? "text-[#1a3a4a]" : "text-[#f5e6d8]"}`}>
              משימה חדשה
            </span>
          </button>

          <button
            onClick={() => router.push("/chat")}
            className={`rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97] ${
              isDay
                ? "bg-white border border-[#d8eef5] hover:shadow-md hover:shadow-[#2196c8]/10"
                : "bg-[#2a2035] border border-[#3a2540] hover:shadow-md hover:shadow-[#e65100]/10"
            }`}
          >
            <div className={`p-3 rounded-xl ${isDay ? "bg-[#47b8e0]/10" : "bg-[#c2185b]/10"}`}>
              <MessageCircle size={22} className={isDay ? "text-[#47b8e0]" : "text-[#c2185b]"} />
            </div>
            <span className={`text-xs font-medium ${isDay ? "text-[#1a3a4a]" : "text-[#f5e6d8]"}`}>
              שיחה עם Einapp
            </span>
          </button>
        </div>

        {/* Week View */}
        <div className="animate-fade-up no-color-transition" style={{ animationDelay: "0.2s" }}>
          <h2 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
            isDay ? "text-[#4a7a8a]" : "text-[#c8a88a]"
          }`}>
            <ListChecks size={16} />
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
