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
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] text-right ${
        task.completed
          ? isDay
            ? "bg-[#f5f9fb] opacity-60"
            : "bg-[#1a1520] opacity-50"
          : isUrgent
          ? isDay
            ? "bg-[#fff5f5] border border-[#e53935]/20"
            : "bg-[#2a1520] border border-[#e53935]/20"
          : isDay
          ? "bg-white border border-[#d8eef5]"
          : "bg-[#2a2035] border border-[#3a2540]"
      }`}
    >
      {/* Checkbox */}
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
          task.completed
            ? "bg-[#43a047] text-white"
            : isDay
            ? "border-2 border-[#d8eef5]"
            : "border-2 border-[#3a2540]"
        }`}
      >
        {task.completed && <Check size={13} strokeWidth={3} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${
            task.completed
              ? "line-through " + (isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]")
              : isDay
              ? "text-[#1a3a4a]"
              : "text-[#f5e6d8]"
          }`}
        >
          {task.description}
        </p>
        {task.time && (
          <p className={`text-[11px] mt-0.5 ${isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]"}`}>
            {task.time}
          </p>
        )}
      </div>

      {/* Icons */}
      {isUrgent && !task.completed && (
        <AlertCircle size={16} className="text-[#e53935] shrink-0" />
      )}
      {isRecurring && !isUrgent && (
        <RefreshCw size={13} className={`shrink-0 ${isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]"}`} />
      )}
    </button>
  );
}
