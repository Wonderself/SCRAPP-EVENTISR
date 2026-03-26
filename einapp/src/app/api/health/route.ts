import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    env: {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? "set (" + process.env.ANTHROPIC_API_KEY.slice(0, 8) + "...)" : "MISSING",
      CHAT_MODEL: process.env.CHAT_MODEL || "claude-sonnet-4-20250514 (default)",
      GOOGLE_CLOUD_API_KEY: process.env.GOOGLE_CLOUD_API_KEY ? "set" : "not set",
      OPENWEATHERMAP_API_KEY: process.env.OPENWEATHERMAP_API_KEY ? "set" : "not set",
      WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN ? "set" : "not set",
      APP_PASSWORD: process.env.APP_PASSWORD ? "set" : "MISSING",
    },
  });
}
