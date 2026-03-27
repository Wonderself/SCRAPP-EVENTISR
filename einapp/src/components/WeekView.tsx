"use client";

import { useEffect, useState } from "react";
import DayColumn from "./DayColumn";
import TaskCard from "./TaskCard";
import { toDateString, getDayName } from "@/lib/hebrew";
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

  async function handleDelete(taskId: number) {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id: taskId }),
    });
    fetchWeek();
  }

  async function handleUpdate(taskId: number, updates: { description?: string; priority?: string }) {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id: taskId, updates }),
    });
    fetchWeek();
  }

  if (loading) {
    return (
      <div className={`text-center py-4 text-base font-black ${isDay ? "text-sky-300" : "text-white/35"}`}>
        ...
      </div>
    );
  }

  const todayData = week.find((d) => d.date === today);
  const otherDays = week.filter((d) => d.date !== today);

  const completedThisWeek = week.reduce(
    (sum, day) => sum + day.tasks.filter((t) => t.completed).length, 0
  );
  const totalThisWeek = week.reduce((sum, day) => sum + day.tasks.length, 0);

  const todayCompleted = todayData ? todayData.tasks.filter(t => t.completed).length : 0;
  const todayTotal = todayData ? todayData.tasks.length : 0;

  return (
    <div className="space-y-3">
      {/* TODAY — BIG SECTION */}
      {todayData && (
        <div className={`rounded-[20px] lg:rounded-[28px] p-4 lg:p-6 ${
          isDay
            ? "bg-gradient-to-br from-sky-50 to-cyan-50 border-2 border-sky-300 shadow-lg shadow-sky-200/40"
            : "bg-gradient-to-br from-fuchsia-500/10 to-violet-500/10 border-2 border-fuchsia-400/30 shadow-lg shadow-fuchsia-500/10"
        }`}>
          {/* Today header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${isDay ? "bg-sky-400" : "bg-fuchsia-400"}`} />
              <h3 className={`text-lg lg:text-xl font-black ${isDay ? "text-sky-700" : "text-fuchsia-300"}`}>
                היום — {getDayName(todayData.dayIndex)}
              </h3>
            </div>
            {todayTotal > 0 && (
              <span className={`text-sm lg:text-base font-black ${isDay ? "text-sky-500" : "text-fuchsia-400"}`}>
                {todayCompleted}/{todayTotal}
              </span>
            )}
          </div>

          {/* Today progress bar */}
          {todayTotal > 0 && (
            <div className={`h-2 rounded-full overflow-hidden mb-3 ${isDay ? "bg-sky-100" : "bg-white/10"}`}>
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isDay
                    ? "bg-gradient-to-r from-sky-400 to-teal-400"
                    : "bg-gradient-to-r from-fuchsia-500 to-violet-600"
                }`}
                style={{ width: `${todayTotal > 0 ? (todayCompleted / todayTotal) * 100 : 0}%` }}
              />
            </div>
          )}

          {/* Today tasks — full size */}
          <div className="space-y-1.5">
            {todayData.tasks.length === 0 ? (
              <p className={`text-center py-4 text-sm font-bold ${isDay ? "text-sky-300" : "text-white/30"}`}>
                אין משימות להיום! 🎉 יום חופשי מאמי
              </p>
            ) : (
              [...todayData.tasks]
                .sort((a, b) => {
                  if (a.completed !== b.completed) return a.completed ? 1 : -1;
                  if (a.priority === "urgent" && b.priority !== "urgent") return -1;
                  if (b.priority === "urgent" && a.priority !== "urgent") return 1;
                  if (a.time && b.time) return a.time.localeCompare(b.time);
                  if (a.time) return -1;
                  if (b.time) return 1;
                  return 0;
                })
                .map((task) => (
                  <TaskCard
                    key={`today-${task.id}`}
                    task={task}
                    date={today}
                    isDay={isDay}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                ))
            )}
          </div>
        </div>
      )}

      {/* OTHER DAYS — compact horizontal scroll */}
      <div>
        <h3 className={`text-xs lg:text-sm font-bold mb-2 ${isDay ? "text-sky-900/50" : "text-white/30"}`}>
          שאר השבוע
        </h3>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 lg:grid lg:grid-cols-6 lg:gap-3 lg:overflow-visible">
          {otherDays.map((day, i) => (
            <div
              key={day.date}
              className="flex-shrink-0 lg:flex-shrink animate-fade-up no-color-transition"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <DayColumn
                date={day.date}
                dayIndex={day.dayIndex}
                tasks={day.tasks}
                isToday={false}
                isDay={isDay}
                compact
                onToggle={handleToggle}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Weekly progress */}
      {totalThisWeek > 0 && (
        <div className={`rounded-xl lg:rounded-2xl p-3 lg:p-4 ${
          isDay
            ? "bg-white border-2 border-sky-100 shadow-sm"
            : "bg-white/10 backdrop-blur-sm border-2 border-white/15"
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs lg:text-base font-black ${isDay ? "text-sky-700" : "text-white/80"}`}>
              סה״כ שבועי: {completedThisWeek} / {totalThisWeek}
            </span>
            <span className={`text-xs lg:text-base font-black ${isDay ? "text-sky-500" : "text-fuchsia-400"}`}>
              {Math.round((completedThisWeek / totalThisWeek) * 100)}%
            </span>
          </div>
          <div className={`h-2 lg:h-3 rounded-full overflow-hidden ${isDay ? "bg-sky-100" : "bg-white/15"}`}>
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isDay
                  ? "bg-gradient-to-r from-sky-400 to-teal-400"
                  : "bg-gradient-to-r from-fuchsia-500 to-violet-600"
              }`}
              style={{ width: `${(completedThisWeek / totalThisWeek) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
