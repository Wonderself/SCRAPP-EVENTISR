import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendWhatsAppMessage, sendWhatsAppVoiceNote, getMediaUrl, downloadMedia } from "@/lib/whatsapp";
import { chatWithClaude, extractTasks } from "@/lib/ai-chat";
import { saveConversation, setAppState, getTasksForDate, getCompletionsForDate, createTask, toggleTaskCompletion } from "@/lib/db";
import { sendUrgentAlert } from "@/lib/scheduler";
import { saveRawConversation } from "@/lib/memory";
import { toDateString, getDayKey, getDayName, getWeekDates } from "@/lib/hebrew";
import { transcribeAudio, isSTTConfigured } from "@/lib/google-stt";
import { synthesizeSpeech, isTTSConfigured } from "@/lib/google-tts";

const EINAT_PHONE = process.env.EINAT_PHONE_NUMBER || "";
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;
// Send voice replies when Einat sends voice notes
const VOICE_REPLY_ENABLED = process.env.WHATSAPP_VOICE_REPLY !== "false";

function verifySignature(body: string, signature: string | null): boolean {
  if (!APP_SECRET) {
    console.warn("[WhatsApp] WHATSAPP_APP_SECRET not configured — skipping signature verification");
    return true;
  }
  if (!signature) return false;
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
  const DEV_PHONE = process.env.DEV_PHONE_NUMBER || "";

  // Only accept messages from Einat or Dev
  const normalFrom = normalizePhone(from);
  const isEinat = EINAT_PHONE && normalFrom === normalizePhone(EINAT_PHONE);
  const isDev = DEV_PHONE && normalFrom === normalizePhone(DEV_PHONE);

  if (!isEinat && !isDev) {
    console.log(`[WhatsApp] Ignoring message from unknown sender: ${from}`);
    return NextResponse.json({ ok: true });
  }

  const dateStr = toDateString(new Date());
  setAppState("last_user_message_at", new Date().toISOString());

  // Handle text messages
  if (message.type === "text") {
    const text = message.text.body.trim();
    await handleTextMessage(from, text, dateStr, false);
  }

  // Handle audio/voice messages
  if (message.type === "audio") {
    await handleVoiceMessage(from, message.audio, dateStr);
  }

  return NextResponse.json({ ok: true });
}

async function handleTextMessage(from: string, text: string, dateStr: string, isFromVoice: boolean) {
  // Quick commands
  const quickReply = handleQuickCommand(text);
  if (quickReply) {
    if (isFromVoice && VOICE_REPLY_ENABLED && isTTSConfigured()) {
      await sendVoiceReply(from, quickReply);
    } else {
      await sendWhatsAppMessage(from, quickReply);
    }
    return;
  }

  // Save user message
  saveConversation("whatsapp", "user", text);

  // Chat with Claude
  const rawReply = await chatWithClaude(text, "whatsapp");

  // Extract any tasks the AI created
  const { cleanReply: reply, tasks, doneTasks } = extractTasks(rawReply);
  for (const task of tasks) {
    try {
      createTask({
        description: task.description,
        type: task.type,
        priority: task.priority,
        date: task.date || undefined,
        time: task.time || undefined,
        days_of_week: task.days_of_week || undefined,
      });
      console.log(`[WhatsApp] Auto-created ${task.type} task: "${task.description}" on ${task.date || "recurring"} at ${task.time || "no time"}`);
      if (task.priority === "urgent") {
        sendUrgentAlert(task.description, task.date || dateStr).catch(console.error);
      }
    } catch (e) {
      console.error("[WhatsApp] Failed to create task:", e);
    }
  }

  // Handle [DONE] — mark matching tasks as completed
  for (const done of doneTasks) {
    try {
      const dayKey = getDayKey(new Date().getDay());
      const todayTasks = getTasksForDate(dateStr, dayKey);
      const completions = getCompletionsForDate(dateStr);
      const completedIds = new Set(completions.map((c) => c.task_id));

      // Find best match by description
      const hint = done.descriptionHint.toLowerCase();
      const match = todayTasks.find((t: any) =>
        !completedIds.has(t.id) &&
        t.description.toLowerCase().includes(hint) ||
        hint.includes(t.description.toLowerCase().substring(0, 10))
      );

      if (match) {
        toggleTaskCompletion((match as any).id, dateStr);
        console.log(`[WhatsApp] Marked task done: "${(match as any).description}"`);
      }
    } catch (e) {
      console.error("[WhatsApp] Failed to mark task done:", e);
    }
  }

  // Save assistant message
  saveConversation("whatsapp", "assistant", reply);

  // Save raw conversation
  const time = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  saveRawConversation(dateStr, `[${time}] עינת (WA): ${text}\n[${time}] Einapp: ${reply}`);

  // Reply: voice note if message was voice + TTS enabled, else text
  if (isFromVoice && VOICE_REPLY_ENABLED && isTTSConfigured()) {
    const sent = await sendVoiceReply(from, reply);
    // Also send text as fallback
    if (!sent) {
      await sendWhatsAppMessage(from, reply);
    }
  } else {
    await sendWhatsAppMessage(from, reply);
  }
}

async function handleVoiceMessage(from: string, audio: any, dateStr: string) {
  const mediaId = audio.id;

  if (!isSTTConfigured()) {
    // Can't transcribe - ask to send text
    await sendWhatsAppMessage(from, "קיבלתי הודעה קולית אבל אין לי אפשרות לתמלל כרגע. תכתבי לי בטקסט נשמה?");
    return;
  }

  try {
    // Download the voice note
    const mediaUrl = await getMediaUrl(mediaId);
    const audioBuffer = await downloadMedia(mediaUrl);

    // Transcribe with Google STT
    const transcript = await transcribeAudio(audioBuffer, "OGG_OPUS", 16000);

    if (!transcript) {
      await sendWhatsAppMessage(from, "לא הצלחתי לשמוע מה אמרת נשמה, תנסי שוב?");
      return;
    }

    console.log(`[WhatsApp] Voice transcription: "${transcript}"`);

    // Process like a text message, but flag as voice
    await handleTextMessage(from, transcript, dateStr, true);
  } catch (error) {
    console.error("[WhatsApp] Voice message error:", error);
    await sendWhatsAppMessage(from, "הייתה בעיה עם ההודעה הקולית, תנסי שוב?");
  }
}

async function sendVoiceReply(to: string, text: string): Promise<boolean> {
  try {
    const audioBuffer = await synthesizeSpeech(text, "OGG_OPUS");
    if (!audioBuffer) return false;

    return await sendWhatsAppVoiceNote(to, audioBuffer);
  } catch (error) {
    console.error("[WhatsApp] Voice reply error:", error);
    return false;
  }
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

    if (tasks.length === 0) return "אין משימות להיום נשמה! 🎉 יום רגוע, תהני! 🌊";

    let msg = `הייי מאמי! 📋 המשימות שלך ל${getDayName(today.getDay())}:\n\n`;
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

    if (tasks.length === 0) return "אין משימות למחר! 🎉 תישני בשקט מאמי 😴💛";

    let msg = `נשמהההה! 📋 מחר (${getDayName(tomorrow.getDay())}) מחכה לך:\n\n`;
    tasks.forEach((t: any) => {
      const prefix = t.priority === "urgent" ? "!" : t.type === "recurring" ? "~" : "-";
      msg += `${prefix} ${t.description}\n`;
    });
    return msg;
  }

  if (lower === "שבוע") {
    const weekDates = getWeekDates(today);
    let msg = "מאמי! 🗓️ הנה סקירת השבוע שלך:\n\n";
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
    return "נשמהההה! 🧠🐬 אני זוכרת הכל על דולפין וילג'! ספקים, צוות, נהלים, אורחים קבועים... תשאלי אותי כל דבר מאמי!";
  }

  // "בוצע" or "בוצע 1" — mark task as done
  if (lower.startsWith("בוצע") || lower.startsWith("סיימתי") || lower.startsWith("עשיתי")) {
    const dateStr = toDateString(today);
    const dayKey = getDayKey(today.getDay());
    const tasks = getTasksForDate(dateStr, dayKey);
    const completions = getCompletionsForDate(dateStr);
    const completedIds = new Set(completions.map((c) => c.task_id));
    const pendingTasks = tasks.filter((t: any) => !completedIds.has(t.id));

    if (pendingTasks.length === 0) return "אין משימות פתוחות להיום מאמי! 🎉 את אלופה! 👑";

    // If just "בוצע" alone, show numbered list to pick
    const words = lower.split(/\s+/);
    const num = parseInt(words[1]);

    if (isNaN(num) || words.length < 2) {
      let msg = "איזו משימה סיימת מאמי? שלחי מספר:\n\n";
      pendingTasks.forEach((t: any, i: number) => {
        msg += `${i + 1}. ${t.description}\n`;
      });
      msg += "\nלדוגמה: בוצע 1";
      return msg;
    }

    if (num < 1 || num > pendingTasks.length) {
      return `נשמה, שלחי מספר בין 1 ל-${pendingTasks.length} 💛`;
    }

    const taskToComplete = pendingTasks[num - 1] as any;
    toggleTaskCompletion(taskToComplete.id, dateStr);
    return `כל הכבוד מאמי! 👑✅\n"${taskToComplete.description}" — בוצע!\n\n${pendingTasks.length - 1 === 0 ? "סיימת הכל להיום! 🎉🌊" : `נשארו עוד ${pendingTasks.length - 1} משימות`}`;
  }

  // "עזרה" — show available commands
  if (lower === "עזרה" || lower === "פקודות") {
    return `הייי נשמהההה! 🐬 הנה מה אני יודעת:\n\n📋 "היום" — המשימות שלך להיום\n📅 "מחר" — משימות למחר\n🗓️ "שבוע" — סקירת השבוע\n✅ "בוצע" — סמני משימה כבוצעה\n🧠 "זיכרון" — מה אני זוכרת\n\nאו פשוט תכתבי/תשלחי קולית — ואני פה! 💛`;
  }

  return null;
}
