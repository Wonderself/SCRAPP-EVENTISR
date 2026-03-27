"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, MessageCircle, Settings } from "lucide-react";
import { useState } from "react";

interface Props {
  isDay: boolean;
}

export default function BottomTabs({ isDay }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);

  const mainTabs = [
    { path: "/dashboard", label: "בית", icon: Home, emoji: "🏠" },
    { path: "/chat", label: "שיחה", icon: MessageCircle, emoji: "💬" },
  ];

  const moreTabs = [
    { path: "/recurring", label: "משימות קבועות", emoji: "🔄" },
    { path: "/memory", label: "זיכרון דולפין", emoji: "🧠" },
  ];

  const isMoreActive = pathname === "/recurring" || pathname === "/memory";

  return (
    <>
      {/* More menu popup */}
      {showMore && (
        <div className="fixed inset-0 z-50" onClick={() => setShowMore(false)}>
          <div
            className={`absolute bottom-[68px] left-1/2 -translate-x-1/2 w-56 rounded-2xl overflow-hidden shadow-2xl ${
              isDay
                ? "bg-white border-2 border-sky-200"
                : "bg-[#1a0e2e] border-2 border-white/15"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {moreTabs.map((tab) => (
              <button
                key={tab.path}
                onClick={() => { router.push(tab.path); setShowMore(false); }}
                className={`w-full px-4 py-3.5 flex items-center gap-3 text-right transition-colors ${
                  pathname === tab.path
                    ? isDay ? "bg-sky-50" : "bg-white/10"
                    : isDay ? "hover:bg-sky-50/50" : "hover:bg-white/5"
                }`}
              >
                <span className="text-lg">{tab.emoji}</span>
                <span className={`text-sm font-black ${
                  pathname === tab.path
                    ? isDay ? "text-sky-600" : "text-fuchsia-300"
                    : isDay ? "text-sky-700" : "text-white/70"
                }`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <nav
        className={`shrink-0 z-40 backdrop-blur-xl ${
          isDay
            ? "bg-white/90 border-t-2 border-sky-200"
            : "bg-[#0d0820]/90 border-t-2 border-white/15"
        }`}
      >
        <div className="flex justify-around items-center h-[64px] lg:h-[72px] max-w-md mx-auto px-4">
          {mainTabs.map((tab) => {
            const active = pathname === tab.path;
            const Icon = tab.icon;
            return (
              <button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                className="flex flex-col items-center gap-0.5 px-5 py-1 min-w-[72px] lg:min-w-[88px] active:scale-95 transition-transform"
              >
                <div
                  className={`w-11 h-11 lg:w-13 lg:h-13 rounded-2xl flex items-center justify-center transition-all ${
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
                    size={20}
                    strokeWidth={active ? 3 : 2.5}
                    className={`lg:!w-6 lg:!h-6 ${
                      active
                        ? "text-white"
                        : isDay
                        ? "text-sky-400"
                        : "text-white/40"
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] lg:text-xs font-black ${
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

          {/* More button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex flex-col items-center gap-0.5 px-5 py-1 min-w-[72px] lg:min-w-[88px] active:scale-95 transition-transform"
          >
            <div
              className={`w-11 h-11 lg:w-13 lg:h-13 rounded-2xl flex items-center justify-center transition-all ${
                isMoreActive
                  ? isDay
                    ? "bg-gradient-to-br from-sky-400 to-cyan-500 shadow-lg shadow-sky-400/30"
                    : "bg-gradient-to-br from-fuchsia-500 to-violet-600 shadow-lg shadow-fuchsia-500/30"
                  : showMore
                  ? isDay ? "bg-sky-100" : "bg-white/10"
                  : isDay ? "bg-sky-50" : "bg-white/5"
              }`}
            >
              <Settings
                size={20}
                strokeWidth={isMoreActive ? 3 : 2.5}
                className={`lg:!w-6 lg:!h-6 ${
                  isMoreActive
                    ? "text-white"
                    : isDay
                    ? "text-sky-400"
                    : "text-white/40"
                }`}
              />
            </div>
            <span
              className={`text-[10px] lg:text-xs font-black ${
                isMoreActive
                  ? isDay ? "text-sky-600" : "text-fuchsia-300"
                  : isDay ? "text-sky-400" : "text-white/40"
              }`}
            >
              עוד
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
