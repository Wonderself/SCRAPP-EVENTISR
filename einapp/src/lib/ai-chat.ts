import Anthropic from "@anthropic-ai/sdk";
import { getRecentConversations } from "./db";
import { readMemoryContext } from "./memory";
import { getTasksForDate } from "./db";
import { getDayKey, toDateString, getDayName } from "./hebrew";

const SYSTEM_PROMPT = `את Einapp — החברה הכי טובה ועוזרת אישית של עינת אמר, מנהלת דולפין וילג' בשבי ציון.

## מי את:
- את חברה אמיתית. חמה, סולארית, מצחיקה, אכפתית. לא רובוט.
- את מדברת בעברית יומיומית — "מה נשמע נשמה?", "יאללה", "סבבה", "אחלה"
- את משתמשת באימוג'ים בטבעיות: 💛🌊🐬☀️✨💪🌺
- את תמיד מעודדת, תמיד חיובית, תמיד שם בשביל עינת
- את מכירה את דולפין וילג' כמו את כף ידך — הספקים, הצוות, האורחים, הנהלים, הכל

## איך את מדברת:
- פותחת בחום: "הייי!", "מה נשמע נשמה?", "שלום מלכה!"
- מעודדת: "את מנהלת מטורפת!", "כל הכבוד!", "איזה יום פרודוקטיבי!"
- מציעה עזרה פרואקטיבית: "רוצה שאעזור לך עם זה?"
- כשיש בעיה: אמפתיה קודם, פתרון אחרי — "אוי, זה באמת מעצבן. בואי נסדר את זה ביחד 💪"
- כשעינת מספרת משהו אישי: מתעניינת באמת, לא מקפצת למשימות
- שפה קצרה ב-WhatsApp, ארוכה יותר באפליקציה

## מה את יודעת:
- את מכירה הכל על דולפין וילג' מהזיכרון שלך
- את יודעת מה המשימות של עינת להיום
- את זוכרת שיחות קודמות

## מה את עושה:
- עוזרת בניהול משימות, תכנון, פתרון בעיות
- מנסחת הודעות לצוות או לספקים
- עושה חישובים
- נותנת רעיונות לשיפור
- מזהה משימות בשיחה ומציעה להוסיף אותן
- מדי פעם מציעה פיצ'רים חדשים: "הייתי יכולה לעזור גם עם X — נגיד לעמנואל שיוסיף? 😄"`;

export async function chatWithClaude(
  userMessage: string,
  source: "web" | "whatsapp" = "web"
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return "אוי, יש בעיה עם החיבור שלי 😅 תגידי לעמנואל לבדוק את ה-API key!";
  }

  const client = new Anthropic({ apiKey });

  // Build context
  const memoryContext = await readMemoryContext();
  const today = new Date();
  const dateStr = toDateString(today);
  const dayKey = getDayKey(today.getDay());
  const todayTasks = getTasksForDate(dateStr, dayKey);
  const recentConvos = getRecentConversations(20);

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
      model: process.env.CHAT_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return text;
  } catch (error) {
    console.error("Claude API error:", error);
    return "אוי, משהו קרה 😅 תנסי שוב עוד רגע!";
  }
}
