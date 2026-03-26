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
  const [mode, setMode] = useState<"day" | "sunset">("day");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMode(getTimeMode());
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const res = await fetch("/api/tasks?action=recurring");
    setTasks(await res.json());
    setLoading(false);
  }

  async function toggleActive(task: Task) {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id: task.id, updates: { is_active: !task.is_active } }),
    });
    fetchTasks();
  }

  async function handleDelete(id: number) {
    if (!confirm("למחוק?")) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    fetchTasks();
  }

  const isDay = mode === "day";
  if (!mounted) return <div className="h-[100dvh] bg-sky-100" />;

  return (
    <div className={`h-[100dvh] flex flex-col overflow-hidden ${isDay ? "bg-sky-100" : "bg-[#0d0820]"}`}>
      <div className={`shrink-0 px-5 pt-10 pb-4 lg:pt-12 lg:pb-5 ${
        isDay ? "bg-gradient-to-l from-sky-400 to-cyan-400" : "bg-gradient-to-l from-orange-500 to-pink-500"
      }`}>
        <h1 className="text-2xl lg:text-4xl font-black text-white">משימות קבועות</h1>
        <p className="text-white/40 text-[10px] lg:text-xs mt-0.5 tracking-widest uppercase font-bold">recurring tasks</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:px-10 space-y-3 max-w-3xl mx-auto w-full">
        {loading && (
          <p className={`text-center py-8 text-base font-black ${isDay ? "text-sky-300" : "text-white/15"}`}>...</p>
        )}
        {!loading && tasks.length === 0 && (
          <div className={`text-center py-12 ${isDay ? "text-sky-400" : "text-white/20"}`}>
            <p className="text-lg lg:text-2xl font-black">אין משימות קבועות עדיין</p>
            <p className="text-sm lg:text-base font-bold mt-1">הוסיפי מהדשבורד</p>
          </div>
        )}
        {tasks.map((task, i) => (
          <div
            key={task.id}
            className={`rounded-2xl lg:rounded-3xl p-4 lg:p-5 transition-all animate-fade-up no-color-transition ${
              !task.is_active ? "opacity-40" : ""
            } ${isDay ? "cartoon-card-day" : "cartoon-card-sunset"}`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className={`font-black text-sm lg:text-lg ${isDay ? "text-sky-800" : "text-white/90"}`}>{task.description}</p>
                <div className="flex gap-2 mt-1.5">
                  {task.days_of_week?.map((day) => (
                    <span key={day} className={`text-[10px] lg:text-xs px-2 py-0.5 rounded-lg font-black ${
                      isDay ? "bg-sky-100 text-sky-500" : "bg-orange-500/10 text-orange-300"
                    }`}>
                      {DAY_LABELS[day] || day}
                    </span>
                  ))}
                </div>
                {task.time && (
                  <p className={`text-[10px] lg:text-xs mt-1.5 font-bold ${isDay ? "text-sky-400" : "text-white/20"}`}>{task.time}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleActive(task)} className={`cartoon-btn p-2 rounded-xl ${isDay ? "hover:bg-sky-50" : "hover:bg-white/5"}`}>
                  {task.is_active ? <Pause size={16} className={isDay ? "text-sky-400" : "text-white/25"} /> : <Play size={16} className="text-emerald-500" />}
                </button>
                <button onClick={() => handleDelete(task.id)} className={`cartoon-btn p-2 rounded-xl ${isDay ? "hover:bg-red-50" : "hover:bg-red-500/5"}`}>
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
