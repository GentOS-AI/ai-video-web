#!/bin/bash

##############################################################################
# AI Video Web - Frontend Deployment Script
#
# This script deploys ONLY the frontend (Next.js) application
# Usage: ./scripts/deploy-frontend.sh
#
# Prerequisites:
# - Node.js 20+ installed
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
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_DIR="$PROJECT_DIR/logs"
DEPLOY_LOG="$LOG_DIR/deploy-frontend.log"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_PATH="$BACKUP_DIR/frontend-backup-$TIMESTAMP"

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
echo -e "${CYAN}║      AI Video Web - Frontend Deployment                 ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

log "=========================================="
log "Starting frontend deployment at $TIMESTAMP"
log "=========================================="

# Step 1: Navigate to project directory
cd "$PROJECT_DIR"

# Step 2: Backup current version
log "Creating backup of current frontend..."
if [ -d ".next" ]; then
    mkdir -p "$BACKUP_PATH"
    cp -r .next "$BACKUP_PATH/" 2>/dev/null || true
    cp package.json package-lock.json "$BACKUP_PATH/" 2>/dev/null || true
    log "Backup created at: $BACKUP_PATH"
else
    log_warning "No .next directory found, skipping backup"
fi

# Step 3: Stop frontend PM2 service
log "Stopping frontend service..."
pm2 stop ai-video-web 2>/dev/null || log_warning "Frontend service not running"

# Step 4: Pull latest code
log "Pulling latest code from GitHub..."
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git fetch origin main
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git reset --hard origin/main

if [ $? -ne 0 ]; then
    log_error "Git pull failed!"
    exit 1
fi

COMMIT_ID=$(git rev-parse --short HEAD)
log "Code updated to commit: $COMMIT_ID"

# Step 5: Check .env.production
if [ ! -f ".env.production" ]; then
    log_error ".env.production not found!"
    log_error "Please create .env.production with required environment variables"
    exit 1
fi

# Step 6: Install dependencies
log "Installing frontend dependencies..."
npm ci --production=false

if [ $? -ne 0 ]; then
    log_error "npm install failed!"
    exit 1
fi

log "Dependencies installed successfully"

# Step 7: Build frontend
log "Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    log_error "Build failed!"

    # Rollback
    if [ -d "$BACKUP_PATH/.next" ]; then
        log "Rolling back to previous version..."
        rm -rf .next
        cp -r "$BACKUP_PATH/.next" .
        log "Rolled back successfully"
    fi

    # Restart old version
    pm2 start ecosystem.config.js --only ai-video-web

    log_error "Deployment failed! Previous version restored."
    exit 1
fi

log "Build completed successfully"

# Step 8: Start frontend service
log "Starting frontend service..."
pm2 start ecosystem.config.js --only ai-video-web

if [ $? -ne 0 ]; then
    log_error "Failed to start frontend service!"
    exit 1
fi

# Wait for service to start
sleep 3

# Step 9: Health check
log "Performing health check..."
pm2 status

# Check if frontend is accessible
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log "✅ Frontend is running and accessible"
else
    log_warning "Frontend may not be accessible on port 3000"
fi

# Step 10: Save PM2 configuration
pm2 save

# Cleanup old backups (keep last 5)
log "Cleaning up old backups..."
cd "$BACKUP_DIR"
ls -t | grep "frontend-backup-" | tail -n +6 | xargs -r rm -rf

log "=========================================="
log "✅ Frontend deployment completed successfully!"
log "=========================================="
log_info "Commit: $COMMIT_ID"
log_info "Timestamp: $TIMESTAMP"
log_info "URL: https://adsvideo.co"
log ""
log "View logs: pm2 logs ai-video-web"
log "Restart: pm2 restart ai-video-web"
log ""

exit 0
