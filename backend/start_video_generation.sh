#!/bin/bash

# 🎬 Sora 2 Video Generation - Quick Start Script
# This script starts all required services for video generation

echo "======================================"
echo "🚀 Starting Sora 2 Video Generation"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Redis
echo -n "Checking Redis..."
if redis-cli ping > /dev/null 2>&1; then
    echo -e " ${GREEN}✓${NC} Redis is running"
else
    echo -e " ${RED}✗${NC} Redis is NOT running"
    echo -e "${YELLOW}Please start Redis:${NC}"
    echo "  brew services start redis  # macOS"
    echo "  sudo service redis-server start  # Linux"
    exit 1
fi

# Check Python dependencies
echo -n "Checking Python dependencies..."
if python -c "import openai, celery, redis" > /dev/null 2>&1; then
    echo -e " ${GREEN}✓${NC} Dependencies installed"
else
    echo -e " ${YELLOW}!${NC} Installing dependencies..."
    pip install -r requirements.txt
fi

# Check environment variables
echo -n "Checking environment variables..."
if [ -f ".env" ] && grep -q "OPENAI_API_KEY" .env; then
    echo -e " ${GREEN}✓${NC} .env file found"
else
    echo -e " ${RED}✗${NC} .env file missing or incomplete"
    echo -e "${YELLOW}Please create .env with:${NC}"
    echo "  OPENAI_API_KEY=your-key-here"
    echo "  REDIS_URL=redis://localhost:6379/0"
    exit 1
fi

# Create uploads directory
mkdir -p uploads/videos
echo -e "${GREEN}✓${NC} Created uploads directory"

echo ""
echo "======================================"
echo "📋 Starting Services"
echo "======================================"
echo ""

echo "1. Starting Celery Worker..."
echo -e "${YELLOW}Run this in a separate terminal:${NC}"
echo "  cd backend && celery -A app.core.celery_app worker --loglevel=info"
echo ""

echo "2. Starting FastAPI..."
echo -e "${YELLOW}Run this in another terminal:${NC}"
echo "  cd backend && uvicorn app.main:app --reload --port 8000"
echo ""

echo "3. Starting Next.js frontend..."
echo -e "${YELLOW}Run this in another terminal:${NC}"
echo "  npm run dev"
echo ""

echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "Visit: http://localhost:3000"
echo ""
echo "Next steps:"
echo "  1. Login with Google"
echo "  2. Select an image"
echo "  3. Enter a video description"
echo "  4. Click 'Generate'"
echo ""
echo "Happy video generating! 🎥"
