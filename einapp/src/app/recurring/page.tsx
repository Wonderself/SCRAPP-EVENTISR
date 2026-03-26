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
  if (!mounted) return <div className="min-h-screen bg-[#F0F7FA]" />;

  return (
    <div className={`min-h-screen pb-24 ${isDay ? "bg-[#F0F7FA]" : "bg-[#1a1520]"}`}>
      <div className={`px-5 pt-12 pb-8 ${
        isDay ? "bg-gradient-to-bl from-[#1a7fb5] to-[#47b8e0]" : "bg-gradient-to-bl from-[#1a1025] to-[#4a1a3a]"
      }`}>
        <h1 className="text-2xl font-bold text-white">משימות קבועות</h1>
        <p className="text-white/50 text-xs mt-1 tracking-widest uppercase font-light">recurring tasks</p>
      </div>

      <div className="p-4 space-y-3 -mt-4">
        {loading && (
          <p className={`text-center py-12 text-sm ${isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]"}`}>loading...</p>
        )}
        {!loading && tasks.length === 0 && (
          <div className={`text-center py-16 ${isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]"}`}>
            <p className="text-sm">אין משימות קבועות עדיין</p>
            <p className="text-xs mt-1">הוסיפי מהדשבורד</p>
          </div>
        )}
        {tasks.map((task, i) => (
          <div
            key={task.id}
            className={`rounded-2xl p-4 transition-all animate-fade-up no-color-transition ${
              !task.is_active ? "opacity-50" : ""
            } ${isDay ? "bg-white border border-[#d8eef5]" : "bg-[#2a2035] border border-[#3a2540]"}`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className={`font-medium ${isDay ? "text-[#1a3a4a]" : "text-[#f5e6d8]"}`}>{task.description}</p>
                <div className="flex gap-1.5 mt-2">
                  {task.days_of_week?.map((day) => (
                    <span key={day} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isDay ? "bg-[#2196c8]/10 text-[#2196c8]" : "bg-[#e65100]/10 text-[#e65100]"
                    }`}>
                      {DAY_LABELS[day] || day}
                    </span>
                  ))}
                </div>
                {task.time && (
                  <p className={`text-xs mt-1.5 ${isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]"}`}>{task.time}</p>
                )}
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleActive(task)} className={`p-2 rounded-xl ${isDay ? "hover:bg-[#f0f7fa]" : "hover:bg-[#1a1520]"}`}>
                  {task.is_active ? <Pause size={15} className={isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]"} /> : <Play size={15} className="text-[#43a047]" />}
                </button>
                <button onClick={() => handleDelete(task.id)} className={`p-2 rounded-xl ${isDay ? "hover:bg-[#fff5f5]" : "hover:bg-[#2a1520]"}`}>
                  <Trash2 size={15} className="text-[#e53935]" />
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
