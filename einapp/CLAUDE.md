# Einapp — Project Memory

## What is Einapp?
Personal management app + WhatsApp bot for **Einat Amar**, manager of **Dolphin Village** resort in Shavei Tzion, Israel. Built by Emmanuel (dev).

## Architecture
- **Framework**: Next.js 16 (standalone build, Docker)
- **Database**: SQLite via better-sqlite3 at `/app/data/einapp.db`
- **Memory**: Markdown files at `/app/data/memory/`
- **AI**: Gemini (primary) → Groq llama-3.3-70b-versatile (fallback, free 14400 req/day)
- **WhatsApp**: Meta Cloud API v21.0
- **Voice**: Google Cloud STT/TTS
- **Deployment**: Coolify on VPS, Docker container
- **Persistent volume**: Coolify mounts `/opt/einapp-data` → `/app/data`

## Key Files

### Pages (src/app/)
- `page.tsx` — Login (password → session cookie, 7 days)
- `dashboard/page.tsx` — Main screen: greeting, action buttons, week view, streak
- `chat/page.tsx` — Chat with AI (text + voice), Suspense wrapper for searchParams
- `memory/page.tsx` — View/edit 9 memory files (hotel profile, suppliers, staff, etc.)
- `recurring/page.tsx` — View recurring tasks

### API Routes (src/app/api/)
- `auth/route.ts` — POST: password check → session cookie
- `chat/route.ts` — POST: send message to AI, extract tasks/done, save conversation
- `chat/history/route.ts` — GET: recent conversations
- `tasks/route.ts` — GET: week/today/recurring | POST: create/toggle/update/delete
- `memory/route.ts` — GET: list files or read file | POST: write file
- `cron/route.ts` — GET: trigger cron jobs (morning/reminders/evening/nightly/weekly/monthly)
- `whatsapp/webhook/route.ts` — GET: verify webhook | POST: incoming messages
- `whatsapp/test/route.ts` — GET/POST: send test message (requires CRON_SECRET)
- `whatsapp/diagnostic/route.ts` — GET: raw API diagnostic
- `weather/route.ts` — GET: weather data (Open-Meteo, no API key needed)
- `daily-tip/route.ts` — GET: daily management tip from AI
- `tts/route.ts` — POST: text-to-speech
- `tts/check/route.ts` — GET: check TTS config
- `backup/route.ts` — GET: status/download | POST: manual backup
- `health/route.ts` — GET: health check
- `debug-config/route.ts` — GET: show config (requires CRON_SECRET)

### Core Libraries (src/lib/)
- `ai-chat.ts` — AI chat engine with system prompt, task extraction, done detection
- `db.ts` — SQLite database (tasks, completions, conversations, app_state)
- `memory.ts` — Memory file management (9 markdown files + raw conversations + summaries)
- `memory-cron.ts` — Nightly extraction, weekly summary, monthly optimization
- `whatsapp.ts` — Send messages/voice notes, dev copy, media upload/download
- `scheduler.ts` — Morning/evening/reminder WhatsApp messages
- `internal-cron.ts` — node-cron scheduler (8 jobs), runs via instrumentation.ts
- `hebrew.ts` — Hebrew dates, day names, holidays, Shabbat detection
- `google-tts.ts` / `google-stt.ts` — Google Cloud voice services

### Components (src/components/)
- `WeekView.tsx` — Today (big) + other days (compact scroll), streak tracking, offline cache
- `DayColumn.tsx` — Single day card (compact or full)
- `TaskCard.tsx` — Task with checkbox, edit/delete, time display, urgent badge
- `AddTaskModal.tsx` — Create task (one-time or recurring, date, time, priority, days)
- `BottomTabs.tsx` — 3 tabs: Home, Chat, Memory
- `ChatBubble.tsx` — Chat message bubble with speak button
- `WeatherWidget.tsx` — Weather display (exists but removed from dashboard)

## AI System Prompt
Located in `src/lib/ai-chat.ts` lines 6-79 (SYSTEM_PROMPT constant).

Key behaviors:
- Personality: warm, enthusiastic Hebrew friend ("נשמהההה", "מאאאמי", "מלכה")
- Knows everything about Dolphin Village from memory files
- Creates tasks via `[TASK|desc|date|time|priority|type|days]` tag
- Marks tasks done via `[DONE|desc]` tag
- Asks follow-up questions when info is missing
- Handles relative time ("בעוד שעה" → calculates exact time)
- Current time injected in context for time calculations
- Short on WhatsApp, longer in app

Task format: `[TASK|description|YYYY-MM-DD/today/tomorrow|HH:MM/none|urgent/normal|one_time/recurring|monday,thursday/none]`

## WhatsApp Quick Commands
- "היום" — today's tasks
- "מחר" — tomorrow's tasks
- "שבוע" — week overview
- "בוצע" / "בוצע 1" — mark task done
- "זיכרון" — what I remember
- "עזרה" — show commands

## Cron Jobs (internal-cron.ts)
All times in Asia/Jerusalem:
1. Morning message: 7:00 daily
2. Task reminders: every 15min 7:00-22:00
3. Evening summary: 16:30 daily
4. Missing tasks check: 12:00 daily
5. Nightly memory extraction: 2:00 daily
6. Weekly summary: Sunday 22:00
7. Monthly optimization: 1st of month 3:00
8. Database backup: 1:00 daily + on startup

## Memory System
9 files in `/app/data/memory/`:
- `hotel-profile.md` — Full Dolphin Village profile
- `suppliers.md` — Vendors & contacts
- `staff.md` — Team members
- `regular-guests.md` — Repeat guests
- `procedures.md` — Operational procedures
- `issues-log.md` — Problem log
- `financial-notes.md` — Financial notes
- `ideas.md` — Improvement ideas
- `einat-personal.md` — Personal notes about Einat

Auto-populated by nightly AI extraction from daily conversations.

## Database Schema (db.ts)
```sql
tasks: id, description, type(one_time/recurring), priority(normal/urgent), date, time, days_of_week, start_date, end_date, created_at
completions: id, task_id, date, completed_at
conversations: id, source(web/whatsapp), role(user/assistant), content, created_at
app_state: key, value (sessions, settings, timestamps)
```

## Environment Variables
- `GEMINI_API_KEY` — Google AI Studio (primary AI)
- `GROQ_API_KEY` — Groq (fallback AI, free tier)
- `GOOGLE_CLOUD_API_KEY` — TTS/STT
- `WHATSAPP_ACCESS_TOKEN` — Meta Cloud API token
- `WHATSAPP_PHONE_NUMBER_ID` — `1025296567336395`
- `WHATSAPP_VERIFY_TOKEN` — webhook verification
- `WHATSAPP_APP_SECRET` — signature verification
- `EINAT_PHONE_NUMBER` — `972546207047`
- `DEV_PHONE_NUMBER` — `972559687063`
- `CRON_SECRET` — `einapp2026`
- `APP_PASSWORD` — login password

## Auth Flow
1. User enters password on login page
2. POST `/api/auth` → validates against APP_PASSWORD
3. Sets `einapp_session` cookie (httpOnly, 7 days)
4. Middleware checks cookie exists (≥32 chars) for all non-public paths
5. Public paths bypass auth: `/`, `/api/auth`, `/api/cron`, `/api/health`, `/api/whatsapp/webhook`, `/api/whatsapp/test`, `/api/whatsapp/diagnostic`, `/api/debug-config`, `/api/tts/check`, `/api/daily-tip`, `/api/backup`

## Phone Number Matching
WhatsApp webhook uses:
1. Exact match after stripping non-digits
2. Suffix match (last 10 digits) as fallback for country code differences

## Backup Strategy
- SQLite backed up daily at 1:00 AM + on server start
- 7 days retention
- `/api/backup` endpoint for manual download
- Persistent volume `/opt/einapp-data` → `/app/data`

## Important Patterns
- All pages use `h-[100dvh]` for mobile viewport
- Safe area insets: `pt-[env(safe-area-inset-top,8px)]`, `pb-[env(safe-area-inset-bottom,0px)]`
- Day/sunset theme: `getTimeMode()` switches at 16:30 (990 min) and 5:00 (300 min)
- RTL: `<html lang="he" dir="rtl">`
- Font: Heebo (Hebrew) + Inter (English)
- Offline cache: tasks cached in localStorage (1h TTL)
- Streak: consecutive days with completed tasks, persisted in localStorage

## Known Limitations
- WhatsApp token: temporary (24h) from Meta API Setup → need permanent token via System User
- Gemini: often blocked by quota (429) → falls back to Groq
- Voice: requires GOOGLE_CLOUD_API_KEY with Speech-to-Text and Text-to-Speech APIs enabled
- Memory files: max 50KB each (configurable via MEMORY_MAX_FILE_SIZE_KB)
