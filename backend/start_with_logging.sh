#!/bin/bash
# Start backend with enhanced logging

cd "$(dirname "$0")"

echo "🚀 Starting backend with detailed logging..."

# Activate venv and start with access log enabled
source venv/bin/activate

uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --reload \
  --log-level info \
  --access-log \
  --use-colors 2>&1 | tee backend.log
