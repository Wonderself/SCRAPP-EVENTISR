"use client";

import { useState } from "react";
import { X } from "lucide-react";

const DAYS = [
  { key: "sunday", label: "א׳" },
  { key: "monday", label: "ב׳" },
  { key: "tuesday", label: "ג׳" },
  { key: "wednesday", label: "ד׳" },
  { key: "thursday", label: "ה׳" },
  { key: "friday", label: "ו׳" },
  { key: "saturday", label: "ש׳" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function AddTaskModal({ open, onClose, onCreated }: Props) {
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

    // Reset
    setDescription("");
    setDate("");
    setTime("");
    setPriority("normal");
    setDaysOfWeek([]);
    setSaving(false);
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-dolphin-ocean-dark">
            הוסיפי משימה 📌
          </h2>
          <button onClick={onClose} className="text-dolphin-sand-dark hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setType("one_time")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === "one_time"
                ? "bg-dolphin-ocean text-white"
                : "bg-dolphin-sand-light text-dolphin-earth"
            }`}
          >
            📌 מיוחדת
          </button>
          <button
            onClick={() => setType("recurring")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === "recurring"
                ? "bg-dolphin-ocean text-white"
                : "bg-dolphin-sand-light text-dolphin-earth"
            }`}
          >
            🔄 קבועה
          </button>
        </div>

        {/* Description */}
        <input
          type="text"
          placeholder="מה צריך לעשות?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-dolphin-sand focus:border-dolphin-ocean focus:outline-none focus:ring-2 focus:ring-dolphin-ocean-light text-sm bg-dolphin-cream"
          autoFocus
        />

        {type === "one_time" ? (
          <>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-dolphin-sand focus:border-dolphin-ocean focus:outline-none text-sm bg-dolphin-cream"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setPriority("normal")}
                className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                  priority === "normal"
                    ? "bg-dolphin-sea text-white"
                    : "bg-dolphin-sand-light text-dolphin-earth"
                }`}
              >
                רגיל
              </button>
              <button
                onClick={() => setPriority("urgent")}
                className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                  priority === "urgent"
                    ? "bg-dolphin-urgent text-white"
                    : "bg-dolphin-sand-light text-dolphin-earth"
                }`}
              >
                🔴 דחוף
              </button>
            </div>
          </>
        ) : (
          <div>
            <p className="text-sm text-dolphin-earth mb-2">באילו ימים?</p>
            <div className="flex gap-1.5">
              {DAYS.map((d) => (
                <button
                  key={d.key}
                  onClick={() => toggleDay(d.key)}
                  className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                    daysOfWeek.includes(d.key)
                      ? "bg-dolphin-ocean text-white"
                      : "bg-dolphin-sand-light text-dolphin-earth"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time (optional) */}
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-dolphin-sand focus:border-dolphin-ocean focus:outline-none text-sm bg-dolphin-cream"
          placeholder="שעה (אופציונלי)"
        />

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !description.trim()}
          className="w-full py-3 rounded-xl bg-dolphin-ocean text-white font-semibold hover:bg-dolphin-ocean-dark transition-colors disabled:opacity-50"
        >
          {saving ? "שומרת..." : "הוסיפי ✨"}
        </button>
      </div>
    </div>
  );
}
