import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { chatWithClaude } from "@/lib/ai-chat";
import { saveConversation, setAppState, getTasksForDate, getCompletionsForDate } from "@/lib/db";
import { saveRawConversation } from "@/lib/memory";
import { toDateString, getDayKey, getDayName, getWeekDates } from "@/lib/hebrew";

const EINAT_PHONE = process.env.EINAT_PHONE_NUMBER || "";
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "einapp_verify";

// Webhook verification (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

// Incoming messages (POST)
export async function POST(req: NextRequest) {
  const body = await req.json();

  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];

  if (!message) {
    return NextResponse.json({ ok: true });
  }

  const from = message.from;
  const dateStr = toDateString(new Date());

  // Update last message timestamp
  setAppState("last_user_message_at", new Date().toISOString());

  if (message.type === "text") {
    const text = message.text.body.trim();

    // Quick commands
    const quickReply = handleQuickCommand(text);
    if (quickReply) {
      await sendWhatsAppMessage(from, quickReply);
      return NextResponse.json({ ok: true });
    }

    // Save user message
    saveConversation("whatsapp", "user", text);

    // Chat with Claude
    const reply = await chatWithClaude(text, "whatsapp");

    // Save assistant message
    saveConversation("whatsapp", "assistant", reply);

    // Save raw conversation
    const time = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    saveRawConversation(dateStr, `[${time}] עינת (WA): ${text}\n[${time}] Einapp: ${reply}`);

    // Send reply
    await sendWhatsAppMessage(from, reply);
  }

  return NextResponse.json({ ok: true });
}

function handleQuickCommand(text: string): string | null {
  const lower = text.trim();
  const today = new Date();

  if (lower === "היום") {
    const dateStr = toDateString(today);
    const dayKey = getDayKey(today.getDay());
    const tasks = getTasksForDate(dateStr, dayKey);
    const completions = getCompletionsForDate(dateStr);
    const completedIds = new Set(completions.map((c) => c.task_id));

    if (tasks.length === 0) return "🐬 אין משימות להיום! יום רגוע 😎";

    let msg = `📋 משימות להיום (${getDayName(today.getDay())}):\n\n`;
    tasks.forEach((t: any) => {
      const done = completedIds.has(t.id);
      const prefix = done ? "✅" : t.priority === "urgent" ? "🔴" : t.type === "recurring" ? "🔄" : "📌";
      msg += `${prefix} ${t.description}${done ? " (בוצע)" : ""}\n`;
    });
    return msg;
  }

  if (lower === "מחר") {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dateStr = toDateString(tomorrow);
    const dayKey = getDayKey(tomorrow.getDay());
    const tasks = getTasksForDate(dateStr, dayKey);

    if (tasks.length === 0) return "🐬 אין משימות למחר! 😎";

    let msg = `📋 משימות למחר (${getDayName(tomorrow.getDay())}):\n\n`;
    tasks.forEach((t: any) => {
      const prefix = t.priority === "urgent" ? "🔴" : t.type === "recurring" ? "🔄" : "📌";
      msg += `${prefix} ${t.description}\n`;
    });
    return msg;
  }

  if (lower === "שבוע") {
    const weekDates = getWeekDates(today);
    let msg = "📅 סקירת השבוע:\n\n";
    weekDates.forEach((d) => {
      const dateStr = toDateString(d);
      const dayKey = getDayKey(d.getDay());
      const tasks = getTasksForDate(dateStr, dayKey);
      const isToday = dateStr === toDateString(today);
      msg += `${isToday ? "👉 " : ""}${getDayName(d.getDay())} (${d.getDate()})`;
      if (tasks.length === 0) {
        msg += " — ריק\n";
      } else {
        msg += ` — ${tasks.length} משימות\n`;
      }
    });
    return msg;
  }

  if (lower === "זיכרון") {
    return "🧠 אני זוכרת הכל על דולפין וילג'! ספקים, צוות, נהלים, אורחים קבועים... תשאלי אותי כל דבר 💛";
  }

  return null;
}
