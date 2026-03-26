"use client";

import type { Task } from "@/types";
import TaskCard from "./TaskCard";
import { getDayShort, getDayName } from "@/lib/hebrew";

interface Props {
  date: string;
  dayIndex: number;
  tasks: (Task & { completed: boolean })[];
  isToday: boolean;
  onToggle: (taskId: number, date: string) => void;
}

export default function DayColumn({ date, dayIndex, tasks, isToday, onToggle }: Props) {
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
      className={`rounded-xl p-3 min-w-0 ${
        isToday
          ? "bg-dolphin-ocean/10 border-2 border-dolphin-ocean"
          : "bg-white border border-dolphin-sand-light"
      }`}
    >
      <div className="text-center mb-2">
        <div className={`text-xs font-medium ${isToday ? "text-dolphin-ocean" : "text-dolphin-sand-dark"}`}>
          {getDayShort(dayIndex)}
        </div>
        <div className={`text-lg font-bold ${isToday ? "text-dolphin-ocean-dark" : "text-gray-700"}`}>
          {dayNum}
        </div>
      </div>

      <div className="space-y-1.5">
        {sorted.length === 0 && (
          <p className="text-xs text-dolphin-sand-dark text-center py-2">—</p>
        )}
        {sorted.map((task) => (
          <TaskCard key={`${task.id}-${date}`} task={task} date={date} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}
