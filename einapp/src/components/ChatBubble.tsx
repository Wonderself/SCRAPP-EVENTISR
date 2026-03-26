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
    <div className={`flex ${isUser ? "justify-start" : "justify-end"} mb-3`}>
      <div
        className={`max-w-[82%] px-5 py-3.5 text-sm lg:text-base font-medium leading-relaxed whitespace-pre-wrap ${
          isUser
            ? isDay
              ? "bg-gradient-to-br from-sky-400 to-cyan-500 text-white rounded-t-[24px] rounded-bl-[24px] rounded-br-[6px] shadow-[0_3px_0_#0891b2]"
              : "bg-gradient-to-br from-orange-500 to-pink-500 text-white rounded-t-[24px] rounded-bl-[24px] rounded-br-[6px] shadow-[0_3px_0_#c2410c]"
            : isDay
            ? "bg-white border-3 border-sky-100 text-sky-800 rounded-t-[24px] rounded-br-[24px] rounded-bl-[6px] shadow-[0_3px_0_#e0f2fe]"
            : "bg-[#1e1330] border-3 border-white/5 text-white/85 rounded-t-[24px] rounded-br-[24px] rounded-bl-[6px] shadow-[0_3px_0_rgba(255,255,255,0.02)]"
        }`}
      >
        {content}
        {time && (
          <p className={`text-[10px] lg:text-xs mt-1.5 font-bold ${
            isUser ? "text-white/40" : isDay ? "text-sky-300" : "text-white/15"
          }`}>
            {time}
          </p>
        )}
      </div>
    </div>
  );
}
