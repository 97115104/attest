#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

# Load .env if it exists
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

PORT="${PORT:-3000}"

# Persistent database (survives redeploys)
export DB_PATH="${DB_PATH:-$HOME/.local/share/attest/attest.db}"
mkdir -p "$(dirname "$DB_PATH")"

echo "──────────────────────────────────────"
echo "  attest — AI Content Attestation"
echo "──────────────────────────────────────"

# Kill any existing process on the port
EXISTING_PID=$(lsof -t -i:"$PORT" 2>/dev/null || true)
if [ -n "$EXISTING_PID" ]; then
  echo "▸ Port $PORT in use (pid $EXISTING_PID), killing..."
  kill "$EXISTING_PID" 2>/dev/null || true
  sleep 1
fi

# Install deps if needed
if [ ! -d "node_modules" ]; then
  echo "▸ Installing dependencies..."
  npm install
fi

# Start server with file watching (auto-restart on changes)
echo "▸ Starting server on port $PORT (watching for changes)..."
exec npx --yes nodemon --watch server.js --watch db.js --watch scripts/ --watch styles/ --watch '*.html' --watch '**/*.html' --ext js,html,css,json server.js
