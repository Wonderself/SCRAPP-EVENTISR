import { NextRequest, NextResponse } from "next/server";
import {
  getTasksForDate,
  getCompletionsForDate,
  createTask,
  toggleTaskCompletion,
  getAllRecurringTasks,
  updateTask,
  deleteTask,
} from "@/lib/db";
import { getDayKey, getWeekDates, toDateString } from "@/lib/hebrew";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "week") {
    const dateParam = searchParams.get("date");
    const refDate = dateParam ? new Date(dateParam) : new Date();
    const weekDates = getWeekDates(refDate);

    const week = weekDates.map((d) => {
      const dateStr = toDateString(d);
      const dayKey = getDayKey(d.getDay());
      const tasks = getTasksForDate(dateStr, dayKey);
      const completions = getCompletionsForDate(dateStr);
      const completedIds = new Set(completions.map((c) => c.task_id));

      return {
        date: dateStr,
        dayIndex: d.getDay(),
        tasks: tasks.map((t: any) => ({
          ...t,
          completed: completedIds.has(t.id),
        })),
      };
    });

    return NextResponse.json(week);
  }

  if (action === "recurring") {
    return NextResponse.json(getAllRecurringTasks());
  }

  if (action === "today") {
    const today = new Date();
    const dateStr = toDateString(today);
    const dayKey = getDayKey(today.getDay());
    const tasks = getTasksForDate(dateStr, dayKey);
    const completions = getCompletionsForDate(dateStr);
    const completedIds = new Set(completions.map((c) => c.task_id));
    return NextResponse.json(
      tasks.map((t: any) => ({ ...t, completed: completedIds.has(t.id) }))
    );
  }

  return NextResponse.json({ error: "missing action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === "create") {
    if (!body.description?.trim()) {
      return NextResponse.json({ error: "description required" }, { status: 400 });
    }
    const validTypes = ["one-time", "one_time", "recurring"];
    const validPriorities = ["normal", "urgent"];
    const id = createTask({
      description: body.description.trim(),
      type: validTypes.includes(body.type) ? body.type : "one_time",
      priority: validPriorities.includes(body.priority) ? body.priority : "normal",
      date: body.date,
      time: body.time,
      days_of_week: body.days_of_week,
      start_date: body.start_date,
      end_date: body.end_date,
    });
    return NextResponse.json({ id });
  }

  if (action === "toggle") {
    const completed = toggleTaskCompletion(body.task_id, body.date);
    return NextResponse.json({ completed });
  }

  if (action === "update") {
    updateTask(body.id, body.updates);
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    deleteTask(body.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
