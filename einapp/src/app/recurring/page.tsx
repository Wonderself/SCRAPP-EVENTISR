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
  if (!mounted) return <div className="min-h-screen bg-[#f0f9ff]" />;

  return (
    <div className={`min-h-screen pb-24 ${isDay ? "bg-gradient-to-b from-[#f0f9ff] to-white" : "bg-gradient-to-b from-[#0f0a1a] to-[#1a1228]"}`}>
      <div className={`px-5 pt-12 pb-8 ${
        isDay ? "bg-gradient-to-l from-[#0e7490] to-[#06b6d4]" : "bg-gradient-to-l from-[#7c2d12] to-[#be185d]"
      }`}>
        <h1 className="text-2xl font-bold text-white">משימות קבועות</h1>
        <p className="text-white/40 text-xs mt-1 tracking-widest uppercase font-light">recurring tasks</p>
      </div>

      <div className="p-4 space-y-3 -mt-4 max-w-2xl mx-auto">
        {loading && (
          <p className={`text-center py-12 text-sm ${isDay ? "text-cyan-300" : "text-white/20"}`}>...</p>
        )}
        {!loading && tasks.length === 0 && (
          <div className={`text-center py-16 ${isDay ? "text-cyan-400" : "text-white/25"}`}>
            <p className="text-sm">אין משימות קבועות עדיין</p>
            <p className="text-xs mt-1">הוסיפי מהדשבורד</p>
          </div>
        )}
        {tasks.map((task, i) => (
          <div
            key={task.id}
            className={`rounded-2xl p-4 transition-all animate-fade-up no-color-transition ${
              !task.is_active ? "opacity-40" : ""
            } ${isDay ? "glass-day shadow-sm" : "glass-sunset"}`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className={`font-semibold ${isDay ? "text-cyan-900" : "text-white/90"}`}>{task.description}</p>
                <div className="flex gap-1.5 mt-2">
                  {task.days_of_week?.map((day) => (
                    <span key={day} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isDay ? "bg-cyan-100 text-cyan-600" : "bg-orange-500/10 text-orange-300"
                    }`}>
                      {DAY_LABELS[day] || day}
                    </span>
                  ))}
                </div>
                {task.time && (
                  <p className={`text-xs mt-1.5 ${isDay ? "text-cyan-400" : "text-white/25"}`}>{task.time}</p>
                )}
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleActive(task)} className={`p-2 rounded-xl transition-colors ${isDay ? "hover:bg-cyan-50" : "hover:bg-white/5"}`}>
                  {task.is_active ? (
                    <Pause size={15} className={isDay ? "text-cyan-400" : "text-white/30"} />
                  ) : (
                    <Play size={15} className="text-emerald-500" />
                  )}
                </button>
                <button onClick={() => handleDelete(task.id)} className={`p-2 rounded-xl transition-colors ${isDay ? "hover:bg-red-50" : "hover:bg-red-500/10"}`}>
                  <Trash2 size={15} className="text-red-400" />
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
