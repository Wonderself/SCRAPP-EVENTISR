import fs from "fs";
import path from "path";

const MEMORY_DIR = process.env.MEMORY_DIR || path.join(process.cwd(), "data", "memory");

const MEMORY_FILES = [
  "hotel-profile.md",
  "suppliers.md",
  "staff.md",
  "regular-guests.md",
  "procedures.md",
  "issues-log.md",
  "financial-notes.md",
  "ideas.md",
  "einat-personal.md",
];

export function ensureMemoryDir() {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
  const subDirs = ["chat-summaries", "raw-conversations"];
  for (const sub of subDirs) {
    const p = path.join(MEMORY_DIR, sub);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  }
  // Create files if they don't exist
  for (const file of MEMORY_FILES) {
    const fp = path.join(MEMORY_DIR, file);
    if (!fs.existsSync(fp)) {
      fs.writeFileSync(fp, getDefaultContent(file), "utf-8");
    }
  }
}

function getDefaultContent(filename: string): string {
  if (filename === "hotel-profile.md") {
    return `# דולפין וילג' — פרופיל מלא

## מידע כללי
- שם: דולפין וילג' (Dolphin Village)
- כתובת: הגפן 1, שבי ציון
- טלפון: 073-236-9129
- וואטסאפ: 053-360-4885
- מייל: Res@dolphin-village.com
- אתר: dolphin-village.co.il
- אינסטגרם: @dolphin_village (8,497 עוקבים)
- פייסבוק: /HotelDolphinVillage
- טיקטוק: @dolphinvillage
- דירוג Booking.com: 9.3/10 — דירוג צוות: 9.7/10
- GPS: 32.9838673, 35.0806172

## הטאגליין הרשמי
- Sea Vibes Vacation (לא "Good Vibes Only")
- "חופשה באנרגיה של הים"
- "נפש, ים וטבע" — שלושת עמודי הזהות
- "PURA VIDA"

## בעלים ומנהלים
- בעלים: רן ומיטל ויינרבה — רכשו ושיפצו ב-2023
- מעצבת פנים: אסנת נוביק
- המלון המקורי "בית דולפין" נפתח ב-1942 — אירח את קירק דאגלס, סופיה לורן, דני קיי

## מתקנים
- 22 בקתות עצמאיות על 5 דונם צמחייה טרופית
- 4 סוגי בקתות:
  - זוגית (30 מ"ר, 2 אורחים) — מיטת קינג, מטבחון, מרפסת + מנגל
  - זוגית + בריכת פלאנג' מחוממת (30 מ"ר)
  - משפחתית קלאסית (42 מ"ר, עד 5) — גלריה דו-קומתית
  - משפחתית גדולה (70 מ"ר, עד 7) — דו-קומתית, 1 קינג + 5 יחיד
- כל בקתה: מזרני King Koil, סמארט TV, מאוורר תקרה + מיזוג, מטבחון
- ספא: 2 ג'קוזי חיצוני גדול, סאונה יבשה, חדר טיפולים (שוודי, עמוק, לומי-לומי, זוגי)
- בר חיצוני + טאבון לפיצות טריות (עונתי)
- פינת קפה 24/7 — אספרסו, קפוצ'ינו, שוקו, חטיפים — חינם
- חדר ישיבות עם ציוד AV
- חנות בוטיק — בגדי ים ותכשיטי ים
- אופניים חינם + עגלות חוף מאובזרות (כיסאות, שמשייה, מחצלת)
- פסל בת-ים ומזרקת דגים בכניסה

## החוף
- פחות מ-100 מ' מהמלון
- חוף שבי ציון — "11 מתוך 10" לפי Ynet
- חלק דרומי: בריכות סלע עם סרטנים, שושנות ים, דגיגים — מושלם לילדים
- חלק מרכזי: מציל, מזח, שובר גלים, 2 מפרצונים חוליים
- חלק צפוני פראי: מפרץ עם גלישה מצוינת — ריף ברייק

## אוכל
- ארוחת בוקר בופה (כלול, 95 ש"ח לחיצוניים)
- "ברמה של מלון יוקרה באילת" (Ynet)
- סלטים טריים, גבינות בוטיק, דגים מעושנים, ביצים לפי הזמנה
- מיצים סחוטים, מאפים, שקשוקה
- בר חיצוני עם פיצות טאבון (עונתי)

## עונתיות ומחירים
- אוגוסט: מלא לחלוטין
- קיץ אמצע שבוע: עדיין יש מקום
- ספטמבר: ירידת מחירים (~1,050 → ~635 ש"ח/לילה לזוג)
- חורף: מ-780 ש"ח אמצע שבוע
- סופ"ש: ~50% יותר מאמצע שבוע

## סביבה וקרבה
- "חופשה ללא רכב" — הכל בהליכה או אופניים
- חוף: דקה הליכה
- פאב הפרה: מוזיקה חיה כל ערב — דקות
- בר השוקט: מסיבות שנות ה-80 — ליד
- נהריה: 10 דקות באופניים לאורך החוף
- עכו העתיקה: 7 ק"מ
- ראש הנקרה: 20 ק"מ
- פארק אכזיב: נגיש באופניים
- מועדון Indigo: SUP, קייאק, שנורקל, צלילה, ספארי סירות

## עיצוב ואווירה
- השראה: כפרי גלישה אקזוטיים ברחבי העולם
- חומרים: עץ, במבוק, קש, אבן — כלום סטרילי
- קיר גלשנים בלובי
- שבילי אבן מתפתלים בצמחייה טרופית
- אווירה: בוהו-חופי, רגוע, טבעי — "חופשה שמרגישה כמו חו"ל"
- "אווירה נטולת פוזה" (Ynet)
- פלייליסט Spotify ייחודי למלון

## אירועים
- אירועי חברות ויומי גיבוש
- שבת חתן — הזמנת 10+ חדרים
- חדר ישיבות עם ציוד AV

## היסטוריה
- "בית דולפין" המקורי נפתח ב-1942 — מהמלונות הבוטיק הראשונים בישראל
- שנים של דעיכה → התחדשות 2023 ע"י ויינרבה
- במלחמת אוקטובר 2023 — אירח עובדים חיוניים ומשפחותיהם מפונים למעלה משנה
`;
  }
  const titles: Record<string, string> = {
    "suppliers.md": "# ספקים",
    "staff.md": "# צוות",
    "regular-guests.md": "# אורחים קבועים",
    "procedures.md": "# נהלים",
    "issues-log.md": "# יומן בעיות",
    "financial-notes.md": "# הערות כספיות",
    "ideas.md": "# רעיונות לשיפור",
    "einat-personal.md": "# עינת — דברים אישיים\n\n## מי את עינת?\nכאן נאסוף דברים שלמדנו על עינת — מה היא אוהבת, מה מעציב אותה, תחביבים, משפחה, מזג רוח, דברים שחשובים לה.\n",
  };
  return `${titles[filename] || "# " + filename}\n\n`;
}

export async function readMemoryContext(): Promise<string> {
  ensureMemoryDir();
  const parts: string[] = [];
  for (const file of MEMORY_FILES) {
    const fp = path.join(MEMORY_DIR, file);
    if (fs.existsSync(fp)) {
      const content = fs.readFileSync(fp, "utf-8").trim();
      if (content) parts.push(content);
    }
  }

  // Include recent weekly summaries (last 4 weeks)
  const summaryDir = path.join(MEMORY_DIR, "chat-summaries");
  if (fs.existsSync(summaryDir)) {
    const summaries = fs.readdirSync(summaryDir)
      .filter(f => f.endsWith(".md"))
      .sort()
      .slice(-4);
    for (const file of summaries) {
      const content = fs.readFileSync(path.join(summaryDir, file), "utf-8").trim();
      if (content) parts.push(content);
    }
  }

  return parts.join("\n\n---\n\n");
}

export function listMemoryFiles(): { name: string; size: number; path: string }[] {
  ensureMemoryDir();
  return MEMORY_FILES.map((file) => {
    const fp = path.join(MEMORY_DIR, file);
    const stat = fs.existsSync(fp) ? fs.statSync(fp) : null;
    return {
      name: file,
      size: stat ? stat.size : 0,
      path: fp,
    };
  });
}

export function readMemoryFile(filename: string): string {
  ensureMemoryDir();
  const fp = path.join(MEMORY_DIR, filename);
  if (!fs.existsSync(fp)) return "";
  return fs.readFileSync(fp, "utf-8");
}

export function writeMemoryFile(filename: string, content: string): void {
  ensureMemoryDir();
  if (!MEMORY_FILES.includes(filename)) return;
  const fp = path.join(MEMORY_DIR, filename);
  const maxSize = (parseInt(process.env.MEMORY_MAX_FILE_SIZE_KB || "50") || 50) * 1024;
  if (Buffer.byteLength(content, "utf-8") > maxSize) {
    throw new Error(`File exceeds max size of ${maxSize / 1024}KB`);
  }
  fs.writeFileSync(fp, content, "utf-8");
}

export function appendToMemoryFile(filename: string, text: string): void {
  ensureMemoryDir();
  if (!MEMORY_FILES.includes(filename)) return;
  const fp = path.join(MEMORY_DIR, filename);
  const current = fs.existsSync(fp) ? fs.readFileSync(fp, "utf-8") : "";
  const newContent = current.trimEnd() + "\n\n" + text.trim() + "\n";
  writeMemoryFile(filename, newContent);
}

export function saveRawConversation(dateStr: string, content: string): void {
  ensureMemoryDir();
  const fp = path.join(MEMORY_DIR, "raw-conversations", `${dateStr}.md`);
  const current = fs.existsSync(fp) ? fs.readFileSync(fp, "utf-8") : "";
  fs.writeFileSync(fp, current + content + "\n\n", "utf-8");
}
