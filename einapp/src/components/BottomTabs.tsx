"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, MessageCircle, RefreshCw, Brain } from "lucide-react";

const TABS = [
  { path: "/dashboard", label: "בית", icon: Home },
  { path: "/chat", label: "צ׳אט", icon: MessageCircle },
  { path: "/recurring", label: "קבועות", icon: RefreshCw },
  { path: "/memory", label: "זיכרון", icon: Brain },
];

export default function BottomTabs() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-dolphin-sand-light z-40">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {TABS.map((tab) => {
          const active = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                active ? "text-dolphin-ocean" : "text-dolphin-sand-dark"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="text-center pb-2 text-[10px] text-dolphin-sand-dark">
        Good Vibes Only 🌊
      </div>
    </nav>
  );
}
