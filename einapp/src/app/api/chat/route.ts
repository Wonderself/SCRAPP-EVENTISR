import { NextRequest, NextResponse } from "next/server";
import { chatWithClaude, extractTasks } from "@/lib/ai-chat";
import { saveConversation, createTask, getTasksForDate, getCompletionsForDate, toggleTaskCompletion } from "@/lib/db";
import { getDayKey } from "@/lib/hebrew";
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
    const rawReply = await chatWithClaude(message, "web");

    // Extract any auto-created tasks
    const { cleanReply: reply, tasks, doneTasks } = extractTasks(rawReply);
    for (const task of tasks) {
      try {
        createTask({
          description: task.description,
          type: task.type,
          priority: task.priority,
          date: task.date || undefined,
          time: task.time || undefined,
          days_of_week: task.days_of_week || undefined,
        });
        console.log(`[Chat] Auto-created ${task.type} task: "${task.description}"`);
      } catch (e) { console.error("[Chat] Failed to create task:", e); }
    }

    // Handle [DONE] tags
    for (const done of doneTasks) {
      try {
        const dateStr = toDateString(new Date());
        const dayKey = getDayKey(new Date().getDay());
        const todayTasks = getTasksForDate(dateStr, dayKey);
        const completions = getCompletionsForDate(dateStr);
        const completedIds = new Set(completions.map((c) => c.task_id));
        const hint = done.descriptionHint.toLowerCase();
        const match = todayTasks.find((t: any) =>
          !completedIds.has(t.id) && (
            t.description.toLowerCase().includes(hint) ||
            hint.includes(t.description.toLowerCase().substring(0, 10))
          )
        );
        if (match) {
          toggleTaskCompletion((match as any).id, dateStr);
          console.log(`[Chat] Marked task done: "${(match as any).description}"`);
        }
      } catch (e) { console.error("[Chat] Failed to mark done:", e); }
    }

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
    return NextResponse.json({ reply: "אוי, משהו קרה 😅 תנסי שוב עוד רגע!" }, { status: 500 });
  }
}
