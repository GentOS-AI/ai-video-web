#!/bin/bash

##############################################################################
# AI Video Web - Backend Deployment Script
#
# This script deploys ONLY the backend (FastAPI) application
# Usage: ./scripts/deploy-backend.sh
#
# Prerequisites:
# - Python 3.11+ installed
# - PM2 installed globally
# - Project cloned to /root/ai-video-web/
##############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PROJECT_DIR="/root/ai-video-web"
BACKEND_DIR="$PROJECT_DIR/backend"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_DIR="$PROJECT_DIR/logs"
DEPLOY_LOG="$LOG_DIR/deploy-backend.log"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING:${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] INFO:${NC} $1" | tee -a "$DEPLOY_LOG"
}

# Create directories
mkdir -p "$BACKUP_DIR" "$LOG_DIR"

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║      AI Video Web - Backend Deployment                  ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

log "=========================================="
log "Starting backend deployment at $TIMESTAMP"
log "=========================================="

# Step 1: Check Python version
log "Checking Python version..."
if ! command -v python3.11 &> /dev/null; then
    log_error "Python 3.11+ is required but not found!"
    log_error "Install: sudo apt install python3.11 python3.11-venv python3-pip"
    exit 1
fi

PYTHON_VERSION=$(python3.11 --version)
log_info "$PYTHON_VERSION"

# Step 2: Navigate to backend directory
cd "$BACKEND_DIR"

# Step 3: Stop backend PM2 service
log "Stopping backend service..."
pm2 stop ai-video-api 2>/dev/null || log_warning "Backend service not running"

# Step 4: Pull latest code
log "Pulling latest code from GitHub..."
cd "$PROJECT_DIR"
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git fetch origin main
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git reset --hard origin/main

if [ $? -ne 0 ]; then
    log_error "Git pull failed!"
    exit 1
fi

COMMIT_ID=$(git rev-parse --short HEAD)
log "Code updated to commit: $COMMIT_ID"

cd "$BACKEND_DIR"

# Step 5: Create or update Python virtual environment
log "Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    log "Creating new virtual environment..."
    python3.11 -m venv venv
    log "Virtual environment created"
else
    log_info "Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate

# Step 6: Upgrade pip
log "Upgrading pip..."
pip install --upgrade pip --quiet

# Step 7: Install dependencies
log "Installing backend dependencies..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    log_error "pip install failed!"
    deactivate
    exit 1
fi

log "Dependencies installed successfully"

# Step 8: Check .env configuration
if [ ! -f ".env" ]; then
    log_warning ".env not found in backend directory"

    if [ -f ".env.production.template" ]; then
        log "Creating .env from template..."
        cp .env.production.template .env
        log_warning "⚠️  IMPORTANT: Edit backend/.env with your actual configuration!"
        log_warning "Required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET_KEY, API keys"
    else
        log_error "No .env or .env.production.template found!"
        deactivate
        exit 1
    fi
fi

# Step 9: Create necessary directories
log "Creating upload directories..."
mkdir -p uploads/videos uploads/images
log "Upload directories created"

# Step 10: Initialize database (if needed)
if [ ! -f "aivideo.db" ]; then
    log "Initializing database..."
    if [ -f "init_db.py" ]; then
        python init_db.py
        log "Database initialized"
    else
        log_warning "init_db.py not found, skipping database initialization"
    fi
else
    log_info "Database already exists"
fi

# Step 11: Deactivate venv (PM2 will use venv/bin/uvicorn directly)
deactivate

# Step 12: Start backend service
log "Starting backend service..."
cd "$PROJECT_DIR"
pm2 start ecosystem.config.js --only ai-video-api

if [ $? -ne 0 ]; then
    log_error "Failed to start backend service!"
    exit 1
fi

# Wait for service to start
sleep 3

# Step 13: Health check
log "Performing health check..."
pm2 status

# Check if backend API is accessible
if curl -f http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    log "✅ Backend API is running and accessible"
else
    log_warning "Backend API may not be accessible on port 8000"
    log_info "Check logs: pm2 logs ai-video-api"
fi

# Step 14: Save PM2 configuration
pm2 save

log "=========================================="
log "✅ Backend deployment completed successfully!"
log "=========================================="
log_info "Commit: $COMMIT_ID"
log_info "Timestamp: $TIMESTAMP"
log_info "API URL: https://adsvideo.co/api/v1"
log ""
log "View logs: pm2 logs ai-video-api"
log "Restart: pm2 restart ai-video-api"
log "API docs: https://adsvideo.co/api/v1/docs"
log ""

exit 0
