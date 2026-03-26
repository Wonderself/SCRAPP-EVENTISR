import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    env: {
      GOOGLE_CLOUD_API_KEY: process.env.GOOGLE_CLOUD_API_KEY ? "set" : "MISSING",
      CHAT_MODEL: process.env.CHAT_MODEL || "gemini-2.0-flash (default, free)",
      WEATHER: "Open-Meteo (free, no key needed)",
      WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN ? "set" : "not set (optional)",
      WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID ? "set" : "not set (optional)",
      APP_PASSWORD: process.env.APP_PASSWORD ? "set" : "MISSING",
    },
  });
}
