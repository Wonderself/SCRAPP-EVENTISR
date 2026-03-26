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

export default function WeekView() {
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
  }, []);

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
      <div className="text-center py-8 text-dolphin-sand-dark">טוען... 🐬</div>
    );
  }

  const completedThisWeek = week.reduce(
    (sum, day) => sum + day.tasks.filter((t) => t.completed).length,
    0
  );

  return (
    <div>
      {/* Mobile: vertical stack. Desktop: grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
        {week.map((day) => (
          <DayColumn
            key={day.date}
            date={day.date}
            dayIndex={day.dayIndex}
            tasks={day.tasks}
            isToday={day.date === today}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Encouragement card */}
      <div className="mt-4 bg-dolphin-sunset-light/30 rounded-xl p-4 text-center">
        <p className="text-dolphin-earth">
          {completedThisWeek === 0
            ? "שבוע חדש! יאללה 💪"
            : completedThisWeek >= 10
            ? `עשית ${completedThisWeek} דברים השבוע! את אלופה! 🎉`
            : `עשית ${completedThisWeek} דברים השבוע! 💪`}
        </p>
      </div>
    </div>
  );
}
