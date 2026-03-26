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
      <div className={`text-center py-12 text-sm ${isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]"}`}>
        loading...
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
      {/* Mobile: vertical stack. Desktop: grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
        {week.map((day, i) => (
          <div key={day.date} className="animate-fade-up no-color-transition" style={{ animationDelay: `${i * 50}ms` }}>
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

      {/* Progress bar */}
      {totalThisWeek > 0 && (
        <div className={`mt-4 rounded-2xl p-4 ${isDay ? "bg-white/60" : "bg-[#2a2035]/60"}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDay ? "text-[#4a7a8a]" : "text-[#c8a88a]"}`}>
              {completedThisWeek} / {totalThisWeek}
            </span>
            <span className={`text-xs ${isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]"}`}>
              {Math.round((completedThisWeek / totalThisWeek) * 100)}%
            </span>
          </div>
          <div className={`h-1.5 rounded-full overflow-hidden ${isDay ? "bg-[#d8eef5]" : "bg-[#3a2540]"}`}>
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isDay
                  ? "bg-gradient-to-l from-[#2196c8] to-[#47b8e0]"
                  : "bg-gradient-to-l from-[#c2185b] to-[#e65100]"
              }`}
              style={{ width: `${(completedThisWeek / totalThisWeek) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
