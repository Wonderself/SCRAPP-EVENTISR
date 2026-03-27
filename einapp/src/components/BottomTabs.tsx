"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, MessageCircle, Brain } from "lucide-react";

interface Props {
  isDay: boolean;
}

const TABS = [
  { path: "/dashboard", label: "הבית שלי", icon: Home },
  { path: "/chat", label: "דברי איתי", icon: MessageCircle },
  { path: "/memory", label: "זיכרון", icon: Brain },
];

export default function BottomTabs({ isDay }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className={`shrink-0 z-40 backdrop-blur-xl ${
        isDay
          ? "bg-white/90 border-t-2 border-sky-200"
          : "bg-[#0d0820]/90 border-t-2 border-white/15"
      }`}
    >
      <div className="flex justify-around items-center h-[56px] sm:h-[64px] lg:h-[72px] max-w-lg mx-auto px-2 sm:px-4 pb-[env(safe-area-inset-bottom,0px)]">
        {TABS.map((tab) => {
          const active = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className="flex flex-col items-center gap-0.5 px-4 sm:px-6 py-1 min-w-[70px] sm:min-w-[80px] active:scale-95 transition-transform"
            >
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
                  active
                    ? isDay
                      ? "bg-gradient-to-br from-sky-400 to-cyan-500 shadow-lg shadow-sky-400/30"
                      : "bg-gradient-to-br from-fuchsia-500 to-violet-600 shadow-lg shadow-fuchsia-500/30"
                    : isDay
                    ? "bg-sky-50"
                    : "bg-white/5"
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 3 : 2.5}
                  className={`sm:!w-5 sm:!h-5 ${
                    active
                      ? "text-white"
                      : isDay
                      ? "text-sky-400"
                      : "text-white/40"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] sm:text-xs font-black ${
                  active
                    ? isDay ? "text-sky-600" : "text-fuchsia-300"
                    : isDay ? "text-sky-400" : "text-white/40"
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
