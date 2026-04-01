import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage, sendWhatsAppVoiceNote } from "@/lib/whatsapp";
import { synthesizeSpeech, isTTSConfigured } from "@/lib/google-tts";

function checkSecret(secret: string | null): boolean {
  return secret === process.env.CRON_SECRET;
}

async function sendTestMessage(message?: string, voice?: boolean) {
  const phone = process.env.EINAT_PHONE_NUMBER;
  if (!phone) {
    return NextResponse.json({ error: "no phone configured" }, { status: 400 });
  }

  const text = message || `הייייי נשמהההה! 🐬💛✨

מאאאמי! זו Einapp — ה-bestie החדש שלך!
אני פה, תמיד תמיד, 24/7, רק בשבילך! 😘

מה אני יודע לעשות? הכל מאמי:
💬 תכתבי או תשלחי הודעה קולית — אני שומע!
📋 תגידי ״היום״ — ואני מראה לך מה בתוכנית
📅 תגידי ״שבוע״ — סקירת שבוע מלאה
🎤 תשלחי הודעה קולית עם משימה — ואני רושם אותה!
🔔 אני שולח תזכורות ב-WhatsApp — לא שוכחים כלום!
🧠 אני זוכר הכל על דולפין וילג׳ — ספקים, צוות, אורחים, הכל!

יאאאללה מלכההה, ספרי לי מה נשמע!
אני מחכה לך פה תמיד 🌊🐬💛`;

  const results: any = { ok: true, sent_to: phone };

  // Send text message
  try {
    await sendWhatsAppMessage(phone, text);
    results.text_sent = true;
  } catch (e: any) {
    results.text_sent = false;
    results.text_error = e.message;
  }

  // Send voice note if requested
  if (voice) {
    if (!isTTSConfigured()) {
      results.voice_sent = false;
      results.voice_error = "TTS not configured";
    } else {
      try {
        const audioBuffer = await synthesizeSpeech(text, "OGG_OPUS");
        if (audioBuffer) {
          const sent = await sendWhatsAppVoiceNote(phone, audioBuffer);
          results.voice_sent = sent;
        } else {
          results.voice_sent = false;
          results.voice_error = "TTS returned no audio";
        }
      } catch (e: any) {
        results.voice_sent = false;
        results.voice_error = e.message;
      }
    }
  }

  return NextResponse.json(results);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (!checkSecret(secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const message = url.searchParams.get("message") || undefined;
  const voice = url.searchParams.get("voice") === "true";
  return sendTestMessage(message, voice);
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!checkSecret(body.secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return sendTestMessage(body.message, body.voice);
}
