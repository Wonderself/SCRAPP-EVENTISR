"use client";

import { useEffect, useState } from "react";
import DayColumn from "./DayColumn";
import { toDateString } from "@/lib/hebrew";
import type { Task } from "@/types";

interface DayData {
  date: string;
  dayIndex: number;
  tasks: (Task & { completed: boolean })[];
}

interface Props {
  isDay: boolean;
  refreshKey: number;
}

export default function WeekView({ isDay, refreshKey }: Props) {
  const [week, setWeek] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const today = toDateString(new Date());

  async function fetchWeek() {
    const res = await fetch("/api/tasks?action=week");
    const data = await res.json();
    setWeek(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchWeek();
  }, [refreshKey]);

  async function handleToggle(taskId: number, date: string) {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", task_id: taskId, date }),
    });
    fetchWeek();
  }

  if (loading) {
    return (
      <div className={`text-center py-8 text-sm ${isDay ? "text-cyan-300" : "text-white/20"}`}>
        ...
      </div>
    );
  }

  const completedThisWeek = week.reduce(
    (sum, day) => sum + day.tasks.filter((t) => t.completed).length,
    0
  );
  const totalThisWeek = week.reduce((sum, day) => sum + day.tasks.length, 0);

  return (
    <div>
      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 lg:grid lg:grid-cols-7 lg:overflow-visible">
        {week.map((day, i) => (
          <div
            key={day.date}
            className="flex-shrink-0 lg:flex-shrink animate-fade-up no-color-transition"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <DayColumn
              date={day.date}
              dayIndex={day.dayIndex}
              tasks={day.tasks}
              isToday={day.date === today}
              isDay={isDay}
              onToggle={handleToggle}
            />
          </div>
        ))}
      </div>

      {/* Weekly progress */}
      {totalThisWeek > 0 && (
        <div className={`mt-3 rounded-xl p-3 ${isDay ? "bg-white/50" : "bg-white/[0.03]"}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-semibold ${isDay ? "text-cyan-700" : "text-orange-200"}`}>
              {completedThisWeek} / {totalThisWeek}
            </span>
            <span className={`text-xs font-bold ${isDay ? "text-cyan-500" : "text-orange-400"}`}>
              {Math.round((completedThisWeek / totalThisWeek) * 100)}%
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${isDay ? "bg-cyan-100" : "bg-white/5"}`}>
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isDay
                  ? "bg-gradient-to-r from-cyan-400 to-teal-400"
                  : "bg-gradient-to-r from-orange-400 to-pink-500"
              }`}
              style={{ width: `${(completedThisWeek / totalThisWeek) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
