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
  onStreakUpdate?: (streak: number) => void;
  onTaskToggle?: (completed: boolean) => void;
}

export default function WeekView({ isDay, refreshKey, onStreakUpdate, onTaskToggle }: Props) {
  const [week, setWeek] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const today = toDateString(new Date());

  function updateStreak(weekData: DayData[]) {
    if (!onStreakUpdate) return;
    const todayData = weekData.find((d) => d.date === today);
    const todayCompleted = todayData ? todayData.tasks.filter(t => t.completed).length : 0;
    const todayStr = new Date().toISOString().split("T")[0];

    try {
      const saved = localStorage.getItem("einapp_streak");
      const data = saved ? JSON.parse(saved) : { count: 0, lastDate: "" };
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (todayCompleted > 0) {
        if (data.lastDate === todayStr) {
          onStreakUpdate(data.count);
        } else if (data.lastDate === yesterdayStr || data.lastDate === "") {
          const newCount = data.count + 1;
          localStorage.setItem("einapp_streak", JSON.stringify({ count: newCount, lastDate: todayStr }));
          onStreakUpdate(newCount);
        } else {
          localStorage.setItem("einapp_streak", JSON.stringify({ count: 1, lastDate: todayStr }));
          onStreakUpdate(1);
        }
      } else {
        if (data.lastDate === todayStr || data.lastDate === yesterdayStr) {
          onStreakUpdate(data.count);
        } else {
          onStreakUpdate(0);
        }
      }
    } catch {}
  }

  function cacheWeek(data: DayData[]) {
    try {
      localStorage.setItem("einapp_week_cache", JSON.stringify({ data, ts: Date.now() }));
    } catch {}
  }

  function loadCachedWeek(): DayData[] | null {
    try {
      const cached = localStorage.getItem("einapp_week_cache");
      if (!cached) return null;
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts > 3600000) return null; // 1 hour max
      return data;
    } catch { return null; }
  }

  async function fetchWeek() {
    try {
      const res = await fetch("/api/tasks?action=week");
      const data = await res.json();
      setWeek(data);
      cacheWeek(data);
      updateStreak(data);
    } catch {
      const cached = loadCachedWeek();
      if (cached) setWeek(cached);
    }
    setLoading(false);
  }

  useEffect(() => {
    const cached = loadCachedWeek();
    if (cached && loading) {
      setWeek(cached);
      setLoading(false);
    }
    fetchWeek();
  }, [refreshKey]);

  async function handleToggle(taskId: number, date: string) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", task_id: taskId, date }),
    });
    const data = await res.json();
    onTaskToggle?.(data.completed);
    await fetchWeek();
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
    <div className="space-y-2 sm:space-y-3">
      {/* TODAY — BIG SECTION */}
      {todayData && (
        <div className={`rounded-2xl sm:rounded-[20px] lg:rounded-[28px] p-3 sm:p-4 lg:p-6 ${
          isDay
            ? "bg-gradient-to-br from-sky-50 to-cyan-50 border-2 border-sky-300 shadow-lg shadow-sky-200/40"
            : "bg-gradient-to-br from-fuchsia-500/10 to-violet-500/10 border-2 border-fuchsia-400/30 shadow-lg shadow-fuchsia-500/10"
        }`}>
          {/* Today header */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full animate-pulse ${isDay ? "bg-sky-400" : "bg-fuchsia-400"}`} />
              <h3 className={`text-base sm:text-lg lg:text-xl font-black ${isDay ? "text-sky-700" : "text-fuchsia-300"}`}>
                היום — {getDayName(todayData.dayIndex)}
              </h3>
            </div>
            {todayTotal > 0 && (
              <span className={`text-xs sm:text-sm lg:text-base font-black ${isDay ? "text-sky-500" : "text-fuchsia-400"}`}>
                {todayCompleted}/{todayTotal}
              </span>
            )}
          </div>

          {/* Today progress bar */}
          {todayTotal > 0 && (
            <div className={`h-1.5 sm:h-2 rounded-full overflow-hidden mb-2 sm:mb-3 ${isDay ? "bg-sky-100" : "bg-white/10"}`}>
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
          <div className="space-y-1 sm:space-y-1.5">
            {todayData.tasks.length === 0 ? (
              <p className={`text-center py-3 text-xs sm:text-sm font-bold ${isDay ? "text-sky-300" : "text-white/30"}`}>
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
        <h3 className={`text-[11px] sm:text-xs lg:text-sm font-bold mb-1.5 sm:mb-2 ${isDay ? "text-sky-900/50" : "text-white/30"}`}>
          שאר השבוע
        </h3>
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto hide-scrollbar pb-1 lg:grid lg:grid-cols-6 lg:gap-3 lg:overflow-visible">
          {otherDays.map((day, i) => (
            <div
              key={day.date}
              className="flex-shrink-0 w-[72px] sm:w-auto lg:flex-shrink animate-fade-up no-color-transition"
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
        <div className={`rounded-xl lg:rounded-2xl p-2.5 sm:p-3 lg:p-4 ${
          isDay
            ? "bg-white border-2 border-sky-100 shadow-sm"
            : "bg-white/10 backdrop-blur-sm border-2 border-white/15"
        }`}>
          <div className="flex items-center justify-between mb-1 sm:mb-1.5">
            <span className={`text-[11px] sm:text-xs lg:text-base font-black ${isDay ? "text-sky-700" : "text-white/80"}`}>
              סה״כ שבועי: {completedThisWeek} / {totalThisWeek}
            </span>
            <span className={`text-[11px] sm:text-xs lg:text-base font-black ${isDay ? "text-sky-500" : "text-fuchsia-400"}`}>
              {Math.round((completedThisWeek / totalThisWeek) * 100)}%
            </span>
          </div>
          <div className={`h-1.5 sm:h-2 lg:h-3 rounded-full overflow-hidden ${isDay ? "bg-sky-100" : "bg-white/15"}`}>
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
