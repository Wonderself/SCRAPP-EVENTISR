import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech, isTTSConfigured } from "@/lib/google-tts";

export async function POST(req: NextRequest) {
  if (!isTTSConfigured()) {
    return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
  }

  let text: string;
  try {
    const body = await req.json();
    text = body.text;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!text?.trim()) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  // Limit text length
  if (text.length > 5000) {
    return NextResponse.json({ error: "text too long" }, { status: 400 });
  }

  const audio = await synthesizeSpeech(text, "MP3");
  if (!audio) {
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }

  return new NextResponse(new Uint8Array(audio), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": audio.length.toString(),
      "Cache-Control": "public, max-age=86400", // Cache 24h
    },
  });
}
