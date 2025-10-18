#!/bin/bash

##############################################################################
# AI Video Web - Server-Side Deployment Script
#
# This script runs on the REMOTE SERVER to deploy the application
# Usage: ./scripts/server-deploy.sh
#
# Prerequisites:
# - Node.js 20+ installed
# - PM2 installed globally (npm i -g pm2)
# - Git SSH key configured for GitHub access
# - Project cloned to /root/ai-video-web/
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/root/ai-video-web"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_DIR="$PROJECT_DIR/logs"
DEPLOY_LOG="$LOG_DIR/deploy.log"
GIT_SSH_KEY="$HOME/.ssh/id_ed25519"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_PATH="$BACKUP_DIR/backup-$TIMESTAMP"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$DEPLOY_LOG"
}

# Create necessary directories
mkdir -p "$BACKUP_DIR" "$LOG_DIR"

log "=========================================="
log "Starting deployment at $TIMESTAMP"
log "=========================================="

# Step 1: Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    log_error "Project directory $PROJECT_DIR does not exist!"
    log_error "Please clone the repository first:"
    log_error "GIT_SSH_COMMAND=\"ssh -i $GIT_SSH_KEY\" git clone git@github.com:GentOS-AI/ai-video-web.git $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# Step 2: Check Git SSH key
if [ ! -f "$GIT_SSH_KEY" ]; then
    log_error "SSH key not found at $GIT_SSH_KEY"
    log_error "Please configure your SSH key for GitHub access"
    exit 1
fi

log_info "Using SSH key: $GIT_SSH_KEY"

# Step 3: Backup current version (before stopping services)
log "Creating backup of current version..."
if [ -d ".next" ]; then
    mkdir -p "$BACKUP_PATH"
    cp -r .next "$BACKUP_PATH/" 2>/dev/null || true
    cp -r node_modules "$BACKUP_PATH/" 2>/dev/null || true
    cp package.json package-lock.json "$BACKUP_PATH/" 2>/dev/null || true
    log "Backup created at: $BACKUP_PATH"
else
    log_warning "No .next directory found, skipping backup"
fi

# Step 4: Stop PM2 services
log "Stopping PM2 services..."
if command -v pm2 &> /dev/null; then
    pm2 stop ecosystem.config.js 2>/dev/null || log_warning "No PM2 processes to stop"
    pm2 delete all 2>/dev/null || log_warning "No PM2 processes to delete"
    log "PM2 services stopped"
else
    log_error "PM2 is not installed! Please install: npm install -g pm2"
    exit 1
fi

# Step 5: Fetch latest code from GitHub
log "Fetching latest code from GitHub..."
GIT_SSH_COMMAND="ssh -i $GIT_SSH_KEY" git fetch origin main
if [ $? -ne 0 ]; then
    log_error "Git fetch failed! Check SSH key and network connection"
    exit 1
fi

# Check if there are updates
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    log_info "Code is already up to date (commit: ${LOCAL:0:7})"
else
    log "Pulling latest changes..."
    log_info "Current commit: ${LOCAL:0:7}"
    log_info "Remote commit:  ${REMOTE:0:7}"

    GIT_SSH_COMMAND="ssh -i $GIT_SSH_KEY" git reset --hard origin/main
    if [ $? -ne 0 ]; then
        log_error "Git pull failed!"
        exit 1
    fi
    log "Code updated successfully to commit: ${REMOTE:0:7}"
fi

# Step 6: Install dependencies
log "Installing dependencies..."
if [ -f "package-lock.json" ]; then
    npm ci --production=false
else
    npm install
fi

if [ $? -ne 0 ]; then
    log_error "npm install failed!"
    log "Rolling back to backup..."
    if [ -d "$BACKUP_PATH/node_modules" ]; then
        rm -rf node_modules
        cp -r "$BACKUP_PATH/node_modules" .
        log "node_modules restored from backup"
    fi
    exit 1
fi

log "Dependencies installed successfully"

# Step 7: Build the application
log "Building application..."
npm run build

if [ $? -ne 0 ]; then
    log_error "Build failed!"
    log "Rolling back to backup..."

    if [ -d "$BACKUP_PATH/.next" ]; then
        rm -rf .next
        cp -r "$BACKUP_PATH/.next" .
        cp -r "$BACKUP_PATH/node_modules" .
        log "Build artifacts restored from backup"
    fi

    # Restart old version
    log "Restarting previous version with PM2..."
    pm2 start ecosystem.config.js
    log_error "Deployment failed! Previous version has been restored and restarted."
    exit 1
fi

log "Build completed successfully"

# Step 8: Start PM2 services
log "Starting PM2 services..."
pm2 start ecosystem.config.js

if [ $? -ne 0 ]; then
    log_error "Failed to start PM2 services!"
    exit 1
fi

# Wait for services to start
sleep 3

# Step 9: Health check
log "Performing health check..."
pm2 status

# Check if frontend is running
FRONTEND_STATUS=$(pm2 jlist | grep -o '"name":"ai-video-web"' | wc -l)
if [ "$FRONTEND_STATUS" -gt 0 ]; then
    log "Frontend service is running"
else
    log_warning "Frontend service may not be running properly"
fi

# Step 10: Save PM2 configuration
pm2 save

# Step 11: Cleanup old backups (keep last 5)
log "Cleaning up old backups..."
cd "$BACKUP_DIR"
ls -t | tail -n +6 | xargs -r rm -rf
log "Old backups cleaned up (kept last 5)"

# Step 12: Display deployment summary
log "=========================================="
log "Deployment completed successfully!"
log "=========================================="
log_info "Timestamp: $TIMESTAMP"
log_info "Commit: ${REMOTE:0:7}"
log_info "Build directory: $PROJECT_DIR/.next"
log_info "Backup location: $BACKUP_PATH"
log_info "Logs directory: $LOG_DIR"
log ""
log "PM2 Status:"
pm2 status

log ""
log "To view logs:"
log "  - Deployment: tail -f $DEPLOY_LOG"
log "  - Frontend:   pm2 logs ai-video-web"
log "  - All:        pm2 logs"
log ""
log "To restart services:"
log "  - Frontend:   pm2 restart ai-video-web"
log "  - All:        pm2 restart all"
log ""
log "=========================================="

exit 0
