"use client";

import { useEffect, useState } from "react";
import { Trash2, Pause, Play } from "lucide-react";
import BottomTabs from "@/components/BottomTabs";
import type { Task } from "@/types";

const DAY_LABELS: Record<string, string> = {
  sunday: "א׳",
  monday: "ב׳",
  tuesday: "ג׳",
  wednesday: "ד׳",
  thursday: "ה׳",
  friday: "ו׳",
  saturday: "ש׳",
};

export default function RecurringPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTasks() {
    const res = await fetch("/api/tasks?action=recurring");
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function toggleActive(task: Task) {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        id: task.id,
        updates: { is_active: !task.is_active },
      }),
    });
    fetchTasks();
  }

  async function handleDelete(id: number) {
    if (!confirm("למחוק את המשימה?")) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    fetchTasks();
  }

  return (
    <div className="min-h-screen bg-dolphin-cream pb-24">
      <div className="bg-gradient-to-l from-dolphin-ocean to-dolphin-ocean-dark text-white p-5 rounded-b-2xl">
        <h1 className="text-2xl font-bold">משימות קבועות 🔄</h1>
        <p className="text-dolphin-ocean-light text-sm mt-1">
          כל מה שחוזר על עצמו
        </p>
      </div>

      <div className="p-4 space-y-3">
        {loading && (
          <p className="text-center text-dolphin-sand-dark py-8">טוען... 🐬</p>
        )}
        {!loading && tasks.length === 0 && (
          <div className="text-center py-12 text-dolphin-sand-dark">
            <p className="text-4xl mb-3">🐬</p>
            <p>אין משימות קבועות עדיין</p>
            <p className="text-sm">הוסיפי מהדשבורד!</p>
          </div>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`bg-white rounded-xl p-4 border border-dolphin-sand-light shadow-sm ${
              !task.is_active ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-medium text-gray-800">{task.description}</p>
                <div className="flex gap-1 mt-2">
                  {task.days_of_week?.map((day) => (
                    <span
                      key={day}
                      className="bg-dolphin-ocean/10 text-dolphin-ocean text-xs px-2 py-0.5 rounded-full"
                    >
                      {DAY_LABELS[day] || day}
                    </span>
                  ))}
                </div>
                {task.time && (
                  <p className="text-xs text-dolphin-sand-dark mt-1">
                    ⏰ {task.time}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => toggleActive(task)}
                  className="p-2 rounded-lg hover:bg-dolphin-sand-light transition-colors"
                  title={task.is_active ? "השהי" : "הפעילי"}
                >
                  {task.is_active ? (
                    <Pause size={16} className="text-dolphin-sand-dark" />
                  ) : (
                    <Play size={16} className="text-dolphin-sea" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} className="text-dolphin-urgent" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomTabs />
    </div>
  );
}
