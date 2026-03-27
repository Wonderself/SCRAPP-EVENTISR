import { toDateString } from "./hebrew";

async function aiGenerate(systemPrompt: string, userMessage: string): Promise<string> {
  // Try Gemini first
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || "";
  if (geminiKey) {
    const models = [process.env.CHAT_MODEL || "gemini-2.0-flash", "gemini-2.0-flash-lite"];
    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: "user", parts: [{ text: userMessage }] }],
              generationConfig: { maxOutputTokens: 600, temperature: 0.9 },
            }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        }
        console.log(`[AI-Parser] Gemini ${model}: ${res.status}`);
      } catch (e) {
        console.error(`[AI-Parser] Gemini ${model} error:`, e);
      }
    }
  }

  // Groq fallback
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_tokens: 600,
          temperature: 0.9,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
      console.error("[AI-Parser] Groq error:", res.status);
    } catch (e) {
      console.error("[AI-Parser] Groq error:", e);
    }
  }

  return "";
}

export async function extractTasksFromTranscription(
  transcription: string
): Promise<any[]> {
  const today = toDateString(new Date());

  const result = await aiGenerate(
    `את עוזרת ניהול מלונאי. חלצי משימות מההודעה הקולית.
החזירי JSON בלבד (מערך): [{ "description": "...", "date": "YYYY-MM-DD", "type": "one_time", "priority": "normal", "days_of_week": [] }]
התאריך של היום: ${today}. אם היא אומרת "יום חמישי" — זה יום חמישי הקרוב.
אם היא אומרת "כל יום שני" — זו משימה קבועה עם type: "recurring" ו-days_of_week: ["monday"].
אם אין משימות ברורות — החזירי מערך ריק [].`,
    transcription
  );

  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/);
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
  const result = await aiGenerate(
    `את Einapp — החברה הכי טובה של עינת אמר, מנהלת דולפין וילג' בשבי ציון.
צרי הודעת בוקר טוב ב-WhatsApp — חמה, אישית, בסגנון bestie.

כללים:
- פתחי בהתלהבות: "הייייי נשמהההה! ☀️", "בוקר טוווב מאמי! 💛", "מלכההה! בוקר אור! 🌊"
- הוסיפי מזג אוויר בקצרה
- רשמי את המשימות בצורה ברורה עם אימוג'ים
- אם יש משימות דחופות — הדגישי: "🔴 דחוף!"
- סיימי בעידוד: "את אלופה!", "יאללה מאמי, יום מדהים! 💪"
- אם שישי: "שישייייי! 🎉 כמעט סופ״ש מאמי!"
- אם אין משימות: "יום רגוע נשמה! 🌴"
- קצר: 6-10 שורות
- עברית חמה, bestie style, אימוג'ים בטבעיות`,
    `המשימות: ${tasksJson}\nהיום: ${dayName} ${date}\nמזג אוויר: ${weatherInfo || "לא זמין"}`
  );

  return result || `הייייי נשמהההה! ☀️💛 בוקר טוב מאמי!\nהיום ${dayName} — יאללה נעשה יום מדהים! 💪🌊`;
}

export async function generateEveningMessage(
  todayStatusJson: string,
  tomorrowTasksJson: string
): Promise<string> {
  const result = await aiGenerate(
    `את Einapp — החברה הכי טובה של עינת אמר.
צרי הודעת ערב ב-WhatsApp — חמה, אכפתית, bestie style.

כללים:
- פתחי בחום: "ערב טוווב נשמהההה! 🌙", "מאמי! איך היה היום? 💛"
- אם הכל הושלם: "סיימת הכל מלכהההה! 🎉👑 את אלופה!"
- אם נשארו משימות: "נשארו כמה דברים, נעביר למחר? בלי לחץ מאמי 💛"
- הצצה למחר בקצרה
- סיימי בחום: "תנוחי טוב!", "חלומות מתוקים מאמי! 😴💛"
- אם שישי: "שבת שלוווום נשמה! 🕯️✨ מגיע לך לנוח!"
- קצר: 4-6 שורות
- אימוג'ים בטבעיות`,
    `מצב היום: ${todayStatusJson}\nמשימות מחר: ${tomorrowTasksJson}`
  );

  return result || `ערב טוווב נשמהההה! 🌙💛 איך היה היום מאמי? תנוחי טוב! 😴`;
}

export async function generateTaskReminder(
  taskDescription: string,
  taskTime: string,
  isUrgent: boolean
): Promise<string> {
  const result = await aiGenerate(
    `את Einapp — החברה הכי טובה של עינת. צרי תזכורת קצרה ב-WhatsApp.
כללים:
- שורה אחת-שתיים מקסימום
- חמה ואישית
- אם דחוף: "🔴 נשמהההה! דחוף!"
- אם רגיל: "💛 מאמי, תזכורת:"
- אימוג'ים בטבעיות`,
    `משימה: ${taskDescription}\nשעה: ${taskTime}\nדחוף: ${isUrgent ? "כן" : "לא"}`
  );

  if (result) return result;

  return isUrgent
    ? `🔴 נשמהההה! דחוף!\n${taskDescription} (${taskTime})`
    : `💛 מאמי, תזכורת:\n${taskDescription} (${taskTime})`;
}
