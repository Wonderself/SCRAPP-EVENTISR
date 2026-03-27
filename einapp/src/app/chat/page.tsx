"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { Send, ArrowRight, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ChatBubble from "@/components/ChatBubble";
import BottomTabs from "@/components/BottomTabs";
import { useVoice } from "@/hooks/useVoice";

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
  return (
    <Suspense fallback={<div className="h-[100dvh] bg-sky-100" />}>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [mode, setMode] = useState<"day" | "sunset">("day");
  const [mounted, setMounted] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const voice = useVoice();
  const prevTranscriptRef = useRef("");

  useEffect(() => {
    setMounted(true);
    setMode(getTimeMode());
    // If ?voice=1, enable voice mode
    if (searchParams.get("voice") === "1") {
      setVoiceMode(true);
      setAutoSpeak(true);
    }
    fetch("/api/chat/history")
      .then((r) => r.json())
      .then((data) => {
        if (data.messages?.length > 0) {
          setMessages(data.messages);
          setGreeted(true);
        }
      })
      .catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    if (!greeted && mounted && messages.length === 0) {
      setGreeted(true);
      const isDay = mode === "day";
      const now = new Date();
      const h = now.getHours();
      const day = now.getDay();
      const isFridayAfternoon = day === 5 && h >= 12;
      const isSaturday = day === 6;

      // Check for Jewish holiday
      const m2 = now.getMonth() + 1;
      const d2 = now.getDate();
      const dateKey = `${m2}-${d2}`;
      const holidays2026: Record<string, string> = {
        "3-3": "פורים שמח נשמהההה! 🎭🎉 חג שמח מאמי! ספרי איך חוגגים בדולפין!",
        "3-2": "ערב פורים מאמי! 🎭 מחר חג! מה התוכניות?",
        "3-22": "ערב פסח נשמהההה! 🍷✨ חג חירות מאמי! הכל מוכן?",
        "3-23": "חג פסח שמח מאאאמי! 🍷🌺 חג חירות!",
        "9-12": "שנה טובה ומתוקה נשמהההה! 🍎🍯✨",
        "9-21": "גמר חתימה טובה נשמהההה! 🕯️✨",
        "12-15": "חנוכה שמח נשמהההה! 🕎✨ חג אורים מאמי!",
      };
      const holidayGreeting = holidays2026[dateKey];

      let greeting: string;
      if (holidayGreeting) {
        greeting = holidayGreeting;
      } else if (isFridayAfternoon) {
        const shabbatGreetings = [
          "שבת שלוווום נשמהההה! 🕯️✨ שבת מנוחה מאמי!",
          "שבת שלום מאאאמי! 🕯️💛 מגיע לך לנוח!",
          "שבת שלום מלכההה! 🕯️🌺 תהני מהשבת!",
        ];
        greeting = shabbatGreetings[Math.floor(Math.random() * shabbatGreetings.length)];
      } else if (isSaturday) {
        greeting = "שבת שלום נשמהההה! 🕯️💛 איך השבת? מנוחה טובה מאמי!";
      } else {
        const greetings = isDay
          ? [
              "הייייי נשמהההה! 🐬💛 מה נשמע מאמי? מוכנה ליום מטורף?",
              "בוקר טוווב מלכה! ☀️🌊 יאללה ספרי לי מה בתוכנית!",
              "שלום שלום חביבה שלי! 💛 איך את היום? ספרי הכל!",
              "מאמייי! בוקר אור! ☀️✨ אני פה בשבילך כרגיל!",
            ]
          : [
              "הייייי נשמהההה! 🌙💛 איך היה היום? ספרי ספרי!",
              "ערב טוווב מאמי שלי! 🌊✨ איך עבר היום?",
              "מה קורה מלכה? 💛🐬 הכל טוב? ספרי לי!",
              "היי חביבה! 🌙 סיימת את היום? בואי נדבר!",
            ];
        greeting = greetings[Math.floor(Math.random() * greetings.length)];
      }
      const timeStr = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
      setMessages([{ role: "assistant", content: greeting, time: timeStr }]);
      if (autoSpeak && voice.isSupported) {
        setTimeout(() => voice.speak(greeting), 500);
      }
    }
  }, [greeted, mounted, messages.length, mode, autoSpeak, voice]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When voice transcript changes and listening stops, send the message
  useEffect(() => {
    if (voice.transcript && voice.transcript !== prevTranscriptRef.current) {
      setInput(voice.transcript);
      prevTranscriptRef.current = voice.transcript;
    }
  }, [voice.transcript]);

  // Auto-send when listening stops and we have a transcript
  useEffect(() => {
    if (!voice.isListening && voice.transcript && voiceMode) {
      const text = voice.transcript.trim();
      if (text) {
        sendMessageText(text);
      }
    }
  }, [voice.isListening]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessageText = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
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
      const reply = data.reply;
      setMessages((prev) => [...prev, { role: "assistant", content: reply, time: replyTime }]);
      // Auto-speak response in voice mode
      if (autoSpeak && voice.isSupported) {
        voice.speak(reply);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "בעיה בחיבור נשמה, נסי שוב", time: now }]);
    } finally {
      setLoading(false);
    }
  }, [loading, autoSpeak, voice]);

  async function sendMessage() {
    sendMessageText(input.trim());
  }

  function toggleVoiceMode() {
    if (voice.isListening) {
      voice.stopListening();
    } else {
      setVoiceMode(true);
      setAutoSpeak(true);
      voice.startListening();
    }
  }

  const isDay = mode === "day";
  if (!mounted) return <div className="h-[100dvh] bg-sky-100" />;

  return (
    <div className={`h-[100dvh] flex flex-col overflow-hidden ${
      isDay
        ? "bg-gradient-to-b from-sky-50 via-cyan-50/50 to-white"
        : "bg-gradient-to-b from-[#1a0e2e] via-[#12081f] to-[#0a0514]"
    }`}>
      {/* Header */}
      <div className={`shrink-0 px-4 pt-[env(safe-area-inset-top,8px)] pb-2 sm:pb-3 lg:pt-12 lg:pb-4 flex items-center justify-between ${
        isDay
          ? "bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-300"
          : "bg-gradient-to-br from-rose-500 via-fuchsia-600 to-violet-700"
      }`}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="text-white/70 hover:text-white transition-colors">
            <ArrowRight size={20} strokeWidth={3} />
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center text-lg lg:text-xl ${
              isDay ? "bg-white/20" : "bg-white/10"
            }`}>
              🐬
            </div>
            <div>
              <h1 className="font-black text-white text-base lg:text-xl">Einapp</h1>
              <p className="text-[9px] lg:text-[11px] text-white/50 tracking-widest font-bold">החברה הכי טובה שלך 💛</p>
            </div>
          </div>
        </div>
        {/* Auto-speak toggle */}
        {voice.isSupported && (
          <button
            onClick={() => {
              setAutoSpeak(!autoSpeak);
              if (voice.isSpeaking) voice.stopSpeaking();
            }}
            className={`p-2 rounded-xl transition-colors ${
              autoSpeak ? "bg-white/20" : "bg-white/10"
            }`}
            title={autoSpeak ? "השתק קול" : "הפעל קול"}
          >
            {autoSpeak ? (
              <Volume2 size={18} className="text-white" />
            ) : (
              <VolumeX size={18} className="text-white/40" />
            )}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 lg:px-8 py-3 space-y-1 max-w-3xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div key={i}>
            <ChatBubble
              role={msg.role}
              content={msg.content}
              time={msg.time}
              isDay={isDay}
              onSpeak={voice.isSupported ? () => voice.speak(msg.content) : undefined}
            />
          </div>
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className={`px-4 py-2.5 rounded-2xl ${
              isDay
                ? "bg-white border border-sky-100"
                : "bg-white/10 border border-white/15"
            }`}>
              <span className="inline-flex gap-1.5">
                <span className={`w-2 h-2 rounded-full animate-bounce ${isDay ? "bg-sky-300" : "bg-fuchsia-400"}`} style={{ animationDelay: "0ms" }} />
                <span className={`w-2 h-2 rounded-full animate-bounce ${isDay ? "bg-sky-300" : "bg-fuchsia-400"}`} style={{ animationDelay: "150ms" }} />
                <span className={`w-2 h-2 rounded-full animate-bounce ${isDay ? "bg-sky-300" : "bg-fuchsia-400"}`} style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice listening indicator */}
      {voice.isListening && (
        <div className={`shrink-0 px-4 py-2 text-center ${
          isDay ? "bg-rose-50 border-t border-rose-100" : "bg-fuchsia-500/10 border-t border-fuchsia-500/10"
        }`}>
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-1">
              <span className={`w-1.5 h-4 rounded-full animate-pulse ${isDay ? "bg-rose-400" : "bg-fuchsia-400"}`} style={{ animationDelay: "0ms" }} />
              <span className={`w-1.5 h-6 rounded-full animate-pulse ${isDay ? "bg-rose-500" : "bg-fuchsia-500"}`} style={{ animationDelay: "150ms" }} />
              <span className={`w-1.5 h-3 rounded-full animate-pulse ${isDay ? "bg-rose-400" : "bg-fuchsia-400"}`} style={{ animationDelay: "300ms" }} />
              <span className={`w-1.5 h-5 rounded-full animate-pulse ${isDay ? "bg-rose-500" : "bg-fuchsia-500"}`} style={{ animationDelay: "100ms" }} />
              <span className={`w-1.5 h-4 rounded-full animate-pulse ${isDay ? "bg-rose-400" : "bg-fuchsia-400"}`} style={{ animationDelay: "250ms" }} />
            </div>
            <span className={`text-xs font-bold ${isDay ? "text-rose-500" : "text-fuchsia-300"}`}>
              {voice.transcript || "מקשיבה..."}
            </span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className={`shrink-0 px-3 lg:px-8 py-2 ${
        isDay
          ? "bg-white/95 backdrop-blur-xl border-t border-sky-100/50"
          : "bg-[#0a0514]/95 backdrop-blur-xl border-t border-white/10"
      }`}>
        <div className="flex gap-2 max-w-3xl mx-auto">
          {/* Mic button */}
          {voice.isSupported && (
            <button
              onClick={toggleVoiceMode}
              disabled={loading}
              className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center transition-all disabled:opacity-20 ${
                voice.isListening
                  ? isDay
                    ? "bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-400/30 animate-pulse"
                    : "bg-gradient-to-br from-fuchsia-400 to-purple-500 text-white shadow-lg shadow-fuchsia-400/30 animate-pulse"
                  : isDay
                  ? "bg-sky-50 border border-sky-200 text-sky-400"
                  : "bg-white/10 border border-white/15 text-white/50"
              }`}
            >
              {voice.isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="כתבי הודעה..."
            className={`flex-1 px-4 py-3 lg:py-4 rounded-2xl border outline-none text-sm lg:text-base font-bold transition-all ${
              isDay
                ? "bg-sky-50/80 border-sky-200 focus:border-sky-400 text-sky-800 placeholder-sky-300"
                : "bg-white/10 border-white/15 focus:border-fuchsia-400 text-white placeholder-white/35"
            }`}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center transition-all disabled:opacity-20 ${
              isDay
                ? "bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-lg shadow-sky-400/20"
                : "bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white shadow-lg shadow-fuchsia-500/20"
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
