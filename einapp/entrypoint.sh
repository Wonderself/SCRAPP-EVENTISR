#!/bin/sh
set -e

# Fix permissions on the data directory (volume mount may be owned by root)
DATA_DIR="/app/data"

# Create directories if they don't exist
mkdir -p "$DATA_DIR/memory/chat-summaries" "$DATA_DIR/memory/raw-conversations" "$DATA_DIR/backups"

# Fix ownership so nextjs user can read/write
chown -R nextjs:nodejs "$DATA_DIR" 2>/dev/null || true
chmod -R 755 "$DATA_DIR" 2>/dev/null || true

# Drop privileges and start the app
exec su -s /bin/sh nextjs -c "node server.js"
