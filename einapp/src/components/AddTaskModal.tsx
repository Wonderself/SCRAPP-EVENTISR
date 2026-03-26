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

  const cardBg = isDay ? "bg-white" : "bg-[#2a2035]";
  const inputBg = isDay
    ? "bg-[#f0f7fa] border-[#d8eef5] focus:border-[#2196c8] text-[#1a3a4a] placeholder-[#8ab0c0]"
    : "bg-[#1a1520] border-[#3a2540] focus:border-[#e65100] text-[#f5e6d8] placeholder-[#8a6a5a]";
  const textPrimary = isDay ? "text-[#1a3a4a]" : "text-[#f5e6d8]";
  const textSoft = isDay ? "text-[#4a7a8a]" : "text-[#c8a88a]";
  const activeBtn = isDay ? "bg-[#2196c8] text-white" : "bg-[#e65100] text-white";
  const inactiveBtn = isDay ? "bg-[#f0f7fa] text-[#4a7a8a]" : "bg-[#1a1520] text-[#c8a88a]";

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
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              type === "one_time" ? activeBtn : inactiveBtn
            }`}
          >
            חד-פעמית
          </button>
          <button
            onClick={() => setType("recurring")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
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
          className={`w-full px-4 py-3.5 rounded-2xl border outline-none text-sm transition-all ${inputBg}`}
          autoFocus
        />

        {type === "one_time" ? (
          <>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-4 py-3.5 rounded-2xl border outline-none text-sm ${inputBg}`}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setPriority("normal")}
                className={`flex-1 py-2.5 rounded-xl text-sm transition-all ${
                  priority === "normal"
                    ? "bg-[#43a047] text-white"
                    : inactiveBtn
                }`}
              >
                רגיל
              </button>
              <button
                onClick={() => setPriority("urgent")}
                className={`flex-1 py-2.5 rounded-xl text-sm transition-all ${
                  priority === "urgent"
                    ? "bg-[#e53935] text-white"
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
                  className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
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
          className={`w-full px-4 py-3.5 rounded-2xl border outline-none text-sm ${inputBg}`}
        />

        <button
          onClick={handleSave}
          disabled={saving || !description.trim()}
          className={`w-full py-4 rounded-2xl text-white font-semibold transition-all disabled:opacity-40 ${
            isDay
              ? "bg-gradient-to-l from-[#1a7fb5] to-[#47b8e0] hover:shadow-lg"
              : "bg-gradient-to-l from-[#c2185b] to-[#e65100] hover:shadow-lg"
          }`}
        >
          {saving ? "..." : "הוסיפי"}
        </button>
      </div>
    </div>
  );
}
