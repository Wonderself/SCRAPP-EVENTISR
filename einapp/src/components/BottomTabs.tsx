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
    <nav className={`fixed bottom-0 left-0 right-0 z-40 ${
      isDay
        ? "bg-white/90 backdrop-blur-md border-t border-[#d8eef5]"
        : "bg-[#1a1520]/90 backdrop-blur-md border-t border-[#3a2540]"
    }`}>
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {TABS.map((tab) => {
          const active = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
                active
                  ? isDay
                    ? "text-[#2196c8]"
                    : "text-[#e65100]"
                  : isDay
                  ? "text-[#8ab0c0]"
                  : "text-[#8a6a5a]"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className={`text-center pb-2 text-[9px] tracking-widest uppercase font-light ${
        isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]"
      }`}>
        Sea Vibes Vacation
      </div>
    </nav>
  );
}
