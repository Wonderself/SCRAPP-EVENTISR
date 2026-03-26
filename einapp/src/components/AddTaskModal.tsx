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

  const inputCls = isDay
    ? "bg-sky-50 border-3 border-sky-200 focus:border-sky-400 text-sky-800 placeholder-sky-300"
    : "bg-white/5 border-3 border-white/10 focus:border-orange-400 text-white placeholder-white/20";

  const activeBtn = isDay
    ? "bg-gradient-to-r from-sky-400 to-cyan-500 text-white shadow-[0_3px_0_#0891b2]"
    : "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-[0_3px_0_#c2410c]";

  const inactiveBtn = isDay
    ? "bg-sky-50 text-sky-500 border-2 border-sky-200"
    : "bg-white/5 text-white/30 border-2 border-white/5";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-3">
      <div className={`w-full max-w-md p-5 lg:p-7 space-y-4 max-h-[85vh] overflow-y-auto rounded-[28px] lg:rounded-[32px] ${
        isDay
          ? "bg-white border-4 border-sky-200 shadow-[0_8px_0_#bae6fd]"
          : "bg-[#1e1330] border-4 border-orange-500/15 shadow-[0_8px_0_rgba(251,146,60,0.08)]"
      }`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-xl lg:text-2xl font-black ${isDay ? "text-sky-800" : "text-white"}`}>משימה חדשה</h2>
          <button onClick={onClose} className={`cartoon-btn p-2 rounded-xl ${isDay ? "text-sky-400 hover:bg-sky-50" : "text-white/30 hover:bg-white/5"}`}>
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex gap-3">
          <button
            onClick={() => setType("one_time")}
            className={`cartoon-btn flex-1 py-3 rounded-2xl text-sm lg:text-base font-black transition-all ${
              type === "one_time" ? activeBtn : inactiveBtn
            }`}
          >
            חד-פעמית
          </button>
          <button
            onClick={() => setType("recurring")}
            className={`cartoon-btn flex-1 py-3 rounded-2xl text-sm lg:text-base font-black transition-all ${
              type === "recurring" ? activeBtn : inactiveBtn
            }`}
          >
            קבועה
          </button>
        </div>

        <input
          type="text"
          placeholder="מה צריך לעשות?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`w-full px-4 py-3.5 rounded-2xl outline-none text-sm lg:text-base font-bold ${inputCls}`}
          autoFocus
        />

        {type === "one_time" ? (
          <>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-5 py-4 rounded-2xl outline-none text-sm lg:text-base font-bold ${inputCls}`}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setPriority("normal")}
                className={`cartoon-btn flex-1 py-3 rounded-2xl text-sm lg:text-base font-black transition-all ${
                  priority === "normal" ? "bg-emerald-400 text-white shadow-[0_3px_0_#16a34a]" : inactiveBtn
                }`}
              >
                רגיל
              </button>
              <button
                onClick={() => setPriority("urgent")}
                className={`cartoon-btn flex-1 py-3 rounded-2xl text-sm lg:text-base font-black transition-all ${
                  priority === "urgent" ? "bg-red-400 text-white shadow-[0_3px_0_#dc2626]" : inactiveBtn
                }`}
              >
                דחוף
              </button>
            </div>
          </>
        ) : (
          <div>
            <p className={`text-sm lg:text-base mb-3 font-black ${isDay ? "text-sky-500" : "text-orange-300"}`}>באילו ימים?</p>
            <div className="flex gap-2">
              {DAYS.map((d) => (
                <button
                  key={d.key}
                  onClick={() => toggleDay(d.key)}
                  className={`cartoon-btn w-10 h-10 lg:w-12 lg:h-12 rounded-xl text-sm lg:text-base font-black transition-all ${
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
          className={`w-full px-5 py-4 rounded-2xl outline-none text-sm lg:text-base font-bold ${inputCls}`}
        />

        <button
          onClick={handleSave}
          disabled={saving || !description.trim()}
          className={`cartoon-btn w-full py-4 rounded-2xl text-white text-base lg:text-lg font-black transition-all disabled:opacity-30 ${
            isDay
              ? "bg-gradient-to-r from-sky-400 to-cyan-500 shadow-[0_5px_0_#0891b2]"
              : "bg-gradient-to-r from-orange-500 to-pink-500 shadow-[0_5px_0_#c2410c]"
          }`}
        >
          {saving ? "..." : "הוסיפי"}
        </button>
      </div>
    </div>
  );
}
