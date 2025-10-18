#!/bin/bash

##############################################################################
# AI Video Web - Full Stack Deployment Script
#
# This script deploys BOTH frontend and backend applications
# Usage: ./scripts/deploy-full.sh
#
# Use this for:
# - Initial deployment
# - Major updates affecting both frontend and backend
# - Full system rebuild
##############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration
PROJECT_DIR="/root/ai-video-web"
LOG_DIR="$PROJECT_DIR/logs"
DEPLOY_LOG="$LOG_DIR/deploy-full.log"
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

log_section() {
    echo -e "${MAGENTA}[$(date +'%H:%M:%S')] $1${NC}" | tee -a "$DEPLOY_LOG"
}

# Create log directory
mkdir -p "$LOG_DIR"

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║      AI Video Web - Full Stack Deployment               ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

log "=========================================="
log "Starting full stack deployment at $TIMESTAMP"
log "=========================================="

# Step 1: Check prerequisites
log_section "Step 1/5: Checking prerequisites..."

if [ ! -d "$PROJECT_DIR" ]; then
    log_error "Project directory $PROJECT_DIR does not exist!"
    exit 1
fi

if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed!"
    exit 1
fi

if ! command -v python3.11 &> /dev/null; then
    log_error "Python 3.11+ is not installed!"
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    log_error "PM2 is not installed! Install: npm install -g pm2"
    exit 1
fi

log "✅ All prerequisites met"
log_info "Node: $(node --version)"
log_info "Python: $(python3.11 --version)"
log_info "PM2: $(pm2 --version)"
echo ""

# Step 2: Pull latest code
log_section "Step 2/5: Pulling latest code from GitHub..."

cd "$PROJECT_DIR"
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git fetch origin main
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git reset --hard origin/main

if [ $? -ne 0 ]; then
    log_error "Git pull failed!"
    exit 1
fi

COMMIT_ID=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B)
log "✅ Code updated to commit: $COMMIT_ID"
log_info "Commit message: $COMMIT_MSG"
echo ""

# Step 3: Deploy backend
log_section "Step 3/5: Deploying backend..."

if [ -f "$PROJECT_DIR/scripts/deploy-backend.sh" ]; then
    bash "$PROJECT_DIR/scripts/deploy-backend.sh"

    if [ $? -ne 0 ]; then
        log_error "Backend deployment failed!"
        exit 1
    fi

    log "✅ Backend deployed successfully"
else
    log_warning "Backend deployment script not found, skipping backend"
fi

echo ""

# Step 4: Deploy frontend
log_section "Step 4/5: Deploying frontend..."

if [ -f "$PROJECT_DIR/scripts/deploy-frontend.sh" ]; then
    bash "$PROJECT_DIR/scripts/deploy-frontend.sh"

    if [ $? -ne 0 ]; then
        log_error "Frontend deployment failed!"
        exit 1
    fi

    log "✅ Frontend deployed successfully"
else
    log_error "Frontend deployment script not found!"
    exit 1
fi

echo ""

# Step 5: Final health check
log_section "Step 5/5: Final health check..."

sleep 5

# Check PM2 status
log "PM2 Process Status:"
pm2 status

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log "✅ Frontend: Running (port 3000)"
else
    log_warning "⚠️  Frontend: May not be accessible"
fi

# Check backend
if curl -f http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    log "✅ Backend: Running (port 8000)"
else
    log_warning "⚠️  Backend: May not be accessible"
fi

# Check Nginx
if systemctl is-active --quiet nginx; then
    log "✅ Nginx: Running"
else
    log_warning "⚠️  Nginx: Not running"
fi

echo ""
log "=========================================="
log "✅ Full stack deployment completed!"
log "=========================================="
log_info "Commit: $COMMIT_ID"
log_info "Timestamp: $TIMESTAMP"
log_info "Frontend: https://adsvideo.co"
log_info "Backend API: https://adsvideo.co/api/v1"
log_info "API Docs: https://adsvideo.co/api/v1/docs"
echo ""
log "Useful commands:"
echo -e "  ${CYAN}pm2 logs${NC}                    # View all logs"
echo -e "  ${CYAN}pm2 monit${NC}                   # Monitor resources"
echo -e "  ${CYAN}pm2 restart all${NC}             # Restart all services"
echo -e "  ${CYAN}systemctl reload nginx${NC}      # Reload Nginx config"
echo ""

exit 0
