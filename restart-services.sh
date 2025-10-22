#!/bin/bash

# AI Video Web - Service Restart Script
# This script restarts all services (Frontend, Backend, Celery, Redis)

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="/Users/lzx/lin/github/ai-video-web"
BACKEND_DIR="${PROJECT_ROOT}/backend"

# Ports configuration
FRONTEND_PORT=8080
BACKEND_PORT=8000
REDIS_PORT=6379

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}AI Video Web - Service Restart${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to kill process by port
kill_port() {
    local port=$1
    local process_name=$2
    print_info "Checking port ${port} for ${process_name}..."

    local pid=$(lsof -ti :${port} 2>/dev/null || true)
    if [ -n "$pid" ]; then
        print_warning "Found process on port ${port} (PID: ${pid}), killing..."
        kill -9 $pid 2>/dev/null || true
        sleep 1
        print_success "Process on port ${port} killed"
    else
        print_info "No process found on port ${port}"
    fi
}

# Function to kill process by name pattern
kill_process() {
    local pattern=$1
    local service_name=$2
    print_info "Checking for ${service_name} processes..."

    local pids=$(pgrep -f "$pattern" 2>/dev/null || true)
    if [ -n "$pids" ]; then
        print_warning "Found ${service_name} processes: ${pids}"
        pkill -9 -f "$pattern" 2>/dev/null || true
        sleep 1
        print_success "${service_name} processes killed"
    else
        print_info "No ${service_name} processes found"
    fi
}

# ============================================
# Step 1: Stop all existing services
# ============================================
echo ""
print_info "Step 1: Stopping all existing services..."
echo ""

# Stop Frontend (Next.js)
print_info "Stopping Frontend (Next.js)..."
kill_port ${FRONTEND_PORT} "Next.js"
kill_process "next dev" "Next.js"

# Stop Backend (Uvicorn)
print_info "Stopping Backend (Uvicorn)..."
kill_port ${BACKEND_PORT} "Uvicorn"
kill_process "uvicorn.*app.main:app" "Uvicorn"

# Stop Celery Worker
print_info "Stopping Celery Worker..."
kill_process "celery.*worker" "Celery Worker"

# Stop Redis (if needed)
print_info "Checking Redis..."
if ! pgrep -x redis-server > /dev/null; then
    print_warning "Redis is not running. Starting Redis..."
    redis-server --daemonize yes --port ${REDIS_PORT}
    sleep 2
    print_success "Redis started on port ${REDIS_PORT}"
else
    print_success "Redis is already running"
fi

echo ""
print_success "All services stopped successfully!"
echo ""

# ============================================
# Step 2: Start all services
# ============================================
echo ""
print_info "Step 2: Starting all services..."
echo ""

# Start Backend (Uvicorn)
print_info "Starting Backend API on port ${BACKEND_PORT}..."
cd ${BACKEND_DIR}
source venv/bin/activate
nohup python -m uvicorn app.main:app --host 0.0.0.0 --port ${BACKEND_PORT} --reload > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo ${BACKEND_PID} > /tmp/aivideo_backend.pid
sleep 3

# Check if backend started successfully
if curl -s http://localhost:${BACKEND_PORT}/health > /dev/null; then
    print_success "Backend API started successfully (PID: ${BACKEND_PID})"
else
    print_error "Backend API failed to start. Check logs/backend.log"
    exit 1
fi

# Start Celery Worker
print_info "Starting Celery Worker..."
cd ${BACKEND_DIR}
nohup celery -A app.core.celery_app worker --loglevel=info > logs/celery.log 2>&1 &
CELERY_PID=$!
echo ${CELERY_PID} > /tmp/aivideo_celery.pid
sleep 3
print_success "Celery Worker started successfully (PID: ${CELERY_PID})"

# Start Frontend (Next.js)
print_info "Starting Frontend on port ${FRONTEND_PORT}..."
cd ${PROJECT_ROOT}
nohup npm run dev -- -p ${FRONTEND_PORT} > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo ${FRONTEND_PID} > /tmp/aivideo_frontend.pid
sleep 5

# Check if frontend started successfully
if curl -s http://localhost:${FRONTEND_PORT} > /dev/null; then
    print_success "Frontend started successfully (PID: ${FRONTEND_PID})"
else
    print_warning "Frontend may still be starting. Check logs/frontend.log"
fi

echo ""
print_success "All services started successfully!"
echo ""

# ============================================
# Step 3: Display service status
# ============================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Service Status${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${GREEN}✅ Frontend (Next.js)${NC}"
echo -e "   URL:  http://localhost:${FRONTEND_PORT}"
echo -e "   PID:  ${FRONTEND_PID}"
echo -e "   Logs: ${PROJECT_ROOT}/logs/frontend.log"
echo ""

echo -e "${GREEN}✅ Backend (Uvicorn)${NC}"
echo -e "   URL:  http://localhost:${BACKEND_PORT}"
echo -e "   Docs: http://localhost:${BACKEND_PORT}/docs"
echo -e "   PID:  ${BACKEND_PID}"
echo -e "   Logs: ${BACKEND_DIR}/logs/backend.log"
echo ""

echo -e "${GREEN}✅ Celery Worker${NC}"
echo -e "   PID:  ${CELERY_PID}"
echo -e "   Logs: ${BACKEND_DIR}/logs/celery.log"
echo ""

echo -e "${GREEN}✅ Redis${NC}"
echo -e "   Port: ${REDIS_PORT}"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Quick Commands${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "View Backend Logs:  tail -f ${BACKEND_DIR}/logs/backend.log"
echo "View Celery Logs:   tail -f ${BACKEND_DIR}/logs/celery.log"
echo "View Frontend Logs: tail -f ${PROJECT_ROOT}/logs/frontend.log"
echo ""
echo "Stop All Services:  ./stop-services.sh"
echo ""
echo -e "${GREEN}All services are ready!${NC} 🎉"
echo ""
