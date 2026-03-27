"use client";

import { useEffect, useState } from "react";
import { FileText, Save, ArrowRight } from "lucide-react";
import BottomTabs from "@/components/BottomTabs";

function getTimeMode(): "day" | "sunset" {
  const now = new Date();
  const m = now.getHours() * 60 + now.getMinutes();
  return m >= 990 || m < 300 ? "sunset" : "day";
}

interface MemoryFile { name: string; size: number; }

const FILE_LABELS: Record<string, string> = {
  "hotel-profile.md": "פרופיל המלון",
  "suppliers.md": "ספקים",
  "staff.md": "צוות",
  "regular-guests.md": "אורחים קבועים",
  "procedures.md": "נהלים",
  "issues-log.md": "יומן בעיות",
  "financial-notes.md": "הערות כספיות",
  "ideas.md": "רעיונות",
  "einat-personal.md": "עינת - אישי",
};

export default function MemoryPage() {
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [mode, setMode] = useState<"day" | "sunset">("day");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMode(getTimeMode());
    fetch("/api/memory")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (d.files && d.files.length > 0) {
          setFiles(d.files);
        } else if (d.error) {
          setError(d.error);
        } else {
          setFiles([]);
        }
        setLoadingFiles(false);
      })
      .catch((e) => { setError(`שגיאה בטעינת קבצים: ${e.message}`); setLoadingFiles(false); });
  }, []);

  async function loadFile(filename: string) {
    try {
      setError(null);
      setSelectedFile(filename);
      setSaved(false);
      const res = await fetch(`/api/memory?file=${filename}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setContent(data.content || "");
    } catch (e: any) {
      setError(`שגיאה בטעינת הקובץ: ${e.message}`);
    }
  }

  async function saveFile() {
    if (!selectedFile) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: selectedFile, content }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  }

  const isDay = mode === "day";
  const totalSize = files.reduce((s, f) => s + f.size, 0);

  if (!mounted) return <div className="h-[100dvh] bg-sky-100" />;

  return (
    <div className={`h-[100dvh] flex flex-col overflow-hidden ${
      isDay
        ? "bg-gradient-to-b from-sky-50 via-cyan-50/50 to-white"
        : "bg-gradient-to-b from-[#1a0e2e] via-[#12081f] to-[#0a0514]"
    }`}>
      <div className={`shrink-0 px-4 pt-[env(safe-area-inset-top,8px)] pb-3 sm:px-5 sm:pb-4 lg:pt-12 lg:pb-5 ${
        isDay
          ? "bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-300"
          : "bg-gradient-to-br from-rose-500 via-fuchsia-600 to-violet-700"
      }`}>
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-black text-white">זיכרון 🧠</h1>
        <p className="text-white/40 text-[10px] lg:text-xs mt-0.5 font-bold">
          מה שאני זוכרת על דולפין וילג'
        </p>
      </div>

      {error && (
        <div className="mx-4 mt-2 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl p-3 text-center">
          {error}
        </div>
      )}

      {!selectedFile ? (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:px-10 space-y-2 sm:space-y-2.5 max-w-3xl mx-auto w-full">
          {loadingFiles && (
            <p className={`text-center py-8 text-sm font-bold ${isDay ? "text-sky-300" : "text-white/30"}`}>
              טוען...
            </p>
          )}
          {!loadingFiles && files.length === 0 && !error && (
            <p className={`text-center py-8 text-sm font-bold ${isDay ? "text-sky-300" : "text-white/30"}`}>
              אין קבצי זיכרון
            </p>
          )}
          {files.map((file) => (
            <button
              key={file.name}
              onClick={() => loadFile(file.name)}
              className={`w-full rounded-[20px] p-4 lg:p-5 flex items-center gap-3 text-right transition-all active:scale-[0.98] ${
                isDay
                  ? "bg-white border border-sky-100 shadow-[0_2px_16px_rgba(14,165,233,0.08)]"
                  : "bg-white/10 border border-white/15 shadow-[0_2px_16px_rgba(168,85,247,0.06)]"
              }`}
            >
              <div
                className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg ${
                  isDay
                    ? "bg-gradient-to-br from-sky-400 to-cyan-500 shadow-sky-400/20"
                    : "bg-gradient-to-br from-fuchsia-400 to-violet-500 shadow-fuchsia-500/20"
                }`}
              >
                <FileText size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className={`font-black text-sm lg:text-lg ${isDay ? "text-sky-800" : "text-white/90"}`}>
                  {FILE_LABELS[file.name] || file.name}
                </p>
                <p className={`text-[10px] lg:text-xs mt-0.5 font-bold ${isDay ? "text-sky-400" : "text-white/40"}`}>
                  {(file.size / 1024).toFixed(1)} kb
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden p-4 lg:px-10 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <button onClick={() => { setSelectedFile(null); setError(null); }} className={`p-2 rounded-xl transition-colors ${isDay ? "hover:bg-sky-50" : "hover:bg-white/10"}`}>
              <ArrowRight size={18} className={isDay ? "text-sky-500" : "text-fuchsia-400"} strokeWidth={3} />
            </button>
            <h2 className={`font-black text-base lg:text-xl flex-1 ${isDay ? "text-sky-800" : "text-white"}`}>
              {FILE_LABELS[selectedFile] || selectedFile}
            </h2>
            <button
              onClick={saveFile}
              disabled={saving}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs lg:text-sm font-black transition-all disabled:opacity-50 ${
                saved
                  ? "bg-emerald-400"
                  : isDay
                  ? "bg-gradient-to-r from-sky-400 to-cyan-500 shadow-lg shadow-sky-400/20"
                  : "bg-gradient-to-r from-fuchsia-500 to-violet-600 shadow-lg shadow-fuchsia-500/20"
              }`}
            >
              <Save size={13} />
              {saving ? "..." : saved ? "נשמר" : "שמירה"}
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); setSaved(false); }}
            className={`w-full flex-1 p-4 rounded-[20px] border outline-none text-sm lg:text-base font-medium resize-none leading-relaxed transition-all ${
              isDay
                ? "bg-white border-sky-100 focus:border-sky-400 text-sky-800"
                : "bg-white/[0.06] border-white/15 focus:border-fuchsia-400 text-white/85"
            }`}
            dir="rtl"
          />
        </div>
      )}

      <BottomTabs isDay={isDay} />
    </div>
  );
}
