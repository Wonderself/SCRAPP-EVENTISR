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
