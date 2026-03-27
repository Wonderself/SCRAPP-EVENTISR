import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

async function sendTestMessage() {
  const phone = process.env.EINAT_PHONE_NUMBER;
  if (!phone) {
    return NextResponse.json({ error: "no phone configured" }, { status: 400 });
  }

  const message = `הייייי נשמהההה! 🐬💛✨

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

  try {
    await sendWhatsAppMessage(phone, message);
  } catch (e: any) {
    return NextResponse.json({ error: "send failed", details: e.message }, { status: 500 });
  }

  // Also send directly to dev phone if configured
  const devPhone = process.env.DEV_PHONE_NUMBER;
  const results: any = { ok: true, sent_to: phone, dev_phone: devPhone || "not configured" };

  if (devPhone && devPhone !== phone) {
    try {
      await sendWhatsAppMessage(devPhone, `[TEST] Message envoyé à ${phone}:\n\n${message}`);
      results.dev_sent = true;
    } catch (e: any) {
      results.dev_sent = false;
      results.dev_error = e.message;
    }
  }

  return NextResponse.json(results);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized — add ?secret=einapp2026" }, { status: 401 });
  }
  return sendTestMessage();
}

export async function POST(req: NextRequest) {
  let secret: string;
  try {
    const body = await req.json();
    secret = body.secret;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return sendTestMessage();
}
