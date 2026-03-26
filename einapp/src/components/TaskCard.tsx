"use client";

import { Check, AlertCircle, RefreshCw } from "lucide-react";
import type { Task } from "@/types";

interface Props {
  task: Task & { completed: boolean };
  date: string;
  isDay: boolean;
  onToggle: (taskId: number, date: string) => void;
}

export default function TaskCard({ task, date, isDay, onToggle }: Props) {
  const isUrgent = task.priority === "urgent";
  const isRecurring = task.type === "recurring";

  return (
    <button
      onClick={() => onToggle(task.id, date)}
      className={`cartoon-btn w-full flex items-center gap-2 p-2.5 rounded-xl transition-all text-right ${
        task.completed
          ? isDay
            ? "bg-sky-50 opacity-50"
            : "bg-white/[0.02] opacity-40"
          : isUrgent
          ? isDay
            ? "bg-red-50 border-2 border-red-200"
            : "bg-red-500/5 border-2 border-red-500/15"
          : isDay
          ? "bg-sky-50 border-2 border-sky-100"
          : "bg-white/[0.03] border-2 border-white/5"
      }`}
    >
      {/* Checkbox */}
      <div
        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
          task.completed
            ? "bg-emerald-400 text-white shadow-[0_2px_0_#16a34a]"
            : isUrgent
            ? "border-3 border-red-300"
            : isDay
            ? "border-3 border-sky-200"
            : "border-3 border-white/15"
        }`}
      >
        {task.completed && <Check size={13} strokeWidth={3.5} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs lg:text-sm font-bold leading-snug truncate ${
          task.completed
            ? "line-through " + (isDay ? "text-sky-300" : "text-white/20")
            : isDay ? "text-sky-800" : "text-white/80"
        }`}>
          {task.description}
        </p>
        {task.time && (
          <p className={`text-[10px] lg:text-xs mt-0.5 font-bold ${isDay ? "text-sky-300" : "text-white/15"}`}>
            {task.time}
          </p>
        )}
      </div>

      {isUrgent && !task.completed && <AlertCircle size={14} className="text-red-400 shrink-0" />}
      {isRecurring && !isUrgent && <RefreshCw size={12} className={`shrink-0 ${isDay ? "text-sky-200" : "text-white/10"}`} />}
    </button>
  );
}
