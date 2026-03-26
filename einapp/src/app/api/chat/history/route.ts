import { NextResponse } from "next/server";
import { getRecentConversations } from "@/lib/db";

export async function GET() {
  try {
    const convos = getRecentConversations(30);
    const messages = convos.map((c: any) => ({
      role: c.role,
      content: c.content,
      time: new Date(c.created_at).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
