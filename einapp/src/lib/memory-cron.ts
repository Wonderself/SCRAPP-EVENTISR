import fs from "fs";
import path from "path";
import { toDateString } from "./hebrew";
import { readMemoryContext, ensureMemoryDir, readMemoryFile, writeMemoryFile } from "./memory";

const MEMORY_DIR = process.env.MEMORY_DIR || path.join(process.cwd(), "data", "memory");

function hasAIKey(): boolean {
  return !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || process.env.GROQ_API_KEY);
}

async function aiGenerate(systemPrompt: string, userMessage: string, maxTokens = 1500): Promise<string> {
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
              generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3 },
            }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        }
        console.log(`[Memory-Cron] Gemini ${model}: ${res.status}`);
      } catch (e) {
        console.error(`[Memory-Cron] Gemini ${model} error:`, e);
      }
    }
  }

  // Groq fallback
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }],
          max_tokens: maxTokens,
          temperature: 0.3,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || "";
      }
      console.error("[Memory-Cron] Groq error:", res.status);
    } catch (e) {
      console.error("[Memory-Cron] Groq error:", e);
    }
  }

  return "";
}

export async function nightlyExtraction() {
  if (!hasAIKey()) return;

  const dateStr = toDateString(new Date());
  const rawPath = path.join(MEMORY_DIR, "raw-conversations", `${dateStr}.md`);

  if (!fs.existsSync(rawPath)) return;

  const todayConversations = fs.readFileSync(rawPath, "utf-8");
  if (todayConversations.trim().length < 50) return;

  const existingMemory = await readMemoryContext();

  const text = await aiGenerate(
    `את מנתחת שיחות של עינת אמר, מנהלת דולפין וילג'.

משימתך: לנתח את השיחות של היום ולחלץ מידע חדש בלבד.

קטגוריות:
- hotel-profile: מידע חדש על המלון, מתקנים, שינויים
- suppliers: ספקים חדשים, שינויי מחיר, בעיות אספקה, טלפונים
- staff: צוות חדש, שינויי תפקיד, ביצועים, בעיות
- regular-guests: אורחים קבועים, העדפות, בקשות מיוחדות
- procedures: נהלים חדשים, שינויי תהליך
- issues-log: בעיות חדשות, תקלות, פתרונות שנמצאו
- financial-notes: מחירים, תקציב, הוצאות, הכנסות
- ideas: רעיונות לשיפור
- einat-personal: מה למדנו על עינת — מה היא אוהבת, מצב רוח, תחביבים, משפחה

כללים:
- רק מידע חדש! לא לחזור על מה שכבר קיים
- אם אין מידע חדש בקטגוריה — לא לכלול אותה
- כתבי בעברית, תמציתי וברור
- החזירי JSON: { "category-name": "טקסט להוספה" }
- אם אין כלום חדש — החזירי {}`,
    `זיכרון קיים:\n${existingMemory.substring(0, 3000)}\n\n---\n\nשיחות היום:\n${todayConversations.substring(0, 4000)}`
  );

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return;

    const updates = JSON.parse(jsonMatch[0]);

    for (const [category, newContent] of Object.entries(updates)) {
      if (typeof newContent !== "string" || !newContent.trim()) continue;
      const filename = `${category}.md`;
      try {
        const current = readMemoryFile(filename);
        const updated = current.trimEnd() + "\n\n" + `### ${dateStr}\n${newContent.trim()}` + "\n";
        writeMemoryFile(filename, updated);
      } catch {
        // File might not exist — skip
      }
    }
  } catch (error) {
    console.error("[Memory] Nightly extraction error:", error);
  }
}

export async function weeklySummary() {
  if (!hasAIKey()) return;

  ensureMemoryDir();
  const rawDir = path.join(MEMORY_DIR, "raw-conversations");
  if (!fs.existsSync(rawDir)) return;

  const conversations: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = toDateString(d);
    const fp = path.join(rawDir, `${dateStr}.md`);
    if (fs.existsSync(fp)) {
      const content = fs.readFileSync(fp, "utf-8").trim();
      if (content) conversations.push(`--- ${dateStr} ---\n${content}`);
    }
  }

  if (conversations.length === 0) return;

  const summary = await aiGenerate(
    `סכמי את השבוע של עינת בדולפין וילג'.

כללי הסיכום:
- מה היו האירועים המרכזיים?
- מה הלך טוב? מה היה קשה?
- איך הייתה האנרגיה של עינת השבוע?
- החלטות חשובות שהתקבלו
- דברים שצריך לזכור לטווח ארוך
- בעברית, תמציתי, 10-15 שורות מקסימום`,
    conversations.join("\n\n").substring(0, 5000),
    800
  );

  if (!summary.trim()) return;

  const now = new Date();
  const weekNum = getISOWeek(now);
  const year = now.getFullYear();
  const summaryDir = path.join(MEMORY_DIR, "chat-summaries");
  if (!fs.existsSync(summaryDir)) fs.mkdirSync(summaryDir, { recursive: true });
  const fp = path.join(summaryDir, `${year}-W${String(weekNum).padStart(2, "0")}.md`);
  fs.writeFileSync(fp, `# סיכום שבוע ${weekNum}, ${year}\n\n${summary}\n`, "utf-8");

  // Clean old raw conversations (> 7 days)
  try {
    const files = fs.readdirSync(rawDir);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    for (const file of files) {
      try {
        const dateStr = file.replace(".md", "");
        if (new Date(dateStr) < cutoff) fs.unlinkSync(path.join(rawDir, file));
      } catch {}
    }
  } catch (e) {
    console.error("[Memory] Failed to clean old conversations:", e);
  }
}

export async function monthlyOptimization() {
  if (!hasAIKey()) return;

  ensureMemoryDir();

  const memoryFiles = [
    "hotel-profile.md", "suppliers.md", "staff.md", "regular-guests.md",
    "procedures.md", "issues-log.md", "financial-notes.md", "ideas.md",
    "einat-personal.md",
  ];

  for (const filename of memoryFiles) {
    const content = readMemoryFile(filename);
    if (!content || content.trim().length < 100) continue;
    if (Buffer.byteLength(content, "utf-8") < 5000) continue;

    try {
      const optimized = await aiGenerate(
        `ייעלי את קובץ הזיכרון הזה.

כללים:
- מחקי כפילויות
- מחקי מידע מיושן
- שמרי את כל המידע הרלוונטי
- ארגני לפי נושאים ברורים
- היי תמציתית, כתבי בעברית
- שמרי את הכותרת הראשית של הקובץ`,
        content,
        2000
      );

      if (optimized.trim().length > 50) {
        writeMemoryFile(filename, optimized);
      }
    } catch (error) {
      console.error(`[Memory] Optimization error for ${filename}:`, error);
    }
  }

  // Clean old raw conversations (> 30 days)
  const rawDir = path.join(MEMORY_DIR, "raw-conversations");
  if (fs.existsSync(rawDir)) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    for (const file of fs.readdirSync(rawDir)) {
      const dateStr = file.replace(".md", "");
      try {
        if (new Date(dateStr) < cutoff) fs.unlinkSync(path.join(rawDir, file));
      } catch {}
    }
  }

  // Clean old weekly summaries (> 3 months)
  const summaryDir = path.join(MEMORY_DIR, "chat-summaries");
  if (fs.existsSync(summaryDir)) {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 3);
    for (const file of fs.readdirSync(summaryDir)) {
      try {
        const match = file.match(/(\d{4})-W(\d{2})/);
        if (match) {
          const fileDate = new Date(parseInt(match[1]), 0, 1 + parseInt(match[2]) * 7);
          if (fileDate < cutoff) fs.unlinkSync(path.join(summaryDir, file));
        }
      } catch {}
    }
  }
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
