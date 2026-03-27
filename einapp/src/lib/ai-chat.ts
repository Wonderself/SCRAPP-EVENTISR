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
כשעינת מבקשת תזכורת או משימה (למשל "תזכירי לי ביום שלישי לבדוק את הבריכה"), את חייבת:
1. לענות בחום כמו תמיד
2. להוסיף שורה מיוחדת בסוף התשובה בפורמט הזה בדיוק:
[TASK|תיאור המשימה|YYYY-MM-DD|urgent או normal]
דוגמאות:
- "תזכירי לי מחר לבדוק הבריכה" → [TASK|לבדוק את הבריכה|2026-03-28|normal]
- "דחוף! צריך להזמין ספק ביום ראשון" → [TASK|להזמין ספק|2026-03-29|urgent]
- "תרשמי לי משימה לנקות את המטבח" → [TASK|לנקות את המטבח|today|normal]
אם עינת לא מציינת תאריך, תשאלי אותה. אם היא אומרת "מחר", "ביום שלישי" וכו' — חשבי את התאריך הנכון.
השורה הזו חייבת להיות בשורה האחרונה של התשובה, ועינת לא תראה אותה — המערכת תקרא אותה ותיצור את המשימה.
את יכולה גם לאשר שהמשימה נרשמה: "רשמתי נשמה! ✅"`;

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

  return `${SYSTEM_PROMPT}

## תאריך היום: ${dayName}, ${dateStr}${specialContext}

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
  date: string;
  priority: "normal" | "urgent";
}

/**
 * Extract [TASK|description|date|priority] tags from AI response.
 * Returns the cleaned text (without tags) and any extracted tasks.
 */
export function extractTasks(reply: string): { cleanReply: string; tasks: ExtractedTask[] } {
  const tasks: ExtractedTask[] = [];
  const taskRegex = /\[TASK\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;
  let match;

  while ((match = taskRegex.exec(reply)) !== null) {
    const description = match[1].trim();
    let date = match[2].trim();
    const priority = match[3].trim() === "urgent" ? "urgent" as const : "normal" as const;

    // Handle "today" / "tomorrow"
    const today = new Date();
    if (date === "today") {
      date = toDateString(today);
    } else if (date === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      date = toDateString(tomorrow);
    }

    if (description) {
      tasks.push({ description, date, priority });
    }
  }

  // Remove task tags from reply
  const cleanReply = reply.replace(/\n?\[TASK\|[^\]]+\]/g, "").trim();

  return { cleanReply, tasks };
}

export async function chatWithClaude(
  userMessage: string,
  source: "web" | "whatsapp" = "web"
): Promise<string> {
  return chatWithAI(userMessage, source);
}
