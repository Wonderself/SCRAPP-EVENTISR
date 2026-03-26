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
        ? ["היי נשמה! מה נשמע? מוכנה ליום?", "בוקר טוב מאמי! ספרי לי מה בתוכנית", "שלום חביבה, יאללה נתחיל את היום"]
        : ["ערב טוב נשמה, איך היה היום?", "היי מאמי, ספרי לי איך עבר היום", "ערב טוב חביבה! הכל בסדר?"];
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
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, time: replyTime }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "בעיה בחיבור נשמה, נסי שוב", time: now }]);
    } finally {
      setLoading(false);
    }
  }

  const isDay = mode === "day";
  if (!mounted) return <div className="min-h-screen bg-sky-100" />;

  return (
    <div className={`min-h-screen flex flex-col pb-[76px] lg:pb-[88px] ${isDay ? "bg-sky-50" : "bg-[#0d0820]"}`}>
      {/* Header */}
      <div className={`px-5 pt-12 pb-4 lg:pt-14 lg:pb-5 flex items-center gap-4 ${
        isDay ? "bg-gradient-to-l from-sky-400 to-cyan-400" : "bg-gradient-to-l from-orange-500 to-pink-500"
      }`}>
        <button onClick={() => router.push("/dashboard")} className="cartoon-btn text-white/70 hover:text-white">
          <ArrowRight size={24} strokeWidth={3} />
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center text-white font-black text-base lg:text-xl ${
            isDay ? "bg-white/20 shadow-[0_2px_0_rgba(255,255,255,0.1)]" : "bg-white/10 shadow-[0_2px_0_rgba(255,255,255,0.05)]"
          }`}>
            E
          </div>
          <div>
            <h1 className="font-black text-white text-lg lg:text-2xl">Einapp</h1>
            <p className="text-[10px] lg:text-xs text-white/40 tracking-widest uppercase font-bold">your assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 space-y-1 max-w-3xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div key={i} className="animate-fade-up no-color-transition" style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
            <ChatBubble role={msg.role} content={msg.content} time={msg.time} isDay={isDay} />
          </div>
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className={`px-5 py-3 rounded-2xl ${isDay ? "cartoon-card-day" : "cartoon-card-sunset"}`}>
              <span className="inline-flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`fixed bottom-[76px] lg:bottom-[88px] left-0 right-0 px-4 lg:px-8 py-3 ${
        isDay ? "bg-sky-50/95 backdrop-blur-md" : "bg-[#0d0820]/95 backdrop-blur-md"
      }`}>
        <div className="flex gap-3 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="כתבי הודעה..."
            className={`flex-1 px-5 py-4 lg:py-5 rounded-2xl border-3 outline-none text-sm lg:text-lg font-bold transition-all ${
              isDay
                ? "bg-white border-sky-200 focus:border-sky-400 text-sky-800 placeholder-sky-300"
                : "bg-[#1e1330] border-white/10 focus:border-orange-400 text-white placeholder-white/20"
            }`}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`cartoon-btn w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center transition-all disabled:opacity-20 ${
              isDay
                ? "bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-[0_4px_0_#0891b2]"
                : "bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-[0_4px_0_#c2410c]"
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      <BottomTabs isDay={isDay} />
    </div>
  );
}
