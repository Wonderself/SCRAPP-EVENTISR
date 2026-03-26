import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { chatWithClaude } from "@/lib/ai-chat";
import { saveConversation, setAppState, getTasksForDate, getCompletionsForDate } from "@/lib/db";
import { saveRawConversation } from "@/lib/memory";
import { toDateString, getDayKey, getDayName, getWeekDates } from "@/lib/hebrew";

const EINAT_PHONE = process.env.EINAT_PHONE_NUMBER || "";
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

function verifySignature(body: string, signature: string | null): boolean {
  if (!APP_SECRET || !signature) return !APP_SECRET; // Skip if no secret configured
  const expected = "sha256=" + crypto.createHmac("sha256", APP_SECRET).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

// Webhook verification (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (!VERIFY_TOKEN) {
    return NextResponse.json({ error: "WHATSAPP_VERIFY_TOKEN not configured" }, { status: 500 });
  }

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

// Incoming messages (POST)
export async function POST(req: NextRequest) {
  // Verify webhook signature
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");
  if (!verifySignature(rawBody, signature)) {
    console.error("[WhatsApp] Invalid webhook signature");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);

  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];

  if (!message) {
    return NextResponse.json({ ok: true });
  }

  const from = message.from;

  // Only accept messages from Einat
  if (EINAT_PHONE && normalizePhone(from) !== normalizePhone(EINAT_PHONE)) {
    console.log(`[WhatsApp] Ignoring message from unknown sender: ${from}`);
    return NextResponse.json({ ok: true });
  }

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

    if (tasks.length === 0) return "אין משימות להיום! יום רגוע";

    let msg = `משימות להיום (${getDayName(today.getDay())}):\n\n`;
    tasks.forEach((t: any) => {
      const done = completedIds.has(t.id);
      const prefix = done ? "V" : t.priority === "urgent" ? "!" : t.type === "recurring" ? "~" : "-";
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

    if (tasks.length === 0) return "אין משימות למחר!";

    let msg = `משימות למחר (${getDayName(tomorrow.getDay())}):\n\n`;
    tasks.forEach((t: any) => {
      const prefix = t.priority === "urgent" ? "!" : t.type === "recurring" ? "~" : "-";
      msg += `${prefix} ${t.description}\n`;
    });
    return msg;
  }

  if (lower === "שבוע") {
    const weekDates = getWeekDates(today);
    let msg = "סקירת השבוע:\n\n";
    weekDates.forEach((d) => {
      const dateStr = toDateString(d);
      const dayKey = getDayKey(d.getDay());
      const tasks = getTasksForDate(dateStr, dayKey);
      const isToday = dateStr === toDateString(today);
      msg += `${isToday ? ">> " : ""}${getDayName(d.getDay())} (${d.getDate()})`;
      if (tasks.length === 0) {
        msg += " — ריק\n";
      } else {
        msg += ` — ${tasks.length} משימות\n`;
      }
    });
    return msg;
  }

  if (lower === "זיכרון") {
    return "אני זוכרת הכל על דולפין וילג'! ספקים, צוות, נהלים, אורחים קבועים... תשאלי אותי כל דבר";
  }

  return null;
}
