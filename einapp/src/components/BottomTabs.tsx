"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, MessageCircle, RefreshCw, Brain } from "lucide-react";

const TABS = [
  { path: "/dashboard", label: "בית", icon: Home },
  { path: "/chat", label: "שיחה", icon: MessageCircle },
  { path: "/recurring", label: "קבועות", icon: RefreshCw },
  { path: "/memory", label: "זיכרון", icon: Brain },
];

interface Props {
  isDay: boolean;
}

export default function BottomTabs({ isDay }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 ${
        isDay
          ? "bg-white/90 backdrop-blur-xl border-t border-cyan-100"
          : "bg-[#0f0a1a]/90 backdrop-blur-xl border-t border-white/5"
      }`}
    >
      <div className="flex justify-around items-center h-[68px] max-w-lg mx-auto px-4">
        {TABS.map((tab) => {
          const active = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className="flex flex-col items-center gap-1 px-3 py-1.5 min-w-[56px] transition-all"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  active
                    ? isDay
                      ? "bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-md shadow-cyan-200/50"
                      : "bg-gradient-to-br from-orange-400 to-pink-500 shadow-md shadow-orange-500/30"
                    : "bg-transparent"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.5}
                  className={
                    active
                      ? "text-white"
                      : isDay
                      ? "text-cyan-400"
                      : "text-white/30"
                  }
                />
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  active
                    ? isDay
                      ? "text-cyan-700"
                      : "text-orange-300"
                    : isDay
                    ? "text-cyan-300"
                    : "text-white/20"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
