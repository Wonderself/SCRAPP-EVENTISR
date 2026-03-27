// Next.js instrumentation — runs once when the server starts
// This sets up internal cron jobs so no external cron configuration is needed

export async function register() {
  // Only run on the server, not during build
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { scheduleCronJobs } = await import("./lib/internal-cron");
    scheduleCronJobs();
  }
}
