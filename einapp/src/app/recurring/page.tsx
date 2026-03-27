"use client";

import { useEffect, useState } from "react";
import { Trash2, Pause, Play } from "lucide-react";
import BottomTabs from "@/components/BottomTabs";
import type { Task } from "@/types";

function getTimeMode(): "day" | "sunset" {
  const now = new Date();
  const m = now.getHours() * 60 + now.getMinutes();
  return m >= 990 || m < 300 ? "sunset" : "day";
}

const DAY_LABELS: Record<string, string> = {
  sunday: "א", monday: "ב", tuesday: "ג", wednesday: "ד",
  thursday: "ה", friday: "ו", saturday: "ש",
};

export default function RecurringPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"day" | "sunset">("day");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMode(getTimeMode());
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setError(null);
      const res = await fetch("/api/tasks?action=recurring");
      if (!res.ok) throw new Error("Failed to load tasks");
      setTasks(await res.json());
    } catch (e: any) {
      setError(e.message || "שגיאה בטעינת משימות");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(task: Task) {
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id: task.id, updates: { is_active: !task.is_active } }),
      });
      fetchTasks();
    } catch {
      setError("שגיאה בעדכון משימה");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("למחוק?")) return;
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      fetchTasks();
    } catch {
      setError("שגיאה במחיקת משימה");
    }
  }

  const isDay = mode === "day";
  if (!mounted) return <div className="h-[100dvh] bg-sky-100" />;

  return (
    <div className={`h-[100dvh] flex flex-col overflow-hidden ${
      isDay
        ? "bg-gradient-to-b from-sky-50 via-cyan-50/50 to-white"
        : "bg-gradient-to-b from-[#1a0e2e] via-[#12081f] to-[#0a0514]"
    }`}>
      <div className={`shrink-0 px-4 pt-[env(safe-area-inset-top,8px)] pb-3 sm:px-5 sm:pb-4 lg:pt-12 lg:pb-5 ${
        isDay
          ? "bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-300"
          : "bg-gradient-to-br from-rose-500 via-fuchsia-600 to-violet-700"
      }`}>
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-black text-white">משימות קבועות 🔄</h1>
        <p className="text-white/40 text-[10px] lg:text-xs mt-0.5 font-bold">המשימות שחוזרות כל שבוע</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:px-10 space-y-3 max-w-3xl mx-auto w-full">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl p-3 text-center">
            {error}
          </div>
        )}
        {loading && (
          <p className={`text-center py-8 text-base font-black ${isDay ? "text-sky-300" : "text-white/50"}`}>...</p>
        )}
        {!loading && tasks.length === 0 && (
          <div className={`text-center py-12 ${isDay ? "text-sky-400" : "text-white/50"}`}>
            <p className="text-4xl mb-3">🐬</p>
            <p className="text-lg lg:text-2xl font-black">אין משימות קבועות עדיין</p>
            <p className="text-sm lg:text-base font-bold mt-1">הוסיפי מהדשבורד נשמה!</p>
          </div>
        )}
        {tasks.map((task, i) => (
          <div
            key={task.id}
            className={`rounded-[20px] p-4 lg:p-5 transition-all ${
              !task.is_active ? "opacity-40" : ""
            } ${isDay
              ? "bg-white border border-sky-100 shadow-[0_2px_16px_rgba(14,165,233,0.08)]"
              : "bg-white/10 border border-white/15 shadow-[0_2px_16px_rgba(168,85,247,0.06)]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className={`font-black text-sm lg:text-lg ${isDay ? "text-sky-800" : "text-white/90"}`}>{task.description}</p>
                <div className="flex gap-2 mt-1.5">
                  {task.days_of_week?.map((day) => (
                    <span key={day} className={`text-[10px] lg:text-xs px-2 py-0.5 rounded-lg font-black ${
                      isDay ? "bg-sky-50 text-sky-500" : "bg-fuchsia-500/10 text-fuchsia-300"
                    }`}>
                      {DAY_LABELS[day] || day}
                    </span>
                  ))}
                </div>
                {task.time && (
                  <p className={`text-[10px] lg:text-xs mt-1.5 font-bold ${isDay ? "text-sky-400" : "text-white/40"}`}>{task.time}</p>
                )}
                {!task.is_active && (
                  <p className={`text-[10px] lg:text-xs mt-1 font-bold ${isDay ? "text-amber-500" : "text-amber-400/70"}`}>מושהה</p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleActive(task)} className={`p-2 rounded-xl transition-colors ${isDay ? "hover:bg-sky-50" : "hover:bg-white/10"}`}>
                  {task.is_active ? <Pause size={16} className={isDay ? "text-sky-400" : "text-white/50"} /> : <Play size={16} className="text-emerald-500" />}
                </button>
                <button onClick={() => handleDelete(task.id)} className={`p-2 rounded-xl transition-colors ${isDay ? "hover:bg-red-50" : "hover:bg-red-500/10"}`}>
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomTabs isDay={isDay} />
    </div>
  );
}
