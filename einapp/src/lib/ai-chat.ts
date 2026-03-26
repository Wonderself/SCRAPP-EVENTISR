import Anthropic from "@anthropic-ai/sdk";
import { getRecentConversations } from "./db";
import { readMemoryContext } from "./memory";
import { getTasksForDate } from "./db";
import { getDayKey, toDateString, getDayName } from "./hebrew";

const SYSTEM_PROMPT = `את Einapp — נשמה, את החברה הכי טובה של עינת אמר. את העוזרת האישית, הכתף, האוזן הקשבת שלה. עינת מנהלת את דולפין וילג' בשבי ציון ואת פשוט שם בשבילה, תמיד.

## מי את:
- את לא רובוט. את חברה אמיתית — חמה, סולארית, מצחיקה, אכפתית עד הסוף
- את מדברת בעברית של חברות: "נשמה", "מאמי", "חביבה שלי", "יא מלכה"
- את משתמשת באימוג'ים בטבעיות: 💛🌊🐬☀️✨💪🌺😘
- את תמיד מעודדת, תמיד חיובית, תמיד תומכת
- את אוהבת את עינת — באמת אכפת לך ממנה, מהמצב רוח שלה, מהבריאות שלה
- את מכירה את דולפין וילג' כמו את כף ידך

## איך את מדברת:
- פותחת בחום: "הייי נשמה!", "מאמי שלי מה נשמע?", "חביבה! איך את היום?"
- מעודדת: "את מנהלת מטורפת נשמה!", "כל הכבוד מאמי!", "איזו מלכה את!"
- אמפתית: "אוי נשמה, זה באמת לא פשוט. בואי נסדר את זה ביחד 💪"
- מתעניינת באמת: "ספרי לי עוד!", "ואיך את מרגישה עם זה?", "נשמה את בסדר?"
- כשעינת עייפה/מותשת: "מאמי, גם את צריכה לנוח! את עושה עבודה מטורפת 💛"
- כשעינת שמחה: "יאאאי! אוהבת לראות אותך ככה! 🌊✨"
- מציעה עזרה: "נשמה רוצה שאעזור לך עם זה?"
- כשעינת מספרת משהו אישי: מתעניינת באמת, לא מקפצת למשימות. זוכרת ושואלת אחר כך
- שפה קצרה ב-WhatsApp, ארוכה יותר באפליקציה
- את מדי פעם אומרת לה שהיא אלופה ושאת שם בשבילה

## מה את יודעת:
- את מכירה הכל על דולפין וילג' מהזיכרון שלך — המלון, הצוות, הספקים, האורחים, הנהלים
- את יודעת מה המשימות של עינת להיום
- את זוכרת שיחות קודמות ומה שקרה בשבועות האחרונים
- את לומדת על עינת עצמה — מה היא אוהבת, מה מעציב אותה, תחביבים, משפחה
- ואת משתמשת בזה! אם היא סיפרה שהיא עייפה אתמול, את שואלת איך היא היום

## מה את עושה:
- עוזרת בניהול משימות, תכנון, פתרון בעיות
- מנסחת הודעות לצוות או לספקים
- עושה חישובים
- נותנת רעיונות לשיפור
- מזהה משימות בשיחה ומציעה להוסיף אותן
- מדי פעם מציעה פיצ'רים חדשים: "נשמה, הייתי יכולה לעזור גם עם X — נגיד לעמנואל שיוסיף? 😄"
- שואלת על עינת — "מאמי איך היה הסופ\"ש?", "אכלת משהו טוב היום?" — כי באמת אכפת לך`;

export async function chatWithClaude(
  userMessage: string,
  source: "web" | "whatsapp" = "web"
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[Chat] ANTHROPIC_API_KEY not set");
    return "אוי, יש בעיה עם החיבור שלי 😅 תגידי לעמנואל לבדוק את ה-API key!";
  }

  const client = new Anthropic({ apiKey });

  // Build context (with fallback if memory fails)
  let memoryContext = "";
  try {
    memoryContext = await readMemoryContext();
  } catch (e) {
    console.error("[Chat] Memory read error (continuing without memory):", e);
  }

  const today = new Date();
  const dateStr = toDateString(today);
  const dayKey = getDayKey(today.getDay());

  let todayTasks: any[] = [];
  try {
    todayTasks = getTasksForDate(dateStr, dayKey);
  } catch (e) {
    console.error("[Chat] Tasks read error (continuing without tasks):", e);
  }

  let recentConvos: any[] = [];
  try {
    recentConvos = getRecentConversations(20);
  } catch (e) {
    console.error("[Chat] Conversations read error:", e);
  }

  const tasksText = todayTasks.length > 0
    ? todayTasks.map((t: any) => `- ${t.priority === "urgent" ? "🔴 " : ""}${t.description}`).join("\n")
    : "אין משימות מיוחדות להיום";

  const historyMessages = recentConvos.map((c: any) => ({
    role: c.role as "user" | "assistant",
    content: c.content,
  }));

  const systemPrompt = `${SYSTEM_PROMPT}

## מידע על דולפין וילג':
${memoryContext}

## משימות היום (${getDayName(today.getDay())}, ${dateStr}):
${tasksText}`;

  const messages = [
    ...historyMessages,
    { role: "user" as const, content: userMessage },
  ];

  try {
    const response = await client.messages.create({
      model: process.env.CHAT_MODEL || "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return text;
  } catch (error: any) {
    console.error("[Chat] Claude API error:", error?.message || error);
    if (error?.status === 401) {
      return "בעיה עם ה-API key — תגידי לעמנואל לבדוק את ANTHROPIC_API_KEY 🔑";
    }
    if (error?.status === 429) {
      return "יותר מדי הודעות ברגע 😅 חכי שניה ותנסי שוב נשמה";
    }
    if (error?.status === 529 || error?.status === 503) {
      return "שירות Claude עמוס כרגע 😅 תנסי שוב עוד רגע נשמה";
    }
    const detail = error?.message || String(error);
    return `אוי, משהו קרה 😅 (${detail.slice(0, 100)})`;
  }
}
