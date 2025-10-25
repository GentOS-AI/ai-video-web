#!/bin/bash

# AIVideo.DIY Backend Start Script

echo "🚀 Starting AIVideo.DIY Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration!"
    echo ""
fi

# Note: Database initialization should be done manually using Alembic migrations
# Run: alembic upgrade head

# Start server
echo "✨ Starting FastAPI server..."
echo "📚 API Docs: http://localhost:8000/docs"
echo "🔗 API Base: http://localhost:8000/api/v1"
echo ""
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
