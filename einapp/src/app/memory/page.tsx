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

  if (!mounted) return <div className="min-h-screen bg-sky-100" />;

  return (
    <div className={`min-h-screen pb-28 ${isDay ? "bg-sky-100" : "bg-[#0d0820]"}`}>
      <div className={`px-5 pt-12 pb-10 lg:pt-14 lg:pb-12 ${
        isDay ? "bg-gradient-to-l from-sky-400 to-cyan-400" : "bg-gradient-to-l from-orange-500 to-pink-500"
      }`}>
        <h1 className="text-3xl lg:text-5xl font-black text-white">זיכרון</h1>
        <p className="text-white/40 text-xs lg:text-sm mt-1 tracking-widest uppercase font-bold">
          {(totalSize / 1024).toFixed(1)} kb memory
        </p>
      </div>

      {!selectedFile ? (
        <div className="p-5 lg:px-12 space-y-3 -mt-5 max-w-3xl mx-auto">
          {files.map((file, i) => (
            <button
              key={file.name}
              onClick={() => loadFile(file.name)}
              className={`cartoon-btn w-full rounded-3xl p-5 lg:p-6 flex items-center gap-4 text-right transition-all animate-fade-up no-color-transition ${
                isDay ? "cartoon-card-day" : "cartoon-card-sunset"
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div
                className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center ${
                  isDay ? "bg-gradient-to-br from-sky-400 to-cyan-500" : "bg-gradient-to-br from-orange-400 to-pink-500"
                }`}
                style={{ boxShadow: isDay ? "0 3px 0 #0891b2" : "0 3px 0 #c2410c" }}
              >
                <FileText size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className={`font-black text-base lg:text-xl ${isDay ? "text-sky-800" : "text-white/90"}`}>
                  {FILE_LABELS[file.name] || file.name}
                </p>
                <p className={`text-xs lg:text-sm mt-0.5 font-bold ${isDay ? "text-sky-400" : "text-white/20"}`}>
                  {(file.size / 1024).toFixed(1)} kb
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-5 lg:px-12 -mt-5 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setSelectedFile(null)} className={`cartoon-btn p-2.5 rounded-xl ${isDay ? "hover:bg-sky-50" : "hover:bg-white/5"}`}>
              <ArrowRight size={20} className={isDay ? "text-sky-500" : "text-orange-400"} strokeWidth={3} />
            </button>
            <h2 className={`font-black text-lg lg:text-2xl flex-1 ${isDay ? "text-sky-800" : "text-white"}`}>
              {FILE_LABELS[selectedFile] || selectedFile}
            </h2>
            <button
              onClick={saveFile}
              disabled={saving}
              className={`cartoon-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm lg:text-base font-black transition-all disabled:opacity-50 ${
                saved
                  ? "bg-emerald-400 shadow-[0_3px_0_#16a34a]"
                  : isDay
                  ? "bg-gradient-to-r from-sky-400 to-cyan-500 shadow-[0_3px_0_#0891b2]"
                  : "bg-gradient-to-r from-orange-500 to-pink-500 shadow-[0_3px_0_#c2410c]"
              }`}
            >
              <Save size={15} />
              {saving ? "..." : saved ? "saved" : "save"}
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); setSaved(false); }}
            className={`w-full h-[60vh] p-5 rounded-3xl border-3 outline-none text-sm lg:text-base font-medium resize-none leading-relaxed transition-all ${
              isDay
                ? "bg-white border-sky-200 focus:border-sky-400 text-sky-800"
                : "bg-[#1e1330] border-white/5 focus:border-orange-400 text-white/80"
            }`}
            dir="rtl"
          />
        </div>
      )}

      <BottomTabs isDay={isDay} />
    </div>
  );
}
