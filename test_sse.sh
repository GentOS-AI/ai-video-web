#!/bin/bash

echo "🚀 Starting SSE Feature Test Environment"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo -e "${YELLOW}Checking backend...${NC}"
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo "❌ Backend is NOT running"
    echo "   Please start backend:"
    echo "   cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000"
    exit 1
fi

# Check if frontend is running
echo -e "${YELLOW}Checking frontend...${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo "❌ Frontend is NOT running"
    echo "   Please start frontend:"
    echo "   npm run dev"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 All services are running!${NC}"
echo ""
echo "📖 Testing Steps:"
echo "  1. Open http://localhost:3000"
echo "  2. Login with Google"
echo "  3. Enter a video description (10+ chars)"
echo "  4. Select a trial image"
echo "  5. Click 'Generate' button"
echo ""
echo "✅ Expected: See real-time logs like:"
echo "   ● Connected"
echo "   [1] 🔍 Validating request parameters..."
echo "   [2] 📸 Processing reference image..."
echo "   [3] 🤖 Calling Sora 2 API..."
echo "   ..."
echo ""
echo "📚 Full testing guide: SSE_TESTING_GUIDE.md"
