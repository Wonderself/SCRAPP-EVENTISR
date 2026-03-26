import { NextRequest, NextResponse } from "next/server";
import { chatWithClaude } from "@/lib/ai-chat";
import { saveConversation } from "@/lib/db";
import { saveRawConversation } from "@/lib/memory";
import { toDateString } from "@/lib/hebrew";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const message = body?.message;
  if (!message?.trim()) {
    return NextResponse.json({ error: "empty message" }, { status: 400 });
  }

  // Save user message (don't crash if DB fails)
  try {
    saveConversation("web", "user", message);
  } catch (e) {
    console.error("[Chat] Failed to save user message:", e);
  }

  // Get AI response
  try {
    const reply = await chatWithClaude(message, "web");

    // Save assistant message (don't crash if DB fails)
    try {
      saveConversation("web", "assistant", reply);
      const dateStr = toDateString(new Date());
      const time = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
      saveRawConversation(dateStr, `[${time}] עינת: ${message}\n[${time}] Einapp: ${reply}`);
    } catch (e) {
      console.error("[Chat] Failed to save conversation:", e);
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("[Chat] Error:", error?.message || error);
    return NextResponse.json({ reply: "אוי, משהו קרה 😅 תנסי שוב עוד רגע!" });
  }
}
