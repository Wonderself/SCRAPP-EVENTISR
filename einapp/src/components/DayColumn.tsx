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

  return (
    <div
      className={`rounded-2xl p-3 min-w-0 transition-all ${
        isToday
          ? isDay
            ? "bg-[#2196c8]/8 border-2 border-[#2196c8]/30 shadow-sm shadow-[#2196c8]/10"
            : "bg-[#e65100]/8 border-2 border-[#e65100]/30 shadow-sm shadow-[#e65100]/10"
          : isDay
          ? "bg-white/60 border border-[#d8eef5]"
          : "bg-[#2a2035]/60 border border-[#3a2540]"
      }`}
    >
      <div className="text-center mb-3">
        <div className={`text-xs lg:text-sm font-semibold uppercase tracking-wider ${
          isToday
            ? isDay ? "text-[#2196c8]" : "text-[#e65100]"
            : isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]"
        }`}>
          {getDayShort(dayIndex)}
        </div>
        <div className={`text-xl lg:text-2xl font-bold mt-0.5 ${
          isToday
            ? isDay ? "text-[#1a7fb5]" : "text-[#ff8f00]"
            : isDay ? "text-[#1a3a4a]" : "text-[#f5e6d8]"
        }`}>
          {dayNum}
        </div>
        {isToday && (
          <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${
            isDay ? "bg-[#2196c8]" : "bg-[#e65100]"
          }`} />
        )}
      </div>

      <div className="space-y-1.5">
        {sorted.length === 0 && (
          <p className={`text-[10px] text-center py-3 ${isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]"}`}>
            —
          </p>
        )}
        {sorted.map((task) => (
          <TaskCard key={`${task.id}-${date}`} task={task} date={date} isDay={isDay} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}
