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
    return `# דולפין וילג' — פרופיל

## מידע כללי
- שם: דולפין וילג' (Dolphin Village)
- כתובת: הגפן 1, שבי ציון
- טלפון: 073-236-9129
- וואטסאפ: 053-360-4885
- מייל: Res@dolphin-village.com
- אתר: dolphin-village.co.il
- אינסטגרם: @dolphin_village

## מתקנים
- 22 בקתות: זוגיות (30 מ"ר), זוגיות+בריכה, משפחתיות (42 מ"ר), משפחתיות גדולות (70 מ"ר)
- ספא: 2 ג'קוזי חיצוני, סאונה יבשה, חדר טיפולים
- בר חיצוני + טאבון לפיצות (עונתי)
- פינת קפה 24/7
- חדר ישיבות
- חנות בוטיק
- אופניים חינם + עגלות חוף

## עונתיות
- אוגוסט: מלא לחלוטין
- קיץ אמצע שבוע: עדיין יש מקום
- ספטמבר: ירידת מחירים (~1,050 → ~635 ש"ח/לילה לזוג)
- חורף: מ-780 ש"ח אמצע שבוע
- סופ"ש: ~50% יותר מאמצע שבוע

## ארוחת בוקר
- בופה (כלול באירוח, 95 ש"ח לחיצוניים)
- סלטים טריים, גבינות בוטיק, דגים מעושנים, ביצים לפי הזמנה, מיצים סחוטים, מאפים, שקשוקה
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
