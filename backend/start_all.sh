#!/bin/bash

# Phase 2 - 快速启动脚本
# 启动 Redis + Celery + FastAPI

echo "🚀 Starting Phase 2: SSE Real-time Video Generation"
echo "======================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Redis is running
echo -e "${YELLOW}1. Checking Redis...${NC}"
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is running${NC}"
else
    echo -e "${RED}❌ Redis is not running${NC}"
    echo "   Please start Redis:"
    echo "   - macOS: brew services start redis"
    echo "   - Linux: sudo systemctl start redis"
    echo "   - Docker: docker run -d -p 6379:6379 redis:7-alpine"
    exit 1
fi

# Check virtual environment
echo -e "${YELLOW}2. Checking virtual environment...${NC}"
if [ -d "venv" ]; then
    echo -e "${GREEN}✅ Virtual environment found${NC}"
    source venv/bin/activate
else
    echo -e "${RED}❌ Virtual environment not found${NC}"
    echo "   Please create: python -m venv venv"
    exit 1
fi

# Check dependencies
echo -e "${YELLOW}3. Checking dependencies...${NC}"
if python -c "import celery, redis, openai" 2>/dev/null; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Installing dependencies...${NC}"
    pip install -r requirements.txt
fi

echo ""
echo -e "${GREEN}======================================================"
echo "   Phase 2 Services Ready!"
echo "======================================================${NC}"
echo ""
echo "📝 Next steps:"
echo ""
echo "   Terminal 1 (Celery Worker):"
echo "   $ cd backend"
echo "   $ source venv/bin/activate"
echo "   $ celery -A app.core.celery_app worker --loglevel=info --concurrency=2"
echo ""
echo "   Terminal 2 (FastAPI):"
echo "   $ cd backend"
echo "   $ source venv/bin/activate"
echo "   $ uvicorn app.main:app --reload --port 8000"
echo ""
echo "   Terminal 3 (Frontend):"
echo "   $ npm run dev"
echo ""
echo "🧪 Test at: http://localhost:3000"
echo ""
echo "📖 Full documentation: PHASE2_IMPLEMENTATION_SUMMARY.md"
echo ""
