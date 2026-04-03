#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

PORT="${PORT:-3000}"

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

# Start server
echo "▸ Starting server on port $PORT..."
exec node server.js
