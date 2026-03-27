import { NextResponse } from "next/server";
import { isTTSConfigured } from "@/lib/google-tts";

export async function GET() {
  if (isTTSConfigured()) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 503 });
}
