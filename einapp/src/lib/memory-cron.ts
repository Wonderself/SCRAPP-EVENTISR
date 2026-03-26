import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { toDateString } from "./hebrew";
import { readMemoryContext, ensureMemoryDir, readMemoryFile, writeMemoryFile } from "./memory";

const MEMORY_DIR = process.env.MEMORY_DIR || path.join(process.cwd(), "data", "memory");

/**
 * MEMORY STRATEGY — 3 TIERS
 *
 * 1. SHORT-TERM (hours): Raw conversations stored in raw-conversations/{date}.md
 *    - Every message saved in real-time
 *    - Full context available for same-day conversations
 *    - Deleted after 30 days
 *
 * 2. MID-TERM (weeks): Weekly summaries in chat-summaries/{year}-W{week}.md
 *    - Created every Sunday at 22:00
 *    - Captures key decisions, problems, moods, patterns
 *    - Compressed after 3 months into long-term
 *
 * 3. LONG-TERM (permanent): Category files (hotel-profile.md, staff.md, etc.)
 *    - Updated nightly by AI extraction from day's conversations
 *    - Never deleted, only refined and optimized
 *    - Includes: einat-personal.md (learning about Einat herself)
 *
 * NIGHTLY EXTRACTION (23:00):
 *   Haiku reads today's conversations and extracts:
 *   - New supplier info → suppliers.md
 *   - Staff updates → staff.md
 *   - Guest preferences → regular-guests.md
 *   - Procedure changes → procedures.md
 *   - Issues/fixes → issues-log.md
 *   - Financial info → financial-notes.md
 *   - Ideas → ideas.md
 *   - Personal info about Einat → einat-personal.md
 *   - Hotel operational info → hotel-profile.md
 *
 * WEEKLY SUMMARY (Sunday 22:00):
 *   Haiku summarizes the week's conversations:
 *   - Key events and decisions
 *   - Einat's mood and energy patterns
 *   - Recurring themes
 *   - What went well, what was hard
 *
 * MONTHLY OPTIMIZATION (1st, 03:00):
 *   Haiku reads each memory file and:
 *   - Removes duplicates
 *   - Removes outdated info
 *   - Rewrites for clarity
 *   - Ensures nothing important is lost
 */

export async function nightlyExtraction() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return;

  const dateStr = toDateString(new Date());
  const rawPath = path.join(MEMORY_DIR, "raw-conversations", `${dateStr}.md`);

  if (!fs.existsSync(rawPath)) return; // No conversations today

  const todayConversations = fs.readFileSync(rawPath, "utf-8");
  if (todayConversations.trim().length < 50) return; // Too short

  const existingMemory = await readMemoryContext();
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: process.env.UTILITY_MODEL || "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    system: `את מנתחת שיחות של עינת אמר, מנהלת דולפין וילג'.

משימתך: לנתח את השיחות של היום ולחלץ מידע חדש בלבד.

קטגוריות:
- hotel-profile: מידע חדש על המלון, מתקנים, שינויים
- suppliers: ספקים חדשים, שינויי מחיר, בעיות אספקה, טלפונים
- staff: צוות חדש, שינויי תפקיד, ביצועים, בעיות
- regular-guests: אורחים קבועים, העדפות, בקשות מיוחדות
- procedures: נהלים חדשים, שינויי תהליך
- issues-log: בעיות חדשות, תקלות, פתרונות שנמצאו
- financial-notes: מחירים, תקציב, הוצאות, הכנסות
- ideas: רעיונות לשיפור, פיצ'רים חדשים
- einat-personal: מה למדנו על עינת עצמה — מה היא אוהבת, מה מעציב אותה, מה משמח אותה, מזג רוח, תחביבים, משפחה, דברים אישיים

כללים:
- רק מידע חדש! לא לחזור על מה שכבר קיים בזיכרון
- אם אין מידע חדש בקטגוריה — לא לכלול אותה
- כתבי בעברית, תמציתי וברור
- החזירי JSON: { "category-name": "טקסט להוספה" }
- אם אין כלום חדש — החזירי {}`,
    messages: [
      {
        role: "user",
        content: `זיכרון קיים:\n${existingMemory.substring(0, 3000)}\n\n---\n\nשיחות היום:\n${todayConversations.substring(0, 4000)}`,
      },
    ],
  });

  try {
    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
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
        // File might not exist or exceed size — skip
      }
    }
  } catch (error) {
    console.error("[Memory] Nightly extraction error:", error);
  }
}

export async function weeklySummary() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return;

  ensureMemoryDir();
  const rawDir = path.join(MEMORY_DIR, "raw-conversations");
  if (!fs.existsSync(rawDir)) return;

  // Collect last 7 days of conversations
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

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: process.env.UTILITY_MODEL || "claude-haiku-4-5-20251001",
    max_tokens: 800,
    system: `סכמי את השבוע של עינת בדולפין וילג'.

כללי הסיכום:
- מה היו האירועים המרכזיים?
- מה הלך טוב? מה היה קשה?
- איך הייתה האנרגיה של עינת השבוע?
- החלטות חשובות שהתקבלו
- דברים שצריך לזכור לטווח ארוך
- בעברית, תמציתי, 10-15 שורות מקסימום`,
    messages: [
      { role: "user", content: conversations.join("\n\n").substring(0, 5000) },
    ],
  });

  const summary = response.content[0].type === "text" ? response.content[0].text : "";
  if (!summary.trim()) return;

  // Save weekly summary
  const now = new Date();
  const weekNum = getISOWeek(now);
  const year = now.getFullYear();
  const summaryDir = path.join(MEMORY_DIR, "chat-summaries");
  if (!fs.existsSync(summaryDir)) fs.mkdirSync(summaryDir, { recursive: true });
  const fp = path.join(summaryDir, `${year}-W${String(weekNum).padStart(2, "0")}.md`);
  fs.writeFileSync(fp, `# סיכום שבוע ${weekNum}, ${year}\n\n${summary}\n`, "utf-8");

  // Clean old raw conversations (> 7 days)
  const files = fs.readdirSync(rawDir);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  for (const file of files) {
    const dateStr = file.replace(".md", "");
    if (new Date(dateStr) < cutoff) {
      fs.unlinkSync(path.join(rawDir, file));
    }
  }
}

export async function monthlyOptimization() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return;

  ensureMemoryDir();

  const memoryFiles = [
    "hotel-profile.md", "suppliers.md", "staff.md", "regular-guests.md",
    "procedures.md", "issues-log.md", "financial-notes.md", "ideas.md",
    "einat-personal.md",
  ];

  const client = new Anthropic({ apiKey });

  for (const filename of memoryFiles) {
    const content = readMemoryFile(filename);
    if (!content || content.trim().length < 100) continue;

    // Only optimize if file is getting large (> 5KB)
    if (Buffer.byteLength(content, "utf-8") < 5000) continue;

    try {
      const response = await client.messages.create({
        model: process.env.UTILITY_MODEL || "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        system: `ייעלי את קובץ הזיכרון הזה.

כללים:
- מחקי כפילויות
- מחקי מידע מיושן (אם ברור שהוא לא רלוונטי)
- שמרי את כל המידע הרלוונטי
- ארגני לפי נושאים ברורים
- היי תמציתית
- כתבי בעברית
- שמרי את הכותרת הראשית של הקובץ`,
        messages: [{ role: "user", content }],
      });

      const optimized = response.content[0].type === "text" ? response.content[0].text : "";
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

  // Compress old weekly summaries (> 3 months) into yearly
  const summaryDir = path.join(MEMORY_DIR, "chat-summaries");
  if (fs.existsSync(summaryDir)) {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 3);
    // Just delete very old summaries — the important info is already in long-term memory
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
