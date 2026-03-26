"use client";

interface Props {
  role: "user" | "assistant";
  content: string;
  time?: string;
}

export default function ChatBubble({ role, content, time }: Props) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-start" : "justify-end"} mb-2`}>
      <div
        className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-dolphin-ocean text-white rounded-t-[18px] rounded-bl-[18px] rounded-br-[4px]"
            : "bg-white border border-dolphin-sand text-gray-800 rounded-t-[18px] rounded-br-[18px] rounded-bl-[4px]"
        }`}
      >
        {content}
        {time && (
          <p className={`text-[10px] mt-1 ${isUser ? "text-white/60" : "text-dolphin-sand-dark"}`}>
            {time}
          </p>
        )}
      </div>
    </div>
  );
}
