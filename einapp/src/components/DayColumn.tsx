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
      className={`rounded-2xl lg:rounded-3xl p-2.5 lg:p-4 min-w-[100px] lg:min-w-0 transition-all ${
        isToday
          ? isDay
            ? "bg-white border-2 border-sky-200 shadow-[0_4px_20px_rgba(14,165,233,0.12)]"
            : "bg-white/[0.08] backdrop-blur-sm border-2 border-fuchsia-400/20 shadow-[0_4px_20px_rgba(217,70,239,0.1)]"
          : isDay
          ? "bg-white/70 border border-sky-100 shadow-sm"
          : "bg-white/[0.04] backdrop-blur-sm border border-white/[0.06]"
      }`}
    >
      {/* Day header */}
      <div className="text-center mb-1.5 lg:mb-2.5">
        <div className={`text-[10px] lg:text-sm font-black uppercase ${
          isToday
            ? isDay ? "text-sky-500" : "text-fuchsia-400"
            : isDay ? "text-sky-300" : "text-white/20"
        }`}>
          {getDayShort(dayIndex)}
        </div>
        <div className={`text-xl lg:text-3xl font-black mt-0.5 ${
          isToday
            ? isDay ? "text-sky-600" : "text-fuchsia-300"
            : isDay ? "text-sky-800" : "text-white/60"
        }`}>
          {dayNum}
        </div>
        {isToday && (
          <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-0.5 ${
            isDay ? "bg-sky-400" : "bg-orange-400"
          }`} />
        )}
      </div>

      {/* Tasks */}
      <div className="space-y-1">
        {sorted.length === 0 && (
          <p className={`text-[10px] text-center py-1 font-bold ${isDay ? "text-sky-200" : "text-white/10"}`}>
            ---
          </p>
        )}
        {sorted.map((task) => (
          <TaskCard key={`${task.id}-${date}`} task={task} date={date} isDay={isDay} onToggle={onToggle} />
        ))}
      </div>

      {/* Mini progress */}
      {total > 0 && (
        <div className="mt-1.5 flex justify-center">
          <span className={`text-[10px] lg:text-sm font-black ${isDay ? "text-sky-400" : "text-orange-400/40"}`}>
            {completed}/{total}
          </span>
        </div>
      )}
    </div>
  );
}
