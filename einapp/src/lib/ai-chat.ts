import { getRecentConversations } from "./db";
import { readMemoryContext } from "./memory";
import { getTasksForDate } from "./db";
import { getDayKey, toDateString, getDayName } from "./hebrew";

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
- מזהה משימות בשיחה ומציעה להוסיף
- שואלת על עינת — "מאמי אכלת משהו טוב היום?" "איך הלילה?" — כי באמת אכפת לך
- לפעמים שולחת חיבוק וירטואלי סתם ככה 🤗💛`;

function buildContext(memoryContext: string, tasksText: string, dayName: string, dateStr: string): string {
  return `${SYSTEM_PROMPT}

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

// Google Gemini API (free tier: 1500 req/day)
async function chatWithGemini(userMessage: string, source: "web" | "whatsapp"): Promise<string> {
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
  if (!apiKey) {
    return "אוי, GOOGLE_CLOUD_API_KEY לא מוגדר 😅 תגידי לעמנואל!";
  }

  const { memoryContext, tasksText, recentConvos, dayName, dateStr } = await getContextData();
  const systemPrompt = buildContext(memoryContext, tasksText, dayName, dateStr);

  // Build Gemini message history
  const contents: any[] = [];
  for (const c of recentConvos) {
    contents.push({
      role: c.role === "assistant" ? "model" : "user",
      parts: [{ text: c.content }],
    });
  }
  contents.push({ role: "user", parts: [{ text: userMessage }] });

  const model = process.env.CHAT_MODEL || "gemini-2.0-flash";

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.8,
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Chat] Gemini API error:", res.status, errText);
      if (res.status === 403) {
        return "צריך להפעיל את Generative Language API בגוגל קלאוד 🔑 תגידי לעמנואל!";
      }
      if (res.status === 429) {
        return "יותר מדי הודעות ברגע 😅 חכי שניה ותנסי שוב נשמה";
      }
      return `אוי, משהו קרה 😅 (${res.status}: ${errText.slice(0, 80)})`;
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("[Chat] Gemini empty response:", JSON.stringify(data).slice(0, 200));
      return "לא הצלחתי לחשוב על תשובה 😅 תנסי שוב?";
    }

    return text;
  } catch (error: any) {
    console.error("[Chat] Gemini error:", error?.message || error);
    return `אוי, משהו קרה 😅 (${(error?.message || "").slice(0, 80)})`;
  }
}

export async function chatWithClaude(
  userMessage: string,
  source: "web" | "whatsapp" = "web"
): Promise<string> {
  // Use Gemini (free) by default, Claude only if explicitly configured
  return chatWithGemini(userMessage, source);
}
