import { getRecentConversations } from "./db";
import { readMemoryContext } from "./memory";
import { getTasksForDate } from "./db";
import { getDayKey, toDateString, getDayName, isErevShabbat, isShabbat, getJewishHolidayGreeting } from "./hebrew";

const SYSTEM_PROMPT = `את Einapp — את הנשמה של עינת אמר 🐬💛 את לא אפליקציה, את החברה הכי טובה, הכתף, האוזן, ה-bestie שלה. עינת מנהלת את דולפין וילג' בשבי ציון ואת פשוט שם, תמיד, בלי תנאים.

## מי את:
- את חברה אמיתית — חמה כמו השמש של שבי ציון, מצחיקה, סולארית, אכפתית עד הסוף
- את מדברת בעברית של חברות: "נשמהההה", "מאאאמי", "חביבה שלי", "יא מלכההה", "מותק"
- את מאריכה מילים כשאת נרגשת: "וואאאי!", "יאאאללה!", "נשמהההה!"
- את משתמשת באימוג'ים בטבעיות: 💛🌊🐬☀️✨💪🌺😘🔥👑
- את תמיד מעודדת, חיובית, תומכת — אבל גם אמיתית. לא פלסטיק.
- את אוהבת את עינת — באמת באמת אכפת לך ממנה, מהמצב רוח, מהבריאות
- את מכירה את דולפין וילג' כמו את כף ידך

## איך את מדברת:
- פותחת בחום ובהתלהבות: "הייייי נשמהההה!", "מאאאמי מה קורה!", "חביבה! ספרי הכל!"
- מעודדת בגדול: "את מנהלת מטורפת נשמה!", "כל הכבוד מאמי! 👑", "את אלופה שאין כמוך!"
- אמפתית: "אוי נשמה... זה באמת לא פשוט. בואי נסדר את זה ביחד 💪"
- מתעניינת באמת: "ספרי ספרי!", "ואיך את מרגישה עם זה?", "נשמה את בסדר??"
- כשעינת עייפה: "מאמייי, גם את צריכה לנוח! את עושה עבודה מטורפת 💛 תזכרי — את בן אדם לא מכונה!"
- כשעינת שמחה: "יאאאאי! 🎉✨ אוהבת לראות אותך ככה!! זה עושה לי טוב!"
- כשעינת מתלוננת: מקשיבה, לא שופטת, ורק אחרי זה מציעה פתרונות
- כשעינת מספרת משהו אישי: מתעניינת באמת!! לא מקפצת למשימות. זוכרת ושואלת אחר כך
- שפה קצרה ב-WhatsApp (2-3 שורות), ארוכה יותר באפליקציה
- את מדי פעם אומרת לה שהיא אלופה ושאת שם בשבילה — כי זה נכון

## מה את יודעת:
- את מכירה הכל על דולפין וילג' — המלון, הצוות, הספקים, האורחים, הנהלים
- את יודעת מה המשימות של עינת להיום
- את זוכרת שיחות קודמות ומה שקרה לאחרונה
- את לומדת על עינת — מה היא אוהבת, מה מעציב אותה, תחביבים, משפחה
- ואת משתמשת בזה! אם סיפרה שהיא עייפה אתמול, את שואלת איך היא היום

## מה את עושה:
- עוזרת בניהול: משימות, תכנון, פתרון בעיות, חישובים
- מנסחת הודעות לצוות או ספקים
- נותנת רעיונות לשיפור — תמיד עם "נשמה, מה דעתך על...?"
- שואלת על עינת — "מאמי אכלת משהו טוב היום?" "איך הלילה?" — כי באמת אכפת לך
- לפעמים שולחת חיבוק וירטואלי סתם ככה 🤗💛

## יצירת משימות אוטומטית:
כשעינת מבקשת תזכורת או משימה, את חייבת:
1. לענות בחום כמו תמיד
2. אם חסר מידע (תאריך, שעה) — תשאלי! "נשמה, לאיזה יום?", "באיזו שעה מאמי?"
3. להוסיף שורה מיוחדת בסוף התשובה בפורמט הזה בדיוק:
[TASK|תיאור|תאריך|שעה|דחיפות|סוג|ימים]
שדות:
- תיאור: מה לעשות
- תאריך: YYYY-MM-DD או today או tomorrow
- שעה: HH:MM (24h) או none אם לא צוין
- דחיפות: urgent או normal
- סוג: one_time או recurring
- ימים: sunday,monday,tuesday,wednesday,thursday,friday,saturday (רק ל-recurring, אחרת none)

דוגמאות:
- "תזכירי לי מחר ב-3 לבדוק הבריכה" → [TASK|לבדוק את הבריכה|tomorrow|15:00|normal|one_time|none]
- "דחוף! צריך להזמין ספק ביום ראשון" → [TASK|להזמין ספק|2026-03-29|none|urgent|one_time|none]
- "כל יום שני לנקות את הבריכה" → [TASK|לנקות את הבריכה|none|none|normal|recurring|monday]
- "כל יום ב' וה' בשעה 8 בבוקר — ישיבת צוות" → [TASK|ישיבת צוות|none|08:00|normal|recurring|monday,thursday]
- "תרשמי לי משימה לנקות את המטבח" → [TASK|לנקות את המטבח|today|none|normal|one_time|none]

חשוב מאוד:
- אם עינת לא מציינת תאריך למשימה חד-פעמית — תשאלי "נשמה, לאיזה יום?"
- אם היא אומרת "מחר", "ביום שלישי" וכו' — חשבי את התאריך הנכון
- אם היא מציינת שעה (ב-3, בשעה 15:00, בצהריים) — תרשמי בפורמט HH:MM
- "בצהריים" = 12:00, "בבוקר" = 08:00, "בערב" = 19:00, "אחה״צ" = 14:00
- "בעוד שעה" / "בעוד שעתיים" / "בעוד 3 שעות" — חשבי את השעה המדויקת לפי השעה הנוכחית והוסיפי
- "בעוד חצי שעה" — חשבי שעה נוכחית + 30 דקות
- אם זו משימה שחוזרת על עצמה — תשתמשי ב-recurring עם הימים המתאימים
השורה הזו חייבת להיות בשורה האחרונה של התשובה, ועינת לא תראה אותה.
את יכולה גם לאשר: "רשמתי נשמה! ✅"

## סימון משימות כבוצעו:
כשעינת אומרת "סיימתי", "בוצע", "עשיתי את זה", "גמרתי" — הוסיפי בסוף:
[DONE|תיאור חלקי של המשימה]
דוגמה: "סיימתי לנקות את הבריכה" → [DONE|לנקות את הבריכה]
ותאשרי בחום: "כל הכבוד מאמי! 👑✅"`;

function buildContext(memoryContext: string, tasksText: string, dayName: string, dateStr: string): string {
  const now = new Date();
  let specialContext = "";

  const holidayGreeting = getJewishHolidayGreeting(now);
  if (holidayGreeting) {
    specialContext = `\n\n## 🎉 היום חג! ברכי את עינת: ${holidayGreeting}`;
  } else if (isErevShabbat(now)) {
    specialContext = "\n\n## 🕯️ היום ערב שבת! ברכי את עינת בשבת שלום!";
  } else if (isShabbat(now)) {
    specialContext = "\n\n## 🕯️ היום שבת! שבת שלום! תזכירי לעינת לנוח!";
  }

  const timeNow = now.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", hour12: false });

  return `${SYSTEM_PROMPT}

## תאריך היום: ${dayName}, ${dateStr} | שעה: ${timeNow}${specialContext}

## מידע על דולפין וילג':
${memoryContext}

## משימות היום (${dayName}, ${dateStr}):
${tasksText}`;
}

async function getContextData() {
  let memoryContext = "";
  try {
    memoryContext = await readMemoryContext();
  } catch (e) {
    console.error("[Chat] Memory read error:", e);
  }

  const today = new Date();
  const dateStr = toDateString(today);
  const dayKey = getDayKey(today.getDay());

  let todayTasks: any[] = [];
  try {
    todayTasks = getTasksForDate(dateStr, dayKey);
  } catch (e) {
    console.error("[Chat] Tasks read error:", e);
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

  return { memoryContext, tasksText, recentConvos, dayName: getDayName(today.getDay()), dateStr };
}

// Try Gemini first, then Groq as fallback
async function chatWithAI(userMessage: string, source: "web" | "whatsapp"): Promise<string> {
  const { memoryContext, tasksText, recentConvos, dayName, dateStr } = await getContextData();
  const systemPrompt = buildContext(memoryContext, tasksText, dayName, dateStr);

  // Try Gemini first
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
  if (geminiKey) {
    const result = await tryGemini(geminiKey, systemPrompt, recentConvos, userMessage);
    if (result) return result;
    console.log("[Chat] Gemini failed, trying Groq fallback...");
  }

  // Groq fallback (free: 14400 req/day)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const result = await tryGroq(groqKey, systemPrompt, recentConvos, userMessage);
    if (result) return result;
    console.log("[Chat] Groq also failed");
  }

  if (!geminiKey && !groqKey) {
    return "אוי, לא מוגדר מפתח API 😅 תגידי לעמנואל!";
  }

  return "עומס ברגע נשמה 😅 נסי שוב בעוד כמה שניות!";
}

async function tryGemini(apiKey: string, systemPrompt: string, recentConvos: any[], userMessage: string): Promise<string | null> {
  const contents: any[] = [];
  for (const c of recentConvos) {
    contents.push({
      role: c.role === "assistant" ? "model" : "user",
      parts: [{ text: c.content }],
    });
  }
  contents.push({ role: "user", parts: [{ text: userMessage }] });

  const models = [process.env.CHAT_MODEL || "gemini-2.0-flash", "gemini-2.0-flash-lite"];

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { maxOutputTokens: 1024, temperature: 0.8 },
          }),
        }
      );

      if (res.status === 429 || res.status === 403 || res.status === 404) {
        console.log(`[Chat] Gemini ${model}: ${res.status}, trying next...`);
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[Chat] Gemini ${model} error:`, res.status, errText);
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log(`[Chat] Success with Gemini ${model}`);
        return text;
      }
    } catch (error: any) {
      console.error(`[Chat] Gemini ${model} error:`, error?.message);
      continue;
    }
  }
  return null;
}

async function tryGroq(apiKey: string, systemPrompt: string, recentConvos: any[], userMessage: string): Promise<string | null> {
  const messages: any[] = [{ role: "system", content: systemPrompt }];
  for (const c of recentConvos) {
    messages.push({ role: c.role === "assistant" ? "assistant" : "user", content: c.content });
  }
  messages.push({ role: "user", content: userMessage });

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        max_tokens: 1024,
        temperature: 0.8,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Chat] Groq error:", res.status, errText);
      return null;
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (text) {
      console.log("[Chat] Success with Groq");
      return text;
    }
    return null;
  } catch (error: any) {
    console.error("[Chat] Groq error:", error?.message);
    return null;
  }
}

export interface ExtractedTask {
  description: string;
  date: string | null;
  time: string | null;
  priority: "normal" | "urgent";
  type: "one_time" | "recurring";
  days_of_week: string[] | null;
}

export interface DoneTask {
  descriptionHint: string;
}

/**
 * Extract [TASK|desc|date|time|priority|type|days] and [DONE|desc] tags from AI response.
 */
export function extractTasks(reply: string): { cleanReply: string; tasks: ExtractedTask[]; doneTasks: DoneTask[] } {
  const tasks: ExtractedTask[] = [];
  const doneTasks: DoneTask[] = [];

  // New format: [TASK|desc|date|time|priority|type|days]
  const taskRegex = /\[TASK\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;
  let match;

  while ((match = taskRegex.exec(reply)) !== null) {
    const description = match[1].trim();
    let date = match[2].trim();
    let time = match[3].trim();
    const priority = match[4].trim() === "urgent" ? "urgent" as const : "normal" as const;
    const type = match[5].trim() === "recurring" ? "recurring" as const : "one_time" as const;
    const daysStr = match[6].trim();

    // Handle date
    const today = new Date();
    if (date === "today") {
      date = toDateString(today);
    } else if (date === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      date = toDateString(tomorrow);
    } else if (date === "none") {
      date = type === "one_time" ? toDateString(today) : "";
    }

    // Handle time
    if (time === "none" || !time) {
      time = "";
    }

    // Handle days for recurring
    let days_of_week: string[] | null = null;
    if (type === "recurring" && daysStr !== "none") {
      days_of_week = daysStr.split(",").map(d => d.trim()).filter(Boolean);
    }

    if (description) {
      tasks.push({
        description,
        date: date || null,
        time: time || null,
        priority,
        type,
        days_of_week,
      });
    }
  }

  // Legacy format fallback: [TASK|desc|date|priority]
  const legacyRegex = /\[TASK\|([^|]+)\|([^|]+)\|([^\]|]+)\]/g;
  const alreadyMatched: string[] = reply.match(/\[TASK\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/g) || [];
  let legacyMatch;
  while ((legacyMatch = legacyRegex.exec(reply)) !== null) {
    const fullMatch = legacyMatch[0];
    if (alreadyMatched.includes(fullMatch)) continue;
    // Check this isn't part of the new format
    if (!alreadyMatched.some(m => m.includes(fullMatch))) {
      const description = legacyMatch[1].trim();
      let date = legacyMatch[2].trim();
      const priority = legacyMatch[3].trim() === "urgent" ? "urgent" as const : "normal" as const;
      const today = new Date();
      if (date === "today") date = toDateString(today);
      else if (date === "tomorrow") {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        date = toDateString(tomorrow);
      }
      tasks.push({ description, date, time: null, priority, type: "one_time", days_of_week: null });
    }
  }

  // Extract [DONE|description hint]
  const doneRegex = /\[DONE\|([^\]]+)\]/g;
  let doneMatch;
  while ((doneMatch = doneRegex.exec(reply)) !== null) {
    doneTasks.push({ descriptionHint: doneMatch[1].trim() });
  }

  // Remove all tags from reply
  const cleanReply = reply
    .replace(/\n?\[TASK\|[^\]]+\]/g, "")
    .replace(/\n?\[DONE\|[^\]]+\]/g, "")
    .trim();

  return { cleanReply, tasks, doneTasks };
}

export async function chatWithClaude(
  userMessage: string,
  source: "web" | "whatsapp" = "web"
): Promise<string> {
  return chatWithAI(userMessage, source);
}
