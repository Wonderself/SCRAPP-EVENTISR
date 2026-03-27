import { NextResponse } from "next/server";

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY || "";
  const googleKey = process.env.GOOGLE_CLOUD_API_KEY || "";
  const activeKey = geminiKey || googleKey;

  // Test Gemini API directly
  let geminiStatus = "no key";
  if (activeKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${activeKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Say OK" }] }],
            generationConfig: { maxOutputTokens: 10 },
          }),
        }
      );
      if (res.ok) {
        geminiStatus = "working";
      } else {
        const err = await res.text();
        geminiStatus = `error ${res.status}: ${err.slice(0, 150)}`;
      }
    } catch (e: any) {
      geminiStatus = `fetch error: ${e.message}`;
    }
  }

  return NextResponse.json({
    gemini_key_source: geminiKey ? "GEMINI_API_KEY" : googleKey ? "GOOGLE_CLOUD_API_KEY" : "NONE",
    gemini_key_prefix: activeKey ? activeKey.slice(0, 8) + "..." : "not set",
    gemini_status: geminiStatus,
    tts_key: googleKey ? googleKey.slice(0, 8) + "..." : "not set (TTS disabled)",
    whatsapp_configured: !!(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN),
    einat_phone: process.env.EINAT_PHONE_NUMBER ? "set" : "not set",
    chat_model: process.env.CHAT_MODEL || "gemini-2.0-flash (default)",
    env_vars: {
      GEMINI_API_KEY: geminiKey ? "set" : "not set",
      GOOGLE_CLOUD_API_KEY: googleKey ? "set" : "not set",
      CRON_SECRET: process.env.CRON_SECRET ? "set" : "not set",
    },
  });
}
