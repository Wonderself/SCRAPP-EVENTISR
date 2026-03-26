"use client";

interface Props {
  role: "user" | "assistant";
  content: string;
  time?: string;
  isDay: boolean;
}

export default function ChatBubble({ role, content, time, isDay }: Props) {
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
        {time && (
          <p className={`text-[10px] mt-1.5 ${
            isUser ? "text-white/50" : isDay ? "text-sky-400" : "text-white/25"
          }`}>
            {time}
          </p>
        )}
      </div>
    </div>
  );
}
