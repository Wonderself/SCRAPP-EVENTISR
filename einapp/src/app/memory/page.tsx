"use client";

import { useEffect, useState } from "react";
import { FileText, Save, ArrowRight } from "lucide-react";
import BottomTabs from "@/components/BottomTabs";

interface MemoryFile {
  name: string;
  size: number;
}

const FILE_LABELS: Record<string, string> = {
  "hotel-profile.md": "🏨 פרופיל המלון",
  "suppliers.md": "📦 ספקים",
  "staff.md": "👥 צוות",
  "regular-guests.md": "🏠 אורחים קבועים",
  "procedures.md": "📋 נהלים",
  "issues-log.md": "🔧 יומן בעיות",
  "financial-notes.md": "💰 הערות כספיות",
  "ideas.md": "💡 רעיונות",
};

export default function MemoryPage() {
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/memory")
      .then((r) => r.json())
      .then((data) => setFiles(data.files || []));
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

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="min-h-screen bg-dolphin-cream pb-24">
      <div className="bg-gradient-to-l from-dolphin-ocean to-dolphin-ocean-dark text-white p-5 rounded-b-2xl">
        <h1 className="text-2xl font-bold">זיכרון 🧠</h1>
        <p className="text-dolphin-ocean-light text-sm mt-1">
          מה Einapp יודעת &middot; {(totalSize / 1024).toFixed(1)} KB
        </p>
      </div>

      {!selectedFile ? (
        <div className="p-4 space-y-2">
          {files.map((file) => (
            <button
              key={file.name}
              onClick={() => loadFile(file.name)}
              className="w-full bg-white rounded-xl p-4 border border-dolphin-sand-light shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow text-right"
            >
              <FileText size={20} className="text-dolphin-ocean shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {FILE_LABELS[file.name] || file.name}
                </p>
                <p className="text-xs text-dolphin-sand-dark">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setSelectedFile(null)}
              className="p-2 rounded-lg hover:bg-dolphin-sand-light"
            >
              <ArrowRight size={20} className="text-dolphin-ocean" />
            </button>
            <h2 className="font-bold text-dolphin-ocean-dark flex-1">
              {FILE_LABELS[selectedFile] || selectedFile}
            </h2>
            <button
              onClick={saveFile}
              disabled={saving}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-dolphin-ocean text-white text-sm hover:bg-dolphin-ocean-dark disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "שומרת..." : saved ? "נשמר! ✨" : "שמירה"}
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setSaved(false);
            }}
            className="w-full h-[60vh] p-4 rounded-xl border border-dolphin-sand focus:border-dolphin-ocean focus:outline-none text-sm font-mono bg-white resize-none leading-relaxed"
            dir="rtl"
          />
        </div>
      )}

      <BottomTabs />
    </div>
  );
}
