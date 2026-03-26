"use client";

import { Volume2 } from "lucide-react";

interface Props {
  role: "user" | "assistant";
  content: string;
  time?: string;
  isDay: boolean;
  onSpeak?: () => void;
}

export default function ChatBubble({ role, content, time, isDay, onSpeak }: Props) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-start" : "justify-end"} mb-2`}>
      <div
        className={`max-w-[82%] px-4 py-3 text-sm lg:text-base leading-relaxed whitespace-pre-wrap ${
          isUser
            ? isDay
              ? "bg-gradient-to-br from-sky-400 to-cyan-500 text-white rounded-t-[20px] rounded-bl-[20px] rounded-br-[4px] shadow-lg shadow-sky-400/15"
              : "bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white rounded-t-[20px] rounded-bl-[20px] rounded-br-[4px] shadow-lg shadow-fuchsia-500/15"
            : isDay
            ? "bg-white border border-sky-100 text-sky-800 rounded-t-[20px] rounded-br-[20px] rounded-bl-[4px] shadow-sm"
            : "bg-white/[0.06] border border-white/[0.08] text-white/90 rounded-t-[20px] rounded-br-[20px] rounded-bl-[4px]"
        }`}
      >
        {content}
        <div className="flex items-center justify-between mt-1.5">
          {time && (
            <p className={`text-[10px] ${
              isUser ? "text-white/50" : isDay ? "text-sky-400" : "text-white/25"
            }`}>
              {time}
            </p>
          )}
          {!isUser && onSpeak && (
            <button
              onClick={(e) => { e.stopPropagation(); onSpeak(); }}
              className={`p-1 rounded-lg transition-colors ${
                isDay ? "hover:bg-sky-50 text-sky-300" : "hover:bg-white/5 text-white/20"
              }`}
              title="השמע"
            >
              <Volume2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
