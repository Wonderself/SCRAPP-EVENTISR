"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, MessageCircle, RefreshCw, Brain } from "lucide-react";

const TABS = [
  { path: "/dashboard", label: "בית", icon: Home, dayColor: "from-sky-400 to-cyan-500", nightColor: "from-rose-400 to-fuchsia-500" },
  { path: "/chat", label: "שיחה", icon: MessageCircle, dayColor: "from-blue-400 to-indigo-500", nightColor: "from-orange-400 to-rose-500" },
  { path: "/recurring", label: "קבועות", icon: RefreshCw, dayColor: "from-emerald-400 to-teal-500", nightColor: "from-violet-400 to-purple-500" },
  { path: "/memory", label: "זיכרון", icon: Brain, dayColor: "from-amber-400 to-orange-500", nightColor: "from-pink-400 to-fuchsia-500" },
];

interface Props {
  isDay: boolean;
}

export default function BottomTabs({ isDay }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className={`shrink-0 z-40 px-3 pb-1 pt-1.5 ${
        isDay
          ? "bg-white/95 backdrop-blur-xl border-t border-sky-100/50"
          : "bg-[#0a0514]/95 backdrop-blur-xl border-t border-white/[0.05]"
      }`}
    >
      <div className="flex justify-around items-center max-w-xl mx-auto">
        {TABS.map((tab) => {
          const active = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-[64px] lg:min-w-[80px] transition-all active:scale-95"
            >
              <div
                className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all ${
                  active
                    ? `bg-gradient-to-br ${isDay ? tab.dayColor : tab.nightColor} shadow-lg ${
                        isDay ? "shadow-sky-400/20" : "shadow-fuchsia-500/20"
                      }`
                    : isDay
                    ? "bg-sky-50"
                    : "bg-white/[0.05]"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 2}
                  className={`lg:!w-6 lg:!h-6 ${
                    active
                      ? "text-white"
                      : isDay
                      ? "text-sky-400"
                      : "text-white/25"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] lg:text-xs font-bold ${
                  active
                    ? isDay ? "text-sky-700" : "text-fuchsia-300"
                    : isDay ? "text-sky-400" : "text-white/25"
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
