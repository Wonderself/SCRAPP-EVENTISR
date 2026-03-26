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
      className={`w-full flex items-center gap-2 p-2 lg:p-3 rounded-xl transition-all active:scale-[0.98] text-right ${
        task.completed
          ? isDay
            ? "bg-sky-50/50 opacity-60"
            : "bg-white/[0.03] opacity-50"
          : isUrgent
          ? isDay
            ? "bg-red-50/80 border border-red-200/40"
            : "bg-red-500/[0.08] border border-red-500/15"
          : isDay
          ? "bg-sky-50/60 border border-sky-100/60"
          : "bg-white/[0.06] border border-white/10"
      }`}
    >
      {/* Checkbox */}
      <div
        className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
          task.completed
            ? isDay ? "bg-emerald-400" : "bg-emerald-500"
            : isDay
            ? "border-2 border-sky-200"
            : "border-2 border-white/20"
        }`}
      >
        {task.completed && <Check size={12} strokeWidth={3} className="text-white" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs lg:text-sm leading-snug font-semibold ${
            task.completed
              ? "line-through " + (isDay ? "text-sky-300" : "text-white/35")
              : isDay
              ? "text-sky-800"
              : "text-white/80"
          }`}
        >
          {task.description}
        </p>
        {task.time && (
          <p className={`text-[10px] lg:text-xs mt-0.5 font-bold ${isDay ? "text-sky-400" : "text-white/40"}`}>
            {task.time}
          </p>
        )}
      </div>

      {/* Icons */}
      {isUrgent && !task.completed && (
        <AlertCircle size={14} className="text-red-400 shrink-0" />
      )}
      {isRecurring && !isUrgent && (
        <RefreshCw size={12} className={`shrink-0 ${isDay ? "text-sky-300" : "text-white/30"}`} />
      )}
    </button>
  );
}
