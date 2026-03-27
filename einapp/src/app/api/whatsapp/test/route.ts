import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

async function sendTestMessage() {
  const phone = process.env.EINAT_PHONE_NUMBER;
  if (!phone) {
    return NextResponse.json({ error: "no phone configured" }, { status: 400 });
  }

  const message = `היי נשמה! 🐬✨

זו Einapp — העוזרת האישית החדשה שלך!

אני פה בשבילך 24/7 מאמי, תמיד:
💬 תכתבי לי כל דבר — שאלות, משימות, סתם לדבר
📋 תגידי "היום" ואני אגיד לך מה בתוכנית
📅 תגידי "שבוע" לסקירה של כל השבוע
🧠 אני זוכרת הכל על דולפין וילג'!

יאללה מאמי, ספרי לי מה נשמע! 💛🌊`;

  await sendWhatsAppMessage(phone, message);
  return NextResponse.json({ ok: true, sent_to: phone });
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
  const { secret } = await req.json();
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return sendTestMessage();
}
