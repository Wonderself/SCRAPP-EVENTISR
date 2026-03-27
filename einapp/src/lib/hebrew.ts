const DAY_NAMES: Record<number, string> = {
  0: "יום ראשון",
  1: "יום שני",
  2: "יום שלישי",
  3: "יום רביעי",
  4: "יום חמישי",
  5: "יום שישי",
  6: "שבת",
};

const DAY_SHORTS: Record<number, string> = {
  0: "א׳",
  1: "ב׳",
  2: "ג׳",
  3: "ד׳",
  4: "ה׳",
  5: "ו׳",
  6: "ש׳",
};

const DAY_KEYS: Record<number, string> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

export function getDayName(dayIndex: number): string {
  return DAY_NAMES[dayIndex] || "";
}

export function getDayShort(dayIndex: number): string {
  return DAY_SHORTS[dayIndex] || "";
}

export function getDayKey(dayIndex: number): string {
  return DAY_KEYS[dayIndex] || "";
}

export function getDayIndexFromKey(key: string): number {
  return Object.entries(DAY_KEYS).find(([, v]) => v === key)?.[0]
    ? parseInt(Object.entries(DAY_KEYS).find(([, v]) => v === key)![0])
    : -1;
}

export function formatHebrewDate(date: Date): string {
  return date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getWeekDates(referenceDate: Date = new Date()): Date[] {
  const dates: Date[] = [];
  const day = referenceDate.getDay(); // 0=Sunday
  const sunday = new Date(referenceDate);
  sunday.setDate(referenceDate.getDate() - day);

  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Check if it's Friday afternoon (Erev Shabbat).
 * Returns true from Friday 12:00 onwards.
 */
export function isErevShabbat(date: Date = new Date()): boolean {
  return date.getDay() === 5 && date.getHours() >= 12;
}

/**
 * Check if today is Shabbat (Saturday before ~19:00).
 */
export function isShabbat(date: Date = new Date()): boolean {
  return date.getDay() === 6;
}

/**
 * Get Jewish holiday greeting if applicable today.
 * Uses fixed Gregorian dates (approximate) for major holidays.
 * Returns null if no holiday.
 */
export function getJewishHolidayGreeting(date: Date = new Date()): string | null {
  const m = date.getMonth() + 1; // 1-12
  const d = date.getDate();
  const dateKey = `${m}-${d}`;

  // Major Jewish holidays (approximate Gregorian dates for 2026)
  // These shift each year so we use ranges
  const holidays2026: Record<string, string> = {
    // Purim 2026: March 3
    "3-3": "פורים שמח נשמהההה! 🎭🎉 חג שמח מאמי!",
    "3-2": "ערב פורים מאמי! 🎭 מחר חג! חג שמח! 🎉",
    // Pesach 2026: March 22 - March 29
    "3-22": "ערב פסח נשמהההה! 🍷✨ חג שמח מאמי! חג חירות!",
    "3-23": "חג פסח שמח מאאאמי! 🍷🌺 חג חירות!",
    "3-24": "חג פסח שמח נשמה! 🍷",
    "3-29": "שביעי של פסח נשמה! 🌊✨",
    // Yom HaAtzmaut 2026: April 22
    "4-22": "יום העצמאות שמח נשמהההה! 🇮🇱🎉 חג שמח מאמי!",
    // Shavuot 2026: May 12
    "5-11": "ערב שבועות מאמי! 🌾✨ חג שמח!",
    "5-12": "חג שבועות שמח נשמהההה! 🌾🧀 חג מתן תורה!",
    // Rosh Hashana 2026: Sept 12-13
    "9-11": "ערב ראש השנה נשמהההה! 🍎🍯 שנה טובה ומתוקה מאמי!",
    "9-12": "שנה טובה ומתוקה נשמהההה! 🍎🍯✨ שנה מדהימה מאמי!",
    "9-13": "שנה טובה מאמי! 🍯💛 יום שני של ראש השנה!",
    // Yom Kippur 2026: Sept 21
    "9-20": "ערב יום כיפור נשמה! 🕯️ צום קל וגמר חתימה טובה מאמי! 💛",
    "9-21": "גמר חתימה טובה נשמהההה! 🕯️✨",
    // Sukkot 2026: Sept 26 - Oct 2
    "9-25": "ערב סוכות נשמהההה! 🌿✨ חג שמח מאמי!",
    "9-26": "חג סוכות שמח מאאאמי! 🌿🍋 חג שמח!",
    // Simchat Torah 2026: Oct 3
    "10-3": "שמחת תורה שמח נשמהההה! 📜🎉💃",
    // Chanukah 2026: Dec 15 - Dec 22
    "12-15": "חנוכה שמח נשמהההה! 🕎✨ חג אורים מאמי!",
    "12-16": "חנוכה שמח מאמי! 🕎💛 נר שני!",
    "12-17": "חנוכה שמח! 🕎 נר שלישי!",
    "12-18": "חנוכה שמח! 🕎 נר רביעי!",
    "12-19": "חנוכה שמח! 🕎 נר חמישי!",
    "12-20": "חנוכה שמח! 🕎 נר שישי!",
    "12-21": "חנוכה שמח! 🕎 נר שביעי!",
    "12-22": "חנוכה שמח! 🕎✨ נר אחרון מאמי! זיו המנורה!",
  };

  return holidays2026[dateKey] || null;
}

/**
 * Get Shabbat greeting for Friday afternoon.
 */
export function getShabbatGreeting(): string {
  const greetings = [
    "שבת שלוווום נשמהההה! 🕯️✨ שבת מנוחה מאמי!",
    "שבת שלום מאאאמי! 🕯️💛 מגיע לך לנוח!",
    "שבת שלום מלכההה! 🕯️🌺 תהני מהשבת!",
    "שבת שלוווום חביבה! 🕯️✨ שבת של שקט ואהבה!",
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}
