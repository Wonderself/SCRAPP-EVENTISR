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
          ? "bg-white border-t-3 border-sky-200"
          : "bg-[#0d0820] border-t-3 border-orange-500/10"
      }`}
    >
      <div className="flex justify-around items-center h-[76px] lg:h-[88px] max-w-xl mx-auto px-2">
        {TABS.map((tab) => {
          const active = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className="cartoon-btn flex flex-col items-center gap-1 px-3 py-1 min-w-[60px] lg:min-w-[80px]"
            >
              <div
                className={`w-11 h-11 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center transition-all ${
                  active
                    ? isDay
                      ? "bg-gradient-to-br from-sky-400 to-cyan-500 shadow-[0_3px_0_#0891b2]"
                      : "bg-gradient-to-br from-orange-400 to-pink-500 shadow-[0_3px_0_#c2410c]"
                    : "bg-transparent"
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 3 : 2}
                  className={
                    active
                      ? "text-white"
                      : isDay
                      ? "text-sky-300"
                      : "text-white/20"
                  }
                />
              </div>
              <span
                className={`text-[11px] lg:text-sm font-black ${
                  active
                    ? isDay ? "text-sky-600" : "text-orange-300"
                    : isDay ? "text-sky-300" : "text-white/15"
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
