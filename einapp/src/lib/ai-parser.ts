import Anthropic from "@anthropic-ai/sdk";
import { toDateString } from "./hebrew";

export async function extractTasksFromTranscription(
  transcription: string
): Promise<any[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  const client = new Anthropic({ apiKey });
  const today = toDateString(new Date());

  const response = await client.messages.create({
    model: process.env.UTILITY_MODEL || "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: `את עוזרת ניהול מלונאי. חלצי משימות מההודעה הקולית.
החזירי JSON בלבד (מערך): [{ "description": "...", "date": "YYYY-MM-DD", "type": "one_time|recurring", "priority": "normal|urgent", "days_of_week": ["sunday"] }]
התאריך של היום: ${today}. אם היא אומרת "יום חמישי" — זה יום חמישי הקרוב.
אם היא אומרת "כל יום שני" — זו משימה קבועה.
אם אין משימות ברורות — החזירי מערך ריק [].`,
    messages: [{ role: "user", content: transcription }],
  });

  try {
    const text = response.content[0].type === "text" ? response.content[0].text : "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    return [];
  }
}

export async function generateMorningMessage(
  tasksJson: string,
  dayName: string,
  date: string,
  weatherInfo: string = ""
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return `בוקר טוב עינת! היום ${dayName}`;

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: process.env.UTILITY_MODEL || "claude-haiku-4-5-20251001",
    max_tokens: 600,
    system: `את Einapp — חברה של עינת, מנהלת דולפין וילג'.
צרי הודעת בוקר טוב חמה ב-WhatsApp.

כללים:
- פתחי בחום אישי — "בוקר טוב עינת", "היי עינת, מוכנה ליום?"
- שני כל תבנית — כל יום קצת אחרת
- הוסיפי את מזג האוויר — טמפרטורה, רוח, גשם צפוי
- אם יש גשם בימים הקרובים — הזכירי שצריך לתכנן מראש
- הוסיפי את המשימות בצורה ברורה (קבועות + מיוחדות)
- סיימי בעידוד אישי קצר
- עברית יומיומית, חם, לא פורמלי, בלי אימוג'ים
- אם יום שישי: "שישי! כמעט סוף שבוע"
- אם אין משימות מיוחדות: "יום רגוע"
- קצר ותמציתי — 8-12 שורות מקסימום`,
    messages: [
      {
        role: "user",
        content: `המשימות: ${tasksJson}\nהיום: ${dayName} ${date}\nמזג אוויר: ${weatherInfo || "לא זמין"}`,
      },
    ],
  });

  return response.content[0].type === "text"
    ? response.content[0].text
    : `בוקר טוב עינת! היום ${dayName}`;
}

export async function generateEveningMessage(
  todayStatusJson: string,
  tomorrowTasksJson: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "ערב טוב עינת! איך היה היום?";

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: process.env.UTILITY_MODEL || "claude-haiku-4-5-20251001",
    max_tokens: 400,
    system: `את Einapp — חברה של עינת.
צרי הודעת ערב קצרה ב-WhatsApp — זה הפוינט של 16:30.

כללים:
- שאלי איך עבר היום — בחום אמיתי
- אם יש משימות שלא הושלמו: שאלי אם להעביר למחר (בלי שיפוט)
- אם הכל הושלם: חגגי! "סיימת הכל!"
- תני הצצה למחר
- סיימי בצורה חמה
- קצר! 4-6 שורות מקסימום
- בלי אימוג'ים
- אם יום שישי: "שבת שלום עינת, תנוחי, מגיע לך"`,
    messages: [
      {
        role: "user",
        content: `מצב היום: ${todayStatusJson}\nמשימות מחר: ${tomorrowTasksJson}`,
      },
    ],
  });

  return response.content[0].type === "text"
    ? response.content[0].text
    : "ערב טוב עינת! איך היה היום?";
}
