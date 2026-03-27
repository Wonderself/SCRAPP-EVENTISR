import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "einapp.db");
const MEMORY_DIR = process.env.MEMORY_DIR || path.join(DATA_DIR, "memory");

// GET /api/backup?secret=xxx — download full database as file
// GET /api/backup?secret=xxx&type=status — show backup status
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const type = url.searchParams.get("type");

  if (type === "status") {
    // Show data status
    const dbExists = fs.existsSync(DB_PATH);
    const dbSize = dbExists ? fs.statSync(DB_PATH).size : 0;
    const memoryExists = fs.existsSync(MEMORY_DIR);

    let memoryFiles: string[] = [];
    let totalMemorySize = 0;
    if (memoryExists) {
      memoryFiles = listFilesRecursive(MEMORY_DIR);
      totalMemorySize = memoryFiles.reduce((sum, f) => {
        try { return sum + fs.statSync(f).size; } catch { return sum; }
      }, 0);
    }

    // Check for backups
    const backupDir = path.join(DATA_DIR, "backups");
    const backups = fs.existsSync(backupDir)
      ? fs.readdirSync(backupDir).filter(f => f.endsWith(".db")).sort().reverse().slice(0, 5)
      : [];

    return NextResponse.json({
      database: {
        exists: dbExists,
        size_kb: Math.round(dbSize / 1024),
        path: DB_PATH,
      },
      memory: {
        exists: memoryExists,
        files_count: memoryFiles.length,
        total_size_kb: Math.round(totalMemorySize / 1024),
      },
      recent_backups: backups,
      data_dir: DATA_DIR,
      volume_warning: "Ensure /app/data is mounted as a persistent volume in Coolify!",
    });
  }

  // Download database file
  if (!fs.existsSync(DB_PATH)) {
    return NextResponse.json({ error: "database not found" }, { status: 404 });
  }

  const dbBuffer = fs.readFileSync(DB_PATH);
  const date = new Date().toISOString().split("T")[0];

  return new NextResponse(dbBuffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="einapp-backup-${date}.db"`,
      "Content-Length": dbBuffer.length.toString(),
    },
  });
}

// POST /api/backup?secret=xxx — create manual backup
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = createBackup();
  return NextResponse.json(result);
}

export function createBackup(): { ok: boolean; backup_path?: string; error?: string } {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { ok: false, error: "database not found" };
    }

    const backupDir = path.join(DATA_DIR, "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const date = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const backupPath = path.join(backupDir, `einapp-${date}.db`);

    fs.copyFileSync(DB_PATH, backupPath);
    console.log(`[Backup] Created: ${backupPath}`);

    // Keep only last 7 backups
    const backups = fs.readdirSync(backupDir)
      .filter(f => f.endsWith(".db"))
      .sort()
      .reverse();

    for (const old of backups.slice(7)) {
      fs.unlinkSync(path.join(backupDir, old));
      console.log(`[Backup] Cleaned old: ${old}`);
    }

    return { ok: true, backup_path: backupPath };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

function listFilesRecursive(dir: string): string[] {
  const files: string[] = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...listFilesRecursive(fullPath));
      } else {
        files.push(fullPath);
      }
    }
  } catch {}
  return files;
}
