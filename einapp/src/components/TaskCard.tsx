"use client";

import type { Task } from "@/types";

interface Props {
  task: Task & { completed: boolean };
  date: string;
  onToggle: (taskId: number, date: string) => void;
}

export default function TaskCard({ task, date, onToggle }: Props) {
  const isUrgent = task.priority === "urgent";
  const isRecurring = task.type === "recurring";

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
        isUrgent
          ? "border-r-4 border-dolphin-urgent bg-red-50"
          : isRecurring
          ? "bg-dolphin-ocean/5"
          : "bg-white"
      } ${task.completed ? "opacity-60" : ""}`}
    >
      <button
        onClick={() => onToggle(task.id, date)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          task.completed
            ? "bg-dolphin-sea border-dolphin-sea text-white"
            : "border-dolphin-sand-dark"
        }`}
      >
        {task.completed && <span className="text-xs">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${
            task.completed ? "line-through text-dolphin-sand-dark" : "text-gray-800"
          }`}
        >
          {isUrgent && !task.completed && "🔴 "}
          {isRecurring && "🔄 "}
          {task.description}
        </p>
        {task.time && (
          <p className="text-xs text-dolphin-sand-dark">{task.time}</p>
        )}
      </div>
    </div>
  );
}
