"use client";

import { useState } from "react";
import { X } from "lucide-react";

const DAYS = [
  { key: "sunday", label: "א" },
  { key: "monday", label: "ב" },
  { key: "tuesday", label: "ג" },
  { key: "wednesday", label: "ד" },
  { key: "thursday", label: "ה" },
  { key: "friday", label: "ו" },
  { key: "saturday", label: "ש" },
];

interface Props {
  open: boolean;
  isDay: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function AddTaskModal({ open, isDay, onClose, onCreated }: Props) {
  const [type, setType] = useState<"one_time" | "recurring">("one_time");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  function toggleDay(day: string) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSave() {
    if (!description.trim()) return;
    setSaving(true);

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        description: description.trim(),
        type,
        priority,
        date: type === "one_time" ? date || null : null,
        time: time || null,
        days_of_week: type === "recurring" ? daysOfWeek : null,
      }),
    });

    setDescription("");
    setDate("");
    setTime("");
    setPriority("normal");
    setDaysOfWeek([]);
    setSaving(false);
    onCreated();
    onClose();
  }

  const cardBg = isDay ? "bg-white" : "bg-[#1a1228]";
  const inputBg = isDay
    ? "bg-cyan-50 border-cyan-100 focus:border-cyan-400 text-cyan-900 placeholder-cyan-300"
    : "bg-white/5 border-white/10 focus:border-orange-400 text-white placeholder-white/20";
  const textPrimary = isDay ? "text-cyan-900" : "text-white";
  const textSoft = isDay ? "text-cyan-500" : "text-orange-300";
  const activeBtn = isDay
    ? "bg-gradient-to-r from-cyan-500 to-teal-400 text-white shadow-sm"
    : "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm";
  const inactiveBtn = isDay ? "bg-cyan-50 text-cyan-600" : "bg-white/5 text-white/40";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className={`${cardBg} rounded-3xl w-full max-w-md p-6 space-y-5 max-h-[85vh] overflow-y-auto shadow-2xl`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-bold ${textPrimary}`}>משימה חדשה</h2>
          <button onClick={onClose} className={textSoft}>
            <X size={22} />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setType("one_time")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              type === "one_time" ? activeBtn : inactiveBtn
            }`}
          >
            חד-פעמית
          </button>
          <button
            onClick={() => setType("recurring")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              type === "recurring" ? activeBtn : inactiveBtn
            }`}
          >
            קבועה
          </button>
        </div>

        {/* Description */}
        <input
          type="text"
          placeholder="מה צריך לעשות?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`w-full px-4 py-3.5 rounded-2xl border-2 outline-none text-sm transition-all ${inputBg}`}
          autoFocus
        />

        {type === "one_time" ? (
          <>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-4 py-3.5 rounded-2xl border-2 outline-none text-sm ${inputBg}`}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setPriority("normal")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  priority === "normal"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : inactiveBtn
                }`}
              >
                רגיל
              </button>
              <button
                onClick={() => setPriority("urgent")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  priority === "urgent"
                    ? "bg-red-500 text-white shadow-sm"
                    : inactiveBtn
                }`}
              >
                דחוף
              </button>
            </div>
          </>
        ) : (
          <div>
            <p className={`text-sm mb-3 ${textSoft}`}>באילו ימים?</p>
            <div className="flex gap-1.5">
              {DAYS.map((d) => (
                <button
                  key={d.key}
                  onClick={() => toggleDay(d.key)}
                  className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${
                    daysOfWeek.includes(d.key) ? activeBtn : inactiveBtn
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className={`w-full px-4 py-3.5 rounded-2xl border-2 outline-none text-sm ${inputBg}`}
        />

        <button
          onClick={handleSave}
          disabled={saving || !description.trim()}
          className={`w-full py-4 rounded-2xl text-white font-bold text-base transition-all disabled:opacity-30 ${
            isDay
              ? "bg-gradient-to-r from-cyan-500 to-teal-400 hover:shadow-lg hover:shadow-cyan-200/40"
              : "bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-lg hover:shadow-orange-500/20"
          }`}
        >
          {saving ? "..." : "הוסיפי"}
        </button>
      </div>
    </div>
  );
}
