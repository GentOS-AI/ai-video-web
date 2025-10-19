#!/bin/bash

# Enhanced API Testing Quick Start Script
# Usage: ./start_enhanced_test.sh

echo "🚀 Starting Enhanced API Testing Environment..."
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  Warning: OPENAI_API_KEY is not set${NC}"
    echo "Please set it with: export OPENAI_API_KEY='your-key-here'"
    echo ""
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Start backend
echo -e "${GREEN}📦 Starting Backend Server...${NC}"
if check_port 8000 ; then
    echo -e "${YELLOW}Port 8000 is already in use. Backend might be running.${NC}"
else
    cd backend
    # Create logs directory if it doesn't exist
    mkdir -p logs

    # Start backend in background and save PID
    echo "Starting backend on http://localhost:8000"
    python3.11 -m uvicorn app.main:app --reload --port 8000 --log-level info > logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"

    # Wait for backend to start
    echo "Waiting for backend to start..."
    sleep 5

    # Check if backend started successfully
    if curl -s http://localhost:8000/docs > /dev/null ; then
        echo -e "${GREEN}✅ Backend started successfully!${NC}"
        echo "   API Docs: http://localhost:8000/docs"
    else
        echo -e "${RED}❌ Backend failed to start. Check logs/backend.log${NC}"
    fi

    cd ..
fi

echo ""

# Start frontend
echo -e "${GREEN}🎨 Starting Frontend Server...${NC}"
if check_port 3000 ; then
    echo -e "${YELLOW}Port 3000 is already in use. Frontend might be running.${NC}"
else
    # Start frontend in background
    echo "Starting frontend on http://localhost:3000"
    npm run dev > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"

    # Wait for frontend to start
    echo "Waiting for frontend to start..."
    sleep 8

    echo -e "${GREEN}✅ Frontend should be starting...${NC}"
fi

echo ""
echo "============================================"
echo -e "${GREEN}🎉 Testing Environment Ready!${NC}"
echo ""
echo "📝 Quick Test Instructions:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Upload a product image (JPG/PNG, < 20MB)"
echo "3. Try these test scenarios:"
echo "   a) Leave fields empty → Standard API"
echo "   b) Add product description → Enhanced API"
echo "   c) Select Professional mode → Stronger enhancement"
echo "   d) Check 'Use enhanced processing' → Force enhanced"
echo ""
echo "🔍 Monitor logs:"
echo "   Backend:  tail -f backend/logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo "   Browser:  Open DevTools Console (F12)"
echo ""
echo "🛑 To stop servers:"
echo "   Kill backend:  kill $BACKEND_PID"
echo "   Kill frontend: kill $FRONTEND_PID"
echo "   Or use:        pkill -f uvicorn && pkill -f 'next dev'"
echo ""
echo "📊 Check API Documentation:"
echo "   http://localhost:8000/docs#/AI%20Enhanced%20Services"
echo ""
echo -e "${YELLOW}⚠️  Note: Make sure you have:${NC}"
echo "   - Python 3.11+ installed"
echo "   - Node.js 18+ installed"
echo "   - OPENAI_API_KEY environment variable set"
echo "   - All dependencies installed (pip install -r requirements.txt && npm install)"
echo ""
echo "Happy Testing! 🚀"