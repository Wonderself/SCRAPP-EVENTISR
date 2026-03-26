import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "einapp.db");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  ensureDataDir();
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  // Create tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('recurring', 'one-time', 'one_time')),
      priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
      date DATE,
      time TIME,
      days_of_week TEXT,
      start_date DATE,
      end_date DATE,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS task_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      completed_date DATE NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL CHECK (source IN ('whatsapp', 'web')),
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Add indexes for performance
  _db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_type_active ON tasks(type, is_active);
    CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
    CREATE INDEX IF NOT EXISTS idx_task_completions_date ON task_completions(completed_date);
    CREATE INDEX IF NOT EXISTS idx_task_completions_task ON task_completions(task_id, completed_date);
    CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at);
    CREATE INDEX IF NOT EXISTS idx_app_state_key ON app_state(key);
  `);

  return _db;
}

// Session validation
export function isValidSession(token: string): boolean {
  const db = getDb();
  const row = db.prepare(`SELECT value FROM app_state WHERE key = ?`).get(`session:${token}`) as any;
  if (!row?.value) return false;
  const expiresAt = new Date(row.value);
  if (expiresAt < new Date()) {
    db.prepare(`DELETE FROM app_state WHERE key = ?`).run(`session:${token}`);
    return false;
  }
  return true;
}

export function cleanExpiredSessions(): void {
  const db = getDb();
  const now = new Date().toISOString();
  const sessions = db.prepare(`SELECT key, value FROM app_state WHERE key LIKE 'session:%'`).all() as any[];
  for (const s of sessions) {
    if (new Date(s.value) < new Date(now)) {
      db.prepare(`DELETE FROM app_state WHERE key = ?`).run(s.key);
    }
  }
}

// Task helpers
export function getTasksForDate(dateStr: string, dayKey: string) {
  const db = getDb();
  const oneTime = db
    .prepare(
      `SELECT * FROM tasks WHERE type IN ('one_time', 'one-time') AND date = ? AND is_active = 1`
    )
    .all(dateStr);
  const recurring = db
    .prepare(
      `SELECT * FROM tasks WHERE type = 'recurring' AND is_active = 1
       AND (start_date IS NULL OR start_date <= ?)
       AND (end_date IS NULL OR end_date >= ?)`
    )
    .all(dateStr, dateStr)
    .filter((t: any) => {
      const days = JSON.parse(t.days_of_week || "[]");
      return days.includes(dayKey);
    });

  return [...oneTime, ...recurring].map((t: any) => ({
    ...t,
    is_active: Boolean(t.is_active),
    days_of_week: t.days_of_week ? JSON.parse(t.days_of_week) : null,
  }));
}

export function getCompletionsForDate(dateStr: string) {
  const db = getDb();
  return db
    .prepare(`SELECT task_id FROM task_completions WHERE completed_date = ?`)
    .all(dateStr) as { task_id: number }[];
}

export function toggleTaskCompletion(taskId: number, dateStr: string) {
  const db = getDb();
  const existing = db
    .prepare(
      `SELECT id FROM task_completions WHERE task_id = ? AND completed_date = ?`
    )
    .get(taskId, dateStr) as any;

  if (existing) {
    db.prepare(`DELETE FROM task_completions WHERE id = ?`).run(existing.id);
    return false;
  } else {
    db.prepare(
      `INSERT INTO task_completions (task_id, completed_date) VALUES (?, ?)`
    ).run(taskId, dateStr);
    return true;
  }
}

export function createTask(task: {
  description: string;
  type: "recurring" | "one-time" | "one_time";
  priority?: string;
  date?: string;
  time?: string;
  days_of_week?: string[];
  start_date?: string;
  end_date?: string;
}) {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO tasks (description, type, priority, date, time, days_of_week, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      task.description,
      task.type,
      task.priority || "normal",
      task.date || null,
      task.time || null,
      task.days_of_week ? JSON.stringify(task.days_of_week) : null,
      task.start_date || null,
      task.end_date || null
    );
  return result.lastInsertRowid;
}

export function updateTask(
  id: number,
  updates: Partial<{
    description: string;
    priority: string;
    date: string;
    time: string;
    days_of_week: string[];
    start_date: string;
    end_date: string;
    is_active: boolean;
  }>
) {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }
  if (updates.priority !== undefined) {
    fields.push("priority = ?");
    values.push(updates.priority);
  }
  if (updates.date !== undefined) {
    fields.push("date = ?");
    values.push(updates.date);
  }
  if (updates.time !== undefined) {
    fields.push("time = ?");
    values.push(updates.time);
  }
  if (updates.days_of_week !== undefined) {
    fields.push("days_of_week = ?");
    values.push(JSON.stringify(updates.days_of_week));
  }
  if (updates.start_date !== undefined) {
    fields.push("start_date = ?");
    values.push(updates.start_date);
  }
  if (updates.end_date !== undefined) {
    fields.push("end_date = ?");
    values.push(updates.end_date);
  }
  if (updates.is_active !== undefined) {
    fields.push("is_active = ?");
    values.push(updates.is_active ? 1 : 0);
  }

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  db.prepare(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`).run(
    ...values
  );
}

export function deleteTask(id: number) {
  const db = getDb();
  db.prepare(`DELETE FROM tasks WHERE id = ?`).run(id);
}

export function getAllRecurringTasks() {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM tasks WHERE type = 'recurring' ORDER BY is_active DESC, created_at DESC`)
    .all()
    .map((t: any) => ({
      ...t,
      is_active: Boolean(t.is_active),
      days_of_week: t.days_of_week ? JSON.parse(t.days_of_week) : null,
    }));
}

export function saveConversation(
  source: "whatsapp" | "web",
  role: "user" | "assistant",
  content: string
) {
  const db = getDb();
  db.prepare(
    `INSERT INTO conversations (source, role, content) VALUES (?, ?, ?)`
  ).run(source, role, content);
}

export function getRecentConversations(limit = 20) {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM conversations ORDER BY created_at DESC LIMIT ?`
    )
    .all(limit)
    .reverse();
}

export function cleanOldConversations(keepDays = 90): void {
  const db = getDb();
  db.prepare(`DELETE FROM conversations WHERE created_at < datetime('now', '-' || ? || ' days')`).run(keepDays);
}

export function getAppState(key: string): string | null {
  const db = getDb();
  const row = db.prepare(`SELECT value FROM app_state WHERE key = ?`).get(key) as any;
  return row?.value || null;
}

export function setAppState(key: string, value: string) {
  const db = getDb();
  db.prepare(
    `INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`
  ).run(key, value, value);
}
