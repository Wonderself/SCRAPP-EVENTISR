"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pin, Mic, MessageCircle } from "lucide-react";
import WeekView from "@/components/WeekView";
import AddTaskModal from "@/components/AddTaskModal";
import BottomTabs from "@/components/BottomTabs";
import { formatHebrewDate } from "@/lib/hebrew";

export default function DashboardPage() {
  const [showAddTask, setShowAddTask] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const today = new Date();

  return (
    <div className="min-h-screen bg-dolphin-cream pb-24">
      {/* Header */}
      <div className="bg-gradient-to-l from-dolphin-ocean to-dolphin-ocean-dark text-white p-5 rounded-b-2xl">
        <h1 className="text-2xl font-bold">שלום עינת! ☀️</h1>
        <p className="text-dolphin-ocean-light text-sm mt-1">
          {formatHebrewDate(today)} &middot; Good Vibes Only 🌊
        </p>
      </div>

      {/* 3 Big Buttons */}
      <div className="grid grid-cols-3 gap-3 p-4 -mt-4">
        <button
          onClick={() => setShowAddTask(true)}
          className="bg-white rounded-xl p-4 shadow-sm border border-dolphin-sand-light flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
        >
          <Pin className="text-dolphin-ocean" size={28} />
          <span className="text-xs font-medium text-dolphin-earth">הוסיפי משימה</span>
        </button>
        <button
          onClick={() => router.push("/chat?voice=1")}
          className="bg-white rounded-xl p-4 shadow-sm border border-dolphin-sand-light flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
        >
          <Mic className="text-dolphin-sunset" size={28} />
          <span className="text-xs font-medium text-dolphin-earth">הקליטי הודעה</span>
        </button>
        <button
          onClick={() => router.push("/chat")}
          className="bg-white rounded-xl p-4 shadow-sm border border-dolphin-sand-light flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
        >
          <MessageCircle className="text-dolphin-sea" size={28} />
          <span className="text-xs font-medium text-dolphin-earth">דברי עם Einapp</span>
        </button>
      </div>

      {/* Week View */}
      <div className="px-4" key={refreshKey}>
        <WeekView />
      </div>

      <AddTaskModal
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />

      <BottomTabs />
    </div>
  );
}
