import { NextRequest, NextResponse } from "next/server";
import { sendMorningMessage, sendEveningMessage, checkMissingYou } from "@/lib/scheduler";

// Called by external cron (e.g., Coolify cron or system crontab)
// GET /api/cron?job=morning | evening | missing
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const job = searchParams.get("job");
  const secret = searchParams.get("secret");

  // Simple auth for cron endpoint
  if (secret !== (process.env.CRON_SECRET || "einapp_cron")) {
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
      case "missing":
        await checkMissingYou();
        return NextResponse.json({ ok: true, job: "missing" });
      default:
        return NextResponse.json({ error: "unknown job" }, { status: 400 });
    }
  } catch (error: any) {
    console.error(`[Cron] ${job} error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
