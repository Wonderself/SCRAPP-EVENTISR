import { sendWhatsAppMessage } from "./whatsapp";
import { generateMorningMessage, generateEveningMessage } from "./ai-parser";
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

  // Avoid duplicate
  const lastDate = getAppState("last_morning_message_date");
  if (lastDate === dateStr) return;

  const dayKey = getDayKey(today.getDay());
  const dayName = getDayName(today.getDay());
  const tasks = getTasksForDate(dateStr, dayKey);

  // Get weather
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

  // Avoid duplicate
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

  // Tomorrow's tasks
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

    if (!isWhatsAppConfigured()) {
      console.log("[Scheduler] WhatsApp not configured, skipping missing-you message");
      return;
    }
    await sendWhatsAppMessage(
      EINAT_PHONE,
      "היי עינת, נעלמת לי! הכל בסדר?\nאני פה אם צריך משהו"
    );
    setAppState("last_missing_you_at", new Date().toISOString());
  }
}
