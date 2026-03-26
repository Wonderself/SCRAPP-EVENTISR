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
  const [mode, setMode] = useState<"day" | "sunset">("day");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMode(getTimeMode());
    fetch("/api/memory").then((r) => r.json()).then((d) => setFiles(d.files || []));
  }, []);

  async function loadFile(filename: string) {
    setSelectedFile(filename);
    setSaved(false);
    const res = await fetch(`/api/memory?file=${filename}`);
    const data = await res.json();
    setContent(data.content || "");
  }

  async function saveFile() {
    if (!selectedFile) return;
    setSaving(true);
    await fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: selectedFile, content }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const isDay = mode === "day";
  const totalSize = files.reduce((s, f) => s + f.size, 0);

  if (!mounted) return <div className="min-h-screen bg-[#f0f9ff]" />;

  return (
    <div className={`min-h-screen pb-24 ${isDay ? "bg-gradient-to-b from-[#f0f9ff] to-white" : "bg-gradient-to-b from-[#0f0a1a] to-[#1a1228]"}`}>
      <div className={`px-5 pt-12 pb-8 ${
        isDay ? "bg-gradient-to-l from-[#0e7490] to-[#06b6d4]" : "bg-gradient-to-l from-[#7c2d12] to-[#be185d]"
      }`}>
        <h1 className="text-2xl font-bold text-white">זיכרון</h1>
        <p className="text-white/40 text-xs mt-1 tracking-widest uppercase font-light">
          {(totalSize / 1024).toFixed(1)} kb memory
        </p>
      </div>

      {!selectedFile ? (
        <div className="p-4 space-y-2 -mt-4 max-w-2xl mx-auto">
          {files.map((file, i) => (
            <button
              key={file.name}
              onClick={() => loadFile(file.name)}
              className={`w-full rounded-2xl p-4 flex items-center gap-4 text-right transition-all active:scale-[0.98] animate-fade-up no-color-transition ${
                isDay ? "glass-day shadow-sm" : "glass-sunset"
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className={`p-2.5 rounded-xl ${
                isDay ? "bg-gradient-to-br from-cyan-400 to-teal-400" : "bg-gradient-to-br from-orange-500 to-pink-500"
              }`}>
                <FileText size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${isDay ? "text-cyan-900" : "text-white/90"}`}>
                  {FILE_LABELS[file.name] || file.name}
                </p>
                <p className={`text-[11px] mt-0.5 ${isDay ? "text-cyan-400" : "text-white/25"}`}>
                  {(file.size / 1024).toFixed(1)} kb
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 -mt-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setSelectedFile(null)} className={`p-2 rounded-xl transition-colors ${isDay ? "hover:bg-cyan-50" : "hover:bg-white/5"}`}>
              <ArrowRight size={18} className={isDay ? "text-cyan-500" : "text-orange-400"} />
            </button>
            <h2 className={`font-bold text-sm flex-1 ${isDay ? "text-cyan-900" : "text-white"}`}>
              {FILE_LABELS[selectedFile] || selectedFile}
            </h2>
            <button
              onClick={saveFile}
              disabled={saving}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold transition-all disabled:opacity-50 ${
                saved
                  ? "bg-emerald-500"
                  : isDay
                  ? "bg-gradient-to-r from-cyan-500 to-teal-400 shadow-sm shadow-cyan-200/30"
                  : "bg-gradient-to-r from-orange-500 to-pink-500 shadow-sm shadow-orange-500/20"
              }`}
            >
              <Save size={13} />
              {saving ? "..." : saved ? "saved" : "save"}
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); setSaved(false); }}
            className={`w-full h-[60vh] p-4 rounded-2xl border-2 outline-none text-sm font-mono resize-none leading-relaxed transition-all ${
              isDay
                ? "bg-white border-cyan-100 focus:border-cyan-400 text-cyan-900"
                : "bg-white/[0.03] border-white/5 focus:border-orange-400 text-white/80"
            }`}
            dir="rtl"
          />
        </div>
      )}

      <BottomTabs isDay={isDay} />
    </div>
  );
}
