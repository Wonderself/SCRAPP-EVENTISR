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

  if (!mounted) return <div className="min-h-screen bg-[#F0F7FA]" />;

  return (
    <div className={`min-h-screen pb-24 ${isDay ? "bg-[#F0F7FA]" : "bg-[#1a1520]"}`}>
      <div className={`px-5 pt-12 pb-8 ${
        isDay ? "bg-gradient-to-bl from-[#1a7fb5] to-[#47b8e0]" : "bg-gradient-to-bl from-[#1a1025] to-[#4a1a3a]"
      }`}>
        <h1 className="text-2xl font-bold text-white">זיכרון</h1>
        <p className="text-white/50 text-xs mt-1 tracking-widest uppercase font-light">
          {(totalSize / 1024).toFixed(1)} kb memory
        </p>
      </div>

      {!selectedFile ? (
        <div className="p-4 space-y-2 -mt-4">
          {files.map((file, i) => (
            <button
              key={file.name}
              onClick={() => loadFile(file.name)}
              className={`w-full rounded-2xl p-4 flex items-center gap-4 text-right transition-all active:scale-[0.98] animate-fade-up no-color-transition ${
                isDay ? "bg-white border border-[#d8eef5] hover:shadow-sm" : "bg-[#2a2035] border border-[#3a2540]"
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className={`p-2.5 rounded-xl ${isDay ? "bg-[#2196c8]/10" : "bg-[#e65100]/10"}`}>
                <FileText size={18} className={isDay ? "text-[#2196c8]" : "text-[#e65100]"} />
              </div>
              <div className="flex-1">
                <p className={`font-medium text-sm ${isDay ? "text-[#1a3a4a]" : "text-[#f5e6d8]"}`}>
                  {FILE_LABELS[file.name] || file.name}
                </p>
                <p className={`text-[11px] mt-0.5 ${isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]"}`}>
                  {(file.size / 1024).toFixed(1)} kb
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 -mt-4">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setSelectedFile(null)} className={`p-2 rounded-xl ${isDay ? "hover:bg-[#f0f7fa]" : "hover:bg-[#231a2e]"}`}>
              <ArrowRight size={18} className={isDay ? "text-[#2196c8]" : "text-[#e65100]"} />
            </button>
            <h2 className={`font-bold text-sm flex-1 ${isDay ? "text-[#1a3a4a]" : "text-[#f5e6d8]"}`}>
              {FILE_LABELS[selectedFile] || selectedFile}
            </h2>
            <button
              onClick={saveFile}
              disabled={saving}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-medium transition-all disabled:opacity-50 ${
                saved
                  ? "bg-[#43a047]"
                  : isDay
                  ? "bg-[#2196c8] hover:bg-[#1a7fb5]"
                  : "bg-[#e65100] hover:bg-[#c2185b]"
              }`}
            >
              <Save size={13} />
              {saving ? "..." : saved ? "saved" : "save"}
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); setSaved(false); }}
            className={`w-full h-[60vh] p-4 rounded-2xl border outline-none text-sm font-mono resize-none leading-relaxed transition-all ${
              isDay
                ? "bg-white border-[#d8eef5] focus:border-[#2196c8] text-[#1a3a4a]"
                : "bg-[#2a2035] border-[#3a2540] focus:border-[#e65100] text-[#f5e6d8]"
            }`}
            dir="rtl"
          />
        </div>
      )}

      <BottomTabs isDay={isDay} />
    </div>
  );
}
