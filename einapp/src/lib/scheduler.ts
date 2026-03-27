import { sendWhatsAppMessage } from "./whatsapp";
import { generateMorningMessage, generateEveningMessage, generateTaskReminder } from "./ai-parser";
import { getTasksForDate, getCompletionsForDate, getAppState, setAppState } from "./db";
import { toDateString, getDayKey, getDayName } from "./hebrew";
import { getWeather, formatWeatherForMessage } from "./weather";

const EINAT_PHONE = process.env.EINAT_PHONE_NUMBER || "";

function isWhatsAppConfigured(): boolean {
  return !!(EINAT_PHONE && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);
}

export async function sendMorningMessage() {
  const today = new Date();
  const dateStr = toDateString(today);

  const lastDate = getAppState("last_morning_message_date");
  if (lastDate === dateStr) return;

  const dayKey = getDayKey(today.getDay());
  const dayName = getDayName(today.getDay());
  const tasks = getTasksForDate(dateStr, dayKey);

  const weather = await getWeather();
  const weatherText = weather ? formatWeatherForMessage(weather) : "";

  const tasksJson = JSON.stringify(
    tasks.map((t: any) => ({
      description: t.description,
      type: t.type,
      priority: t.priority,
      time: t.time,
    }))
  );

  const message = await generateMorningMessage(tasksJson, dayName, dateStr, weatherText);
  if (!isWhatsAppConfigured()) {
    console.log("[Scheduler] WhatsApp not configured, skipping morning message");
    return;
  }
  await sendWhatsAppMessage(EINAT_PHONE, message);
  setAppState("last_morning_message_date", dateStr);
}

export async function sendEveningMessage() {
  const today = new Date();
  const dateStr = toDateString(today);

  const lastDate = getAppState("last_evening_message_date");
  if (lastDate === dateStr) return;

  const dayKey = getDayKey(today.getDay());
  const tasks = getTasksForDate(dateStr, dayKey);
  const completions = getCompletionsForDate(dateStr);
  const completedIds = new Set(completions.map((c) => c.task_id));

  const todayStatus = {
    total: tasks.length,
    completed: tasks.filter((t: any) => completedIds.has(t.id)).length,
    pending: tasks
      .filter((t: any) => !completedIds.has(t.id))
      .map((t: any) => t.description),
    isFriday: today.getDay() === 5,
  };

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowDateStr = toDateString(tomorrow);
  const tomorrowDayKey = getDayKey(tomorrow.getDay());
  const tomorrowTasks = getTasksForDate(tomorrowDateStr, tomorrowDayKey);

  const message = await generateEveningMessage(
    JSON.stringify(todayStatus),
    JSON.stringify(tomorrowTasks.map((t: any) => t.description))
  );

  if (!isWhatsAppConfigured()) {
    console.log("[Scheduler] WhatsApp not configured, skipping evening message");
    return;
  }
  await sendWhatsAppMessage(EINAT_PHONE, message);
  setAppState("last_evening_message_date", dateStr);
}

/**
 * Check tasks with specific times and send WhatsApp reminders.
 * Call every 15 minutes via cron. Sends reminder if task time is within 0-15 min.
 */
export async function sendTaskReminders() {
  if (!isWhatsAppConfigured()) return;

  const now = new Date();
  const dateStr = toDateString(now);
  const dayKey = getDayKey(now.getDay());
  const tasks = getTasksForDate(dateStr, dayKey);
  const completions = getCompletionsForDate(dateStr);
  const completedIds = new Set(completions.map((c) => c.task_id));

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const task of tasks) {
    if (completedIds.has((task as any).id)) continue;
    if (!(task as any).time) continue;

    const [h, m] = (task as any).time.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) continue;

    const taskMinutes = h * 60 + m;
    const diff = taskMinutes - currentMinutes;

    // Send reminder if task is within next 15 minutes
    if (diff < 0 || diff > 15) continue;

    // Don't send same reminder twice
    const reminderKey = `reminder_${(task as any).id}_${dateStr}`;
    if (getAppState(reminderKey)) continue;

    const isUrgent = (task as any).priority === "urgent";
    const message = await generateTaskReminder(
      (task as any).description,
      (task as any).time,
      isUrgent
    );

    await sendWhatsAppMessage(EINAT_PHONE, message);
    setAppState(reminderKey, new Date().toISOString());
    console.log(`[Scheduler] Sent reminder for: ${(task as any).description}`);
  }
}

/**
 * Send immediate WhatsApp alert for urgent tasks.
 */
export async function sendUrgentAlert(description: string, date: string) {
  if (!isWhatsAppConfigured()) return;

  const message = `🔴🔴 נשמהההה! משימה דחופה!\n\n${description}\n📅 ${date}\n\nאת שומעת מאמי? זה חשוב! 💪`;
  await sendWhatsAppMessage(EINAT_PHONE, message);
  console.log(`[Scheduler] Sent urgent alert: ${description}`);
}

export async function checkMissingYou() {
  const lastMsg = getAppState("last_user_message_at");
  if (!lastMsg) return;

  const hours = (Date.now() - new Date(lastMsg).getTime()) / (1000 * 60 * 60);
  const threshold = parseInt(process.env.MISSING_YOU_HOURS || "48");

  if (hours >= threshold) {
    const lastMissing = getAppState("last_missing_you_at");
    if (lastMissing) {
      const sinceMissing = (Date.now() - new Date(lastMissing).getTime()) / (1000 * 60 * 60);
      if (sinceMissing < threshold) return;
    }

    if (!isWhatsAppConfigured()) return;

    await sendWhatsAppMessage(
      EINAT_PHONE,
      "נשמהההה! 🐬💛 נעלמת לי! הכל בסדר מאמי?\nאני פה אם צריך משהו, תמיד תמיד! 😘"
    );
    setAppState("last_missing_you_at", new Date().toISOString());
  }
}
