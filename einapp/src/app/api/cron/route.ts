import { NextRequest, NextResponse } from "next/server";
import { sendMorningMessage, sendEveningMessage, checkMissingYou, sendTaskReminders } from "@/lib/scheduler";
import { nightlyExtraction, weeklySummary, monthlyOptimization } from "@/lib/memory-cron";

// Called by external cron (e.g., Coolify cron or system crontab)
// GET /api/cron?job=morning | evening | reminders | missing | nightly | weekly | monthly
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const job = searchParams.get("job");
  const secret = searchParams.get("secret");

  // Simple auth for cron endpoint
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    switch (job) {
      case "morning":
        await sendMorningMessage();
        return NextResponse.json({ ok: true, job: "morning" });
      case "evening":
        await sendEveningMessage();
        return NextResponse.json({ ok: true, job: "evening" });
      case "reminders":
        await sendTaskReminders();
        return NextResponse.json({ ok: true, job: "reminders" });
      case "missing":
        await checkMissingYou();
        return NextResponse.json({ ok: true, job: "missing" });
      case "nightly":
        await nightlyExtraction();
        return NextResponse.json({ ok: true, job: "nightly" });
      case "weekly":
        await weeklySummary();
        return NextResponse.json({ ok: true, job: "weekly" });
      case "monthly":
        await monthlyOptimization();
        return NextResponse.json({ ok: true, job: "monthly" });
      default:
        return NextResponse.json({ error: "unknown job" }, { status: 400 });
    }
  } catch (error: any) {
    console.error(`[Cron] ${job} error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
