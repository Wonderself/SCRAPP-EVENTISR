// Internal cron scheduler — runs inside the Next.js server process
// No external cron configuration needed

import cron from "node-cron";
import path from "path";
import fs from "fs";

let started = false;

function dailyBackup() {
  try {
    const DATA_DIR = path.join(process.cwd(), "data");
    const DB_PATH = path.join(DATA_DIR, "einapp.db");
    if (!fs.existsSync(DB_PATH)) return;

    const backupDir = path.join(DATA_DIR, "backups");
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const date = new Date().toISOString().split("T")[0];
    const backupPath = path.join(backupDir, `einapp-${date}.db`);

    // Only backup once per day
    if (fs.existsSync(backupPath)) return;

    fs.copyFileSync(DB_PATH, backupPath);
    console.log(`[Backup] Daily backup: ${backupPath}`);

    // Keep only last 7 days
    const old = fs.readdirSync(backupDir).filter(f => f.endsWith(".db")).sort().reverse();
    for (const f of old.slice(7)) {
      fs.unlinkSync(path.join(backupDir, f));
    }
  } catch (e: any) {
    console.error("[Backup] Failed:", e.message);
  }
}

export function scheduleCronJobs() {
  if (started) return;
  started = true;

  const BASE_URL = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
  const SECRET = process.env.CRON_SECRET || "";

  if (!SECRET) {
    console.warn("[Cron] CRON_SECRET not set — skipping cron setup");
    return;
  }

  // Run a daily backup immediately on startup
  dailyBackup();

  async function runJob(job: string) {
    try {
      const url = `${BASE_URL}/api/cron?job=${job}&secret=${SECRET}`;
      const res = await fetch(url);
      const data = await res.json();
      console.log(`[Cron] ${job}:`, res.ok ? "OK" : data);
    } catch (e: any) {
      console.error(`[Cron] ${job} failed:`, e.message);
    }
  }

  // All times in Israel time (Asia/Jerusalem)
  const TZ = "Asia/Jerusalem";

  // 🌅 Morning message — every day at 7:00 AM
  cron.schedule("0 7 * * *", () => runJob("morning"), { timezone: TZ });

  // 🔔 Task reminders — every 15 minutes (7 AM to 10 PM)
  cron.schedule("*/15 7-22 * * *", () => runJob("reminders"), { timezone: TZ });

  // 🌆 Evening message — every day at 4:30 PM
  cron.schedule("30 16 * * *", () => runJob("evening"), { timezone: TZ });

  // 💛 Missing you check — every day at noon
  cron.schedule("0 12 * * *", () => runJob("missing"), { timezone: TZ });

  // 🧠 Nightly memory extraction — every day at 2:00 AM
  cron.schedule("0 2 * * *", () => runJob("nightly"), { timezone: TZ });

  // 📊 Weekly summary — every Sunday at 10:00 PM
  cron.schedule("0 22 * * 0", () => runJob("weekly"), { timezone: TZ });

  // 🗄️ Monthly optimization — 1st of each month at 3:00 AM
  cron.schedule("0 3 1 * *", () => runJob("monthly"), { timezone: TZ });

  // 💾 Daily backup — every day at 1:00 AM
  cron.schedule("0 1 * * *", () => dailyBackup(), { timezone: TZ });

  console.log("[Cron] All 8 jobs scheduled (timezone: Asia/Jerusalem):");
  console.log("  🌅 morning    — 07:00 daily");
  console.log("  🔔 reminders  — every 15 min (7-22h)");
  console.log("  🌆 evening    — 16:30 daily");
  console.log("  💛 missing    — 12:00 daily");
  console.log("  🧠 nightly    — 02:00 daily");
  console.log("  📊 weekly     — Sunday 22:00");
  console.log("  🗄️  monthly   — 1st of month 03:00");
  console.log("  💾 backup     — 01:00 daily");
}
