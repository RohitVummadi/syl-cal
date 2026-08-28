#!/usr/bin/env bash

# Start the Syl-Cal Flask API and Vite frontend together for local development.
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_BIN="$PROJECT_DIR/.venv/bin/python"

if [[ ! -x "$PYTHON_BIN" ]]; then
  echo "Missing supported Python environment: $PYTHON_BIN"
  echo "Create it with: python3 -m venv .venv && .venv/bin/pip install -r backend/requirements.txt"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to start the frontend. Install Node.js, then run npm install in webpage/."
  exit 1
fi

if [[ ! -d "$PROJECT_DIR/webpage/node_modules" ]]; then
  echo "Frontend dependencies are missing. Run: cd webpage && npm install"
  exit 1
fi

cleanup() {
  echo
  echo "Stopping Syl-Cal development servers..."
  kill "$backend_pid" "$frontend_pid" 2>/dev/null || true
  wait "$backend_pid" "$frontend_pid" 2>/dev/null || true
}

echo "Starting Syl-Cal backend at http://127.0.0.1:5000"
"$PYTHON_BIN" "$PROJECT_DIR/backend/app.py" &
backend_pid=$!

echo "Starting Syl-Cal frontend at http://127.0.0.1:5173"
(
  cd "$PROJECT_DIR/webpage"
  npm run dev -- --host 127.0.0.1 --port 5173
) &
frontend_pid=$!

trap cleanup EXIT INT TERM
echo "Both servers are running. Press Ctrl+C to stop them."
wait "$backend_pid" "$frontend_pid"
