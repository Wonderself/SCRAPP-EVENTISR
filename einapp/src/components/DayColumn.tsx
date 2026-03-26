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
    if (a.type === "one_time" && b.type === "recurring") return -1;
    if (b.type === "one_time" && a.type === "recurring") return 1;
    return 0;
  });

  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;

  return (
    <div
      className={`rounded-2xl p-3 min-w-[110px] transition-all ${
        isToday
          ? isDay
            ? "bg-gradient-to-b from-cyan-50 to-white border-2 border-cyan-300 shadow-md shadow-cyan-100/50"
            : "bg-gradient-to-b from-orange-500/10 to-transparent border-2 border-orange-400/30 shadow-md shadow-orange-500/10"
          : isDay
          ? "bg-white/50 border border-cyan-100"
          : "bg-white/[0.03] border border-white/5"
      }`}
    >
      {/* Day header */}
      <div className="text-center mb-2.5">
        <div
          className={`text-[11px] font-bold uppercase tracking-wider ${
            isToday
              ? isDay ? "text-cyan-500" : "text-orange-400"
              : isDay ? "text-cyan-300" : "text-white/25"
          }`}
        >
          {getDayShort(dayIndex)}
        </div>
        <div
          className={`text-2xl font-extrabold mt-0.5 ${
            isToday
              ? isDay ? "text-cyan-700" : "text-orange-300"
              : isDay ? "text-cyan-900" : "text-white/70"
          }`}
        >
          {dayNum}
        </div>
        {isToday && (
          <div
            className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${
              isDay ? "bg-cyan-500" : "bg-orange-400"
            }`}
          />
        )}
      </div>

      {/* Tasks */}
      <div className="space-y-1.5">
        {sorted.length === 0 && (
          <p className={`text-[10px] text-center py-2 ${isDay ? "text-cyan-200" : "text-white/10"}`}>
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
          <span className={`text-[10px] font-semibold ${
            isDay ? "text-cyan-400" : "text-orange-400/50"
          }`}>
            {completed}/{total}
          </span>
        </div>
      )}
    </div>
  );
}
