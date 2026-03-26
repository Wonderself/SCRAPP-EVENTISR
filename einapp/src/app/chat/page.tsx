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
            "היי נשמה! מה נשמע? מוכנה ליום?",
            "בוקר טוב מאמי! ספרי לי מה בתוכנית",
            "שלום חביבה, יאללה נתחיל את היום",
          ]
        : [
            "ערב טוב נשמה, איך היה היום?",
            "היי מאמי, ספרי לי איך עבר היום",
            "ערב טוב חביבה! הכל בסדר?",
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
        { role: "assistant", content: "בעיה בחיבור נשמה, נסי שוב", time: now },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const isDay = mode === "day";

  if (!mounted) return <div className="min-h-screen bg-[#f0f9ff]" />;

  return (
    <div className={`min-h-screen flex flex-col pb-20 ${isDay ? "bg-[#f0f9ff]" : "bg-[#0f0a1a]"}`}>
      {/* Header */}
      <div
        className={`px-5 pt-12 pb-4 flex items-center gap-3 ${
          isDay
            ? "bg-gradient-to-l from-[#0e7490] to-[#06b6d4]"
            : "bg-gradient-to-l from-[#7c2d12] to-[#be185d]"
        }`}
      >
        <button onClick={() => router.push("/dashboard")} className="text-white/60 hover:text-white transition-colors">
          <ArrowRight size={22} />
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${
            isDay ? "bg-white/20" : "bg-white/10"
          }`}>
            E
          </div>
          <div>
            <h1 className="font-bold text-white text-base">Einapp</h1>
            <p className="text-[10px] text-white/40 tracking-widest uppercase">your assistant</p>
          </div>
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
              isDay ? "bg-white text-cyan-300" : "bg-white/5 text-orange-300/40"
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
      <div className={`fixed bottom-[68px] left-0 right-0 px-4 py-3 ${
        isDay ? "bg-[#f0f9ff]/90 backdrop-blur-xl" : "bg-[#0f0a1a]/90 backdrop-blur-xl"
      }`}>
        <div className="flex gap-2 max-w-lg mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="כתבי הודעה..."
            className={`flex-1 px-5 py-3.5 rounded-2xl border-2 outline-none text-sm transition-all ${
              isDay
                ? "bg-white border-cyan-100 focus:border-cyan-400 text-cyan-900 placeholder-cyan-300"
                : "bg-white/5 border-white/10 focus:border-orange-400 text-white placeholder-white/20"
            }`}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all disabled:opacity-20 ${
              isDay
                ? "bg-gradient-to-br from-cyan-500 to-teal-400 text-white shadow-md shadow-cyan-200/50"
                : "bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-md shadow-orange-500/20"
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
