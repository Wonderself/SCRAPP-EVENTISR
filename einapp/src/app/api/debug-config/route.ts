import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const doTest = url.searchParams.get("test") === "1";

  const geminiKey = process.env.GEMINI_API_KEY || "";
  const googleKey = process.env.GOOGLE_CLOUD_API_KEY || "";
  const activeKey = geminiKey || googleKey;

  const sameKey = geminiKey && googleKey && geminiKey === googleKey;

  let geminiStatus = "skipped (add ?test=1 to test)";

  if (doTest && activeKey) {
    // Try both models
    for (const model of ["gemini-2.0-flash", "gemini-2.0-flash-lite"]) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`,
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
          geminiStatus = `WORKING with ${model}`;
          break;
        } else {
          const err = await res.text();
          geminiStatus = `${model}: error ${res.status} — ${err.slice(0, 200)}`;
          // If 429, try next model
          if (res.status === 429) continue;
          break;
        }
      } catch (e: any) {
        geminiStatus = `${model}: fetch error: ${e.message}`;
      }
    }
  } else if (!activeKey) {
    geminiStatus = "NO KEY CONFIGURED";
  }

  return NextResponse.json({
    gemini_key_source: geminiKey ? "GEMINI_API_KEY" : googleKey ? "GOOGLE_CLOUD_API_KEY" : "NONE",
    gemini_key_prefix: activeKey ? activeKey.slice(0, 10) + "..." + activeKey.slice(-4) : "not set",
    google_cloud_key_prefix: googleKey ? googleKey.slice(0, 10) + "..." + googleKey.slice(-4) : "not set",
    keys_are_same: sameKey ? "YES — THIS IS A PROBLEM! Use different keys" : "OK (different keys)",
    gemini_status: geminiStatus,
    tts_configured: !!googleKey,
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
