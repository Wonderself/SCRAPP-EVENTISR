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
              ? "bg-[#2196c8] text-white rounded-t-[20px] rounded-bl-[20px] rounded-br-[4px]"
              : "bg-[#e65100] text-white rounded-t-[20px] rounded-bl-[20px] rounded-br-[4px]"
            : isDay
            ? "bg-white border border-[#d8eef5] text-[#1a3a4a] rounded-t-[20px] rounded-br-[20px] rounded-bl-[4px] shadow-sm"
            : "bg-[#2a2035] border border-[#3a2540] text-[#f5e6d8] rounded-t-[20px] rounded-br-[20px] rounded-bl-[4px]"
        }`}
      >
        {content}
        {time && (
          <p className={`text-[10px] mt-1.5 ${
            isUser ? "text-white/50" : isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]"
          }`}>
            {time}
          </p>
        )}
      </div>
    </div>
  );
}
