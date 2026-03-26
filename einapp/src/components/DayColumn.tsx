"use client";

import type { Task } from "@/types";
import TaskCard from "./TaskCard";
import { getDayShort } from "@/lib/hebrew";

interface Props {
  date: string;
  dayIndex: number;
  tasks: (Task & { completed: boolean })[];
  isToday: boolean;
  isDay: boolean;
  onToggle: (taskId: number, date: string) => void;
}

export default function DayColumn({ date, dayIndex, tasks, isToday, isDay, onToggle }: Props) {
  const dayNum = new Date(date + "T12:00:00").getDate();
  const sorted = [...tasks].sort((a, b) => {
    if (a.priority === "urgent" && b.priority !== "urgent") return -1;
    if (b.priority === "urgent" && a.priority !== "urgent") return 1;
    return 0;
  });

  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;

  return (
    <div
      className={`rounded-3xl p-3 lg:p-4 min-w-[120px] lg:min-w-0 transition-all ${
        isToday
          ? isDay
            ? "bg-sky-50 border-3 border-sky-300 shadow-[0_4px_0_#bae6fd]"
            : "bg-orange-500/5 border-3 border-orange-400/30 shadow-[0_4px_0_rgba(251,146,60,0.1)]"
          : isDay
          ? "bg-white border-3 border-sky-100 shadow-[0_3px_0_#e0f2fe]"
          : "bg-[#1e1330] border-3 border-white/5 shadow-[0_3px_0_rgba(255,255,255,0.02)]"
      }`}
    >
      {/* Day header */}
      <div className="text-center mb-2.5">
        <div className={`text-xs lg:text-sm font-black uppercase ${
          isToday
            ? isDay ? "text-sky-500" : "text-orange-400"
            : isDay ? "text-sky-300" : "text-white/20"
        }`}>
          {getDayShort(dayIndex)}
        </div>
        <div className={`text-2xl lg:text-4xl font-black mt-0.5 ${
          isToday
            ? isDay ? "text-sky-600" : "text-orange-300"
            : isDay ? "text-sky-800" : "text-white/60"
        }`}>
          {dayNum}
        </div>
        {isToday && (
          <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
            isDay ? "bg-sky-400" : "bg-orange-400"
          }`} />
        )}
      </div>

      {/* Tasks */}
      <div className="space-y-1.5">
        {sorted.length === 0 && (
          <p className={`text-xs text-center py-2 font-bold ${isDay ? "text-sky-200" : "text-white/10"}`}>
            ---
          </p>
        )}
        {sorted.map((task) => (
          <TaskCard key={`${task.id}-${date}`} task={task} date={date} isDay={isDay} onToggle={onToggle} />
        ))}
      </div>

      {/* Mini progress */}
      {total > 0 && (
        <div className="mt-2 flex justify-center">
          <span className={`text-xs lg:text-sm font-black ${isDay ? "text-sky-400" : "text-orange-400/40"}`}>
            {completed}/{total}
          </span>
        </div>
      )}
    </div>
  );
}
