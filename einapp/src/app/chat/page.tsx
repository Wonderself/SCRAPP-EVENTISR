"use client";

import { useState, useEffect, useRef } from "react";
import { Send, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatBubble from "@/components/ChatBubble";
import BottomTabs from "@/components/BottomTabs";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Load recent conversations
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
    // Auto-greet on first open of the day
    if (!greeted && messages.length === 0) {
      setGreeted(true);
      const greetings = [
        "הייי עינת! מה נשמע נשמה? 💛 מוכנה ליום?",
        "שלום מלכה! ☀️ איך את היום?",
        "אלוהה! 🐬 ספרי לי מה חדש!",
      ];
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      const now = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
      setMessages([{ role: "assistant", content: greeting, time: now }]);
    }
  }, [greeted, messages.length]);

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
        { role: "assistant", content: "אוי, משהו קרה 😅 תנסי שוב!", time: now },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dolphin-cream flex flex-col pb-20">
      {/* Header */}
      <div className="bg-gradient-to-l from-dolphin-ocean to-dolphin-ocean-dark text-white p-4 flex items-center gap-3">
        <button onClick={() => router.push("/dashboard")}>
          <ArrowRight size={22} />
        </button>
        <div>
          <h1 className="font-bold text-lg">Einapp 🐬</h1>
          <p className="text-xs text-dolphin-ocean-light">החברה שלך</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} content={msg.content} time={msg.time} />
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className="bg-white border border-dolphin-sand rounded-[18px] px-4 py-2 text-sm text-dolphin-sand-dark">
              מקלידה... 🐬
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-dolphin-sand-light p-3">
        <div className="flex gap-2 max-w-lg mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="כתבי לי... 💬"
            className="flex-1 px-4 py-3 rounded-full border border-dolphin-sand focus:border-dolphin-ocean focus:outline-none text-sm bg-dolphin-cream"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-full bg-dolphin-ocean text-white flex items-center justify-center hover:bg-dolphin-ocean-dark transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      <BottomTabs />
    </div>
  );
}
