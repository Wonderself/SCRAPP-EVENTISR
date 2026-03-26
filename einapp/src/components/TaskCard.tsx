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
      className={`w-full flex items-center gap-2 p-2.5 rounded-xl transition-all active:scale-[0.97] text-right ${
        task.completed
          ? isDay
            ? "bg-cyan-50/50 opacity-50"
            : "bg-white/[0.02] opacity-40"
          : isUrgent
          ? isDay
            ? "bg-red-50 border border-red-200"
            : "bg-red-500/5 border border-red-500/15"
          : isDay
          ? "bg-white/80 border border-cyan-50"
          : "bg-white/[0.04] border border-white/5"
      }`}
    >
      {/* Checkbox */}
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
          task.completed
            ? "bg-emerald-500 text-white"
            : isUrgent
            ? "border-2 border-red-300"
            : isDay
            ? "border-2 border-cyan-200"
            : "border-2 border-white/15"
        }`}
      >
        {task.completed && <Check size={11} strokeWidth={3} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs leading-snug truncate ${
            task.completed
              ? "line-through " + (isDay ? "text-cyan-300" : "text-white/20")
              : isDay
              ? "text-cyan-900"
              : "text-white/80"
          }`}
        >
          {task.description}
        </p>
        {task.time && (
          <p className={`text-[10px] mt-0.5 ${isDay ? "text-cyan-300" : "text-white/20"}`}>
            {task.time}
          </p>
        )}
      </div>

      {/* Icons */}
      {isUrgent && !task.completed && (
        <AlertCircle size={13} className="text-red-400 shrink-0" />
      )}
      {isRecurring && !isUrgent && (
        <RefreshCw size={11} className={`shrink-0 ${isDay ? "text-cyan-200" : "text-white/15"}`} />
      )}
    </button>
  );
}
