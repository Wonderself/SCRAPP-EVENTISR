"use client";

import { useState } from "react";
import { Check, AlertCircle, RefreshCw, Trash2, Pencil, X } from "lucide-react";
import type { Task } from "@/types";

interface Props {
  task: Task & { completed: boolean };
  date: string;
  isDay: boolean;
  compact?: boolean;
  onToggle: (taskId: number, date: string) => void;
  onDelete?: (taskId: number) => void;
  onUpdate?: (taskId: number, updates: { description?: string; priority?: string }) => void;
}

export default function TaskCard({ task, date, isDay, compact, onToggle, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.description);
  const [showActions, setShowActions] = useState(false);
  const isUrgent = task.priority === "urgent";
  const isRecurring = task.type === "recurring";

  function handleSaveEdit() {
    if (editText.trim() && onUpdate) {
      onUpdate(task.id, { description: editText.trim() });
    }
    setEditing(false);
    setShowActions(false);
  }

  if (editing) {
    return (
      <div className={`w-full p-2 lg:p-3 rounded-xl ${isDay ? "bg-sky-50/80 border border-sky-200" : "bg-white/15 border border-white/20"}`}>
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
          className={`w-full text-xs lg:text-sm font-semibold outline-none bg-transparent text-right ${isDay ? "text-sky-800" : "text-white"}`}
          autoFocus
          dir="rtl"
        />
        <div className="flex gap-1 mt-1.5 justify-end">
          <button onClick={handleSaveEdit} className={`px-2 py-1 rounded-lg text-[10px] font-bold ${isDay ? "bg-sky-400 text-white" : "bg-fuchsia-500 text-white"}`}>שמור</button>
          <button onClick={() => { setEditing(false); setEditText(task.description); }} className={`px-2 py-1 rounded-lg text-[10px] font-bold ${isDay ? "bg-sky-100 text-sky-600" : "bg-white/10 text-white/60"}`}>ביטול</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full flex items-center gap-2 p-2 lg:p-3 rounded-xl transition-all text-right ${
        task.completed
          ? isDay ? "bg-sky-50/50 opacity-60" : "bg-white/[0.06] opacity-60"
          : isUrgent
          ? isDay ? "bg-red-50/80 border border-red-200/40" : "bg-red-500/10 border border-red-500/20"
          : isDay ? "bg-sky-50/60 border border-sky-100/60" : "bg-white/10 border border-white/15"
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id, date)}
        className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
          task.completed
            ? isDay ? "bg-emerald-400" : "bg-emerald-500"
            : isDay ? "border-2 border-sky-200 hover:border-sky-400" : "border-2 border-white/20 hover:border-white/40"
        }`}
      >
        {task.completed && <Check size={12} strokeWidth={3} className="text-white" />}
      </button>

      {/* Content — tap to show actions */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !compact && setShowActions(!showActions)}>
        <p className={`text-xs lg:text-sm leading-snug font-semibold ${
          task.completed
            ? "line-through " + (isDay ? "text-sky-300" : "text-white/35")
            : isDay ? "text-sky-800" : "text-white/80"
        }`}>
          {task.description}
        </p>
        {task.time && (
          <p className={`text-[10px] lg:text-xs mt-0.5 font-bold ${isDay ? "text-sky-400" : "text-white/40"}`}>
            🕐 {task.time}
          </p>
        )}
      </div>

      {/* Status icons */}
      {!showActions && isUrgent && !task.completed && (
        <AlertCircle size={14} className="text-red-400 shrink-0" />
      )}
      {!showActions && isRecurring && !isUrgent && (
        <RefreshCw size={12} className={`shrink-0 ${isDay ? "text-sky-300" : "text-white/30"}`} />
      )}

      {/* Action buttons */}
      {showActions && !compact && (
        <div className="flex gap-1 shrink-0">
          {onUpdate && (
            <button
              onClick={(e) => { e.stopPropagation(); setEditing(true); }}
              className={`p-1.5 rounded-lg transition-all ${isDay ? "hover:bg-sky-100 text-sky-400" : "hover:bg-white/10 text-white/40"}`}
            >
              <Pencil size={13} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("למחוק את המשימה?")) onDelete(task.id);
              }}
              className={`p-1.5 rounded-lg transition-all ${isDay ? "hover:bg-red-100 text-red-400" : "hover:bg-red-500/20 text-red-400/60"}`}
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setShowActions(false); }}
            className={`p-1.5 rounded-lg ${isDay ? "text-sky-300" : "text-white/30"}`}
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
