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
  if (!mounted) return <div className="min-h-screen bg-sky-100" />;

  return (
    <div className={`min-h-screen pb-28 ${isDay ? "bg-sky-100" : "bg-[#0d0820]"}`}>
      <div className={`px-5 pt-12 pb-10 lg:pt-14 lg:pb-12 ${
        isDay ? "bg-gradient-to-l from-sky-400 to-cyan-400" : "bg-gradient-to-l from-orange-500 to-pink-500"
      }`}>
        <h1 className="text-3xl lg:text-5xl font-black text-white">משימות קבועות</h1>
        <p className="text-white/40 text-xs lg:text-sm mt-1 tracking-widest uppercase font-bold">recurring tasks</p>
      </div>

      <div className="p-5 lg:px-12 space-y-4 -mt-5 max-w-3xl mx-auto">
        {loading && (
          <p className={`text-center py-12 text-base font-black ${isDay ? "text-sky-300" : "text-white/15"}`}>...</p>
        )}
        {!loading && tasks.length === 0 && (
          <div className={`text-center py-16 ${isDay ? "text-sky-400" : "text-white/20"}`}>
            <p className="text-lg lg:text-2xl font-black">אין משימות קבועות עדיין</p>
            <p className="text-sm lg:text-base font-bold mt-1">הוסיפי מהדשבורד</p>
          </div>
        )}
        {tasks.map((task, i) => (
          <div
            key={task.id}
            className={`rounded-3xl p-5 lg:p-6 transition-all animate-fade-up no-color-transition ${
              !task.is_active ? "opacity-40" : ""
            } ${isDay ? "cartoon-card-day" : "cartoon-card-sunset"}`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className={`font-black text-base lg:text-xl ${isDay ? "text-sky-800" : "text-white/90"}`}>{task.description}</p>
                <div className="flex gap-2 mt-2">
                  {task.days_of_week?.map((day) => (
                    <span key={day} className={`text-xs lg:text-sm px-2.5 py-1 rounded-xl font-black ${
                      isDay ? "bg-sky-100 text-sky-500" : "bg-orange-500/10 text-orange-300"
                    }`}>
                      {DAY_LABELS[day] || day}
                    </span>
                  ))}
                </div>
                {task.time && (
                  <p className={`text-xs lg:text-sm mt-2 font-bold ${isDay ? "text-sky-400" : "text-white/20"}`}>{task.time}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleActive(task)} className={`cartoon-btn p-2.5 rounded-xl ${isDay ? "hover:bg-sky-50" : "hover:bg-white/5"}`}>
                  {task.is_active ? <Pause size={18} className={isDay ? "text-sky-400" : "text-white/25"} /> : <Play size={18} className="text-emerald-500" />}
                </button>
                <button onClick={() => handleDelete(task.id)} className={`cartoon-btn p-2.5 rounded-xl ${isDay ? "hover:bg-red-50" : "hover:bg-red-500/5"}`}>
                  <Trash2 size={18} className="text-red-400" />
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
