#!/bin/bash

# ============================================================================
# AI Video Web - Production Deployment Script
# ============================================================================
# This script handles complete deployment to production server
# Including: code pull, rebuild, PM2 restart, and verification
#
# Usage: ./deploy-production.sh
#
# ============================================================================

set -e  # Exit on any error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="/root/ai-video-web"
BACKEND_DIR="${PROJECT_ROOT}/backend"
FRONTEND_PORT=3000
BACKEND_PORT=8000

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo -e "${CYAN}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ============================================================================
# Pre-deployment Checks
# ============================================================================

print_header "Pre-Deployment Checks"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root"
    exit 1
fi

# Check if in correct directory
if [ ! -f "${PROJECT_ROOT}/package.json" ]; then
    print_error "Project directory not found: ${PROJECT_ROOT}"
    exit 1
fi

print_success "Running as root"
print_success "Project directory found"

# ============================================================================
# Step 1: Stop All PM2 Processes Completely
# ============================================================================

print_header "Step 1: Stopping All Services"

print_step "Stopping PM2 processes..."
cd ${PROJECT_ROOT}

# Stop and delete all PM2 processes
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Verify all PM2 processes are stopped
PM2_COUNT=$(pm2 list | grep -c "online" || true)
if [ "$PM2_COUNT" -gt 0 ]; then
    print_warning "Some PM2 processes still running, force stopping..."
    pm2 kill
fi

# Kill any remaining Next.js processes
print_step "Checking for orphaned Next.js processes..."
pkill -f "next-server" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true

# Kill any remaining uvicorn processes
print_step "Checking for orphaned backend processes..."
pkill -f "uvicorn.*app.main:app" 2>/dev/null || true

sleep 2

print_success "All services stopped"

# ============================================================================
# Step 2: Pull Latest Code
# ============================================================================

print_header "Step 2: Pulling Latest Code"

print_step "Fetching from remote repository..."
cd ${PROJECT_ROOT}
git fetch origin main

print_step "Checking current commit..."
CURRENT_COMMIT=$(git rev-parse HEAD)
LATEST_COMMIT=$(git rev-parse origin/main)

if [ "$CURRENT_COMMIT" = "$LATEST_COMMIT" ]; then
    print_warning "Already on latest commit: ${CURRENT_COMMIT:0:7}"
else
    print_step "Pulling changes..."
    git pull origin main
    NEW_COMMIT=$(git rev-parse HEAD)
    print_success "Updated to commit: ${NEW_COMMIT:0:7}"
fi

# ============================================================================
# Step 3: Rebuild Frontend (Critical!)
# ============================================================================

print_header "Step 3: Rebuilding Frontend"

print_step "Clearing Next.js cache..."
cd ${PROJECT_ROOT}
rm -rf .next

print_step "Running npm build..."
# Use production environment
export NODE_ENV=production
npm run build

# Verify build was successful
if [ ! -d ".next" ]; then
    print_error "Build failed - .next directory not created"
    exit 1
fi

print_success "Frontend rebuilt successfully"

# ============================================================================
# Step 4: Verify Backend Configuration
# ============================================================================

print_header "Step 4: Verifying Backend Configuration"

print_step "Checking backend .env file..."
cd ${BACKEND_DIR}

# Check if .env exists
if [ ! -f ".env" ]; then
    print_error "Backend .env file not found!"
    exit 1
fi

# Validate JSON arrays in .env (common issue)
print_step "Validating .env JSON format..."

# Check ALLOWED_ORIGINS
if grep -q 'ALLOWED_ORIGINS=\[' .env; then
    if ! grep -q 'ALLOWED_ORIGINS=\["' .env; then
        print_error "ALLOWED_ORIGINS has invalid JSON format (missing quotes)"
        print_warning "Fix: ALLOWED_ORIGINS=[\"url1\",\"url2\"]"
        exit 1
    fi
fi

# Check ALLOWED_IMAGE_TYPES
if grep -q 'ALLOWED_IMAGE_TYPES=\[' .env; then
    if ! grep -q 'ALLOWED_IMAGE_TYPES=\["' .env; then
        print_error "ALLOWED_IMAGE_TYPES has invalid JSON format (missing quotes)"
        print_warning "Fix: ALLOWED_IMAGE_TYPES=[\"type1\",\"type2\"]"
        exit 1
    fi
fi

# Check for extra fields that shouldn't be in backend .env
EXTRA_FIELDS=$(grep -E '^(AWS_|GROK_|XAI_|GEMINI_|ANTHROPIC_|CLAUDE_|grok_model|gemini_)' .env || true)
if [ -n "$EXTRA_FIELDS" ]; then
    print_warning "Found frontend-only config in backend .env:"
    echo "$EXTRA_FIELDS"
    print_warning "These may cause pydantic validation errors"
fi

print_success "Backend configuration validated"

# ============================================================================
# Step 5: Start Services with PM2
# ============================================================================

print_header "Step 5: Starting Services"

print_step "Starting PM2 services..."
cd ${PROJECT_ROOT}

# Start using ecosystem config
pm2 start ecosystem.config.js

# Wait for services to stabilize
print_step "Waiting for services to start..."
sleep 5

# Save PM2 process list
pm2 save

print_success "Services started"

# ============================================================================
# Step 6: Verify Deployment
# ============================================================================

print_header "Step 6: Verifying Deployment"

# Check PM2 status
print_step "Checking PM2 processes..."
pm2 status

# Count online processes
ONLINE_COUNT=$(pm2 jlist | jq '[.[] | select(.pm2_env.status == "online")] | length')

if [ "$ONLINE_COUNT" -lt 2 ]; then
    print_error "Not all services are online!"
    pm2 logs --err --lines 20
    exit 1
fi

print_success "All PM2 processes online"

# Check frontend
print_step "Testing frontend..."
sleep 3
FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${FRONTEND_PORT} || echo "000")

if [ "$FRONTEND_TEST" = "200" ] || [ "$FRONTEND_TEST" = "307" ]; then
    print_success "Frontend responding (HTTP $FRONTEND_TEST)"
else
    print_warning "Frontend response: HTTP $FRONTEND_TEST (may still be starting)"
fi

# Check backend
print_step "Testing backend..."
BACKEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${BACKEND_PORT}/docs || echo "000")

if [ "$BACKEND_TEST" = "200" ]; then
    print_success "Backend responding (HTTP $BACKEND_TEST)"
else
    print_error "Backend not responding (HTTP $BACKEND_TEST)"
    pm2 logs ai-video-api --err --lines 20
    exit 1
fi

# ============================================================================
# Deployment Summary
# ============================================================================

print_header "Deployment Complete"

FINAL_COMMIT=$(git rev-parse HEAD)
COMMIT_MSG=$(git log -1 --pretty=format:"%s")

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo -e "📦 Commit: ${CYAN}${FINAL_COMMIT:0:7}${NC}"
echo -e "📝 Message: ${COMMIT_MSG}"
echo ""
echo -e "${BLUE}Service Status:${NC}"
pm2 status
echo ""
echo -e "${BLUE}Quick Commands:${NC}"
echo -e "  View logs:    pm2 logs"
echo -e "  Restart all:  pm2 restart all"
echo -e "  Stop all:     pm2 stop all"
echo ""
echo -e "${GREEN}Website: https://video4ads.com${NC}"
echo ""

# ============================================================================
# Deployment Log
# ============================================================================

# Append to deployment log
LOG_FILE="${PROJECT_ROOT}/deployment.log"
echo "$(date '+%Y-%m-%d %H:%M:%S') - Deployed commit ${FINAL_COMMIT:0:7}: ${COMMIT_MSG}" >> ${LOG_FILE}

print_success "Deployment logged to deployment.log"
