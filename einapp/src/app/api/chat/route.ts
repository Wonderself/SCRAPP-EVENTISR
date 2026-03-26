import { NextRequest, NextResponse } from "next/server";
import { chatWithClaude } from "@/lib/ai-chat";
import { saveConversation } from "@/lib/db";
import { saveRawConversation } from "@/lib/memory";
import { toDateString } from "@/lib/hebrew";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "empty message" }, { status: 400 });
  }

  // Save user message
  saveConversation("web", "user", message);

  // Get AI response
  try {
    const reply = await chatWithClaude(message, "web");

    // Save assistant message
    saveConversation("web", "assistant", reply);

    // Save raw conversation
    const dateStr = toDateString(new Date());
    const time = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    saveRawConversation(dateStr, `[${time}] עינת: ${message}\n[${time}] Einapp: ${reply}`);

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("[Chat] Error:", error);
    return NextResponse.json({ reply: "אוי, משהו קרה 😅 תנסי שוב עוד רגע!" });
  }
}
