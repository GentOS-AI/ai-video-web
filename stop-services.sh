#!/bin/bash

# AI Video Web - Service Stop Script
# This script stops all services (Frontend, Backend, Celery)

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ports configuration
FRONTEND_PORT=8080
BACKEND_PORT=8000

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}AI Video Web - Stop All Services${NC}"
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

# Function to kill process by port
kill_port() {
    local port=$1
    local service_name=$2
    print_info "Stopping ${service_name} on port ${port}..."

    local pid=$(lsof -ti :${port} 2>/dev/null || true)
    if [ -n "$pid" ]; then
        kill -9 $pid 2>/dev/null || true
        sleep 1
        print_success "${service_name} stopped (was PID: ${pid})"
    else
        print_info "No ${service_name} process found on port ${port}"
    fi
}

# Function to kill process by name pattern
kill_process() {
    local pattern=$1
    local service_name=$2
    print_info "Stopping ${service_name}..."

    local pids=$(pgrep -f "$pattern" 2>/dev/null || true)
    if [ -n "$pids" ]; then
        pkill -9 -f "$pattern" 2>/dev/null || true
        sleep 1
        print_success "${service_name} stopped (PIDs: ${pids})"
    else
        print_info "No ${service_name} processes found"
    fi
}

# Stop Frontend (Next.js)
kill_port ${FRONTEND_PORT} "Frontend (Next.js)"
kill_process "next dev" "Next.js processes"

# Stop Backend (Uvicorn)
kill_port ${BACKEND_PORT} "Backend (Uvicorn)"
kill_process "uvicorn.*app.main:app" "Uvicorn processes"

# Stop Celery Worker
kill_process "celery.*worker" "Celery Worker"

# Remove PID files
rm -f /tmp/aivideo_*.pid

echo ""
print_success "All services stopped successfully!"
echo ""
