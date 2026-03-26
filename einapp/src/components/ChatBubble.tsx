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
        className={`max-w-[82%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? isDay
              ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-t-[20px] rounded-bl-[20px] rounded-br-[4px] shadow-sm shadow-cyan-200/30"
              : "bg-gradient-to-br from-orange-500 to-pink-500 text-white rounded-t-[20px] rounded-bl-[20px] rounded-br-[4px] shadow-sm shadow-orange-500/20"
            : isDay
            ? "bg-white text-cyan-900 rounded-t-[20px] rounded-br-[20px] rounded-bl-[4px] shadow-sm shadow-cyan-100/50"
            : "bg-white/[0.06] text-white/90 rounded-t-[20px] rounded-br-[20px] rounded-bl-[4px]"
        }`}
      >
        {content}
        {time && (
          <p className={`text-[10px] mt-1.5 ${
            isUser ? "text-white/50" : isDay ? "text-cyan-300" : "text-white/20"
          }`}>
            {time}
          </p>
        )}
      </div>
    </div>
  );
}
