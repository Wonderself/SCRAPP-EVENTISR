"use client";

import { useState, useEffect, useRef } from "react";
import { Send, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatBubble from "@/components/ChatBubble";
import BottomTabs from "@/components/BottomTabs";

function getTimeMode(): "day" | "sunset" {
  const now = new Date();
  const m = now.getHours() * 60 + now.getMinutes();
  return m >= 990 || m < 300 ? "sunset" : "day";
}

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [mode, setMode] = useState<"day" | "sunset">("day");
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setMode(getTimeMode());

    fetch("/api/chat/history")
      .then((r) => r.json())
      .then((data) => {
        if (data.messages?.length > 0) {
          setMessages(data.messages);
          setGreeted(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!greeted && mounted && messages.length === 0) {
      setGreeted(true);
      const isDay = mode === "day";
      const greetings = isDay
        ? [
            "היי עינת, מה נשמע? מוכנה ליום?",
            "בוקר טוב עינת! ספרי לי מה בתוכנית",
            "שלום עינת, יאללה נתחיל את היום",
          ]
        : [
            "ערב טוב עינת, איך היה היום?",
            "היי עינת, ספרי לי איך עבר היום",
            "ערב טוב! הכל בסדר?",
          ];
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      const now = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
      setMessages([{ role: "assistant", content: greeting, time: now }]);
    }
  }, [greeted, mounted, messages.length, mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    const now = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

    setMessages((prev) => [...prev, { role: "user", content: text, time: now }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const replyTime = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, time: replyTime },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "בעיה בחיבור, נסי שוב", time: now },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const isDay = mode === "day";

  if (!mounted) return <div className="min-h-screen bg-[#F0F7FA]" />;

  return (
    <div className={`min-h-screen flex flex-col pb-20 ${isDay ? "bg-[#F0F7FA]" : "bg-[#1a1520]"}`}>
      {/* Header */}
      <div
        className={`px-4 pt-12 pb-4 flex items-center gap-3 ${
          isDay
            ? "bg-gradient-to-l from-[#1a7fb5] to-[#47b8e0]"
            : "bg-gradient-to-l from-[#1a1025] to-[#4a1a3a]"
        }`}
      >
        <button onClick={() => router.push("/dashboard")} className="text-white/70 hover:text-white">
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="font-bold text-white">Einapp</h1>
          <p className="text-[10px] text-white/50 tracking-widest uppercase">your assistant</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((msg, i) => (
          <div key={i} className="animate-fade-up no-color-transition" style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
            <ChatBubble role={msg.role} content={msg.content} time={msg.time} isDay={isDay} />
          </div>
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className={`px-4 py-3 rounded-2xl text-sm ${
              isDay ? "bg-white text-[#8ab0c0]" : "bg-[#2a2035] text-[#8a6a5a]"
            }`}>
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`fixed bottom-20 left-0 right-0 px-4 py-3 ${
        isDay ? "bg-[#F0F7FA]/90 backdrop-blur-md" : "bg-[#1a1520]/90 backdrop-blur-md"
      }`}>
        <div className="flex gap-2 max-w-lg mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="כתבי הודעה..."
            className={`flex-1 px-5 py-3.5 rounded-2xl border outline-none text-sm transition-all ${
              isDay
                ? "bg-white border-[#d8eef5] focus:border-[#2196c8] text-[#1a3a4a] placeholder-[#8ab0c0]"
                : "bg-[#2a2035] border-[#3a2540] focus:border-[#e65100] text-[#f5e6d8] placeholder-[#8a6a5a]"
            }`}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all disabled:opacity-30 ${
              isDay
                ? "bg-[#2196c8] text-white hover:bg-[#1a7fb5]"
                : "bg-[#e65100] text-white hover:bg-[#c2185b]"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      <BottomTabs isDay={isDay} />
    </div>
  );
}
