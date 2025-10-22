# Service Management Guide

This guide explains how to manage all services (Frontend, Backend, Celery Worker, Redis) for the AI Video Web application.

## Quick Start

### Start All Services (One Command)
```bash
./restart-services.sh
```

This script will:
1. ✅ Stop all existing services (clean shutdown)
2. ✅ Start Backend API on port 8000
3. ✅ Start Celery Worker
4. ✅ Start Frontend on port 8080
5. ✅ Check Redis status (auto-start if needed)
6. ✅ Display service status and URLs

### Stop All Services
```bash
./stop-services.sh
```

This will gracefully stop all running services.

---

## Service Details

### 1. Frontend (Next.js)
- **Port**: 8080
- **URL**: http://localhost:8080
- **Logs**: `logs/frontend.log`
- **PID File**: `/tmp/aivideo_frontend.pid`

### 2. Backend API (FastAPI + Uvicorn)
- **Port**: 8000
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Logs**: `backend/logs/backend.log`
- **PID File**: `/tmp/aivideo_backend.pid`

### 3. Celery Worker
- **Tasks**: Video generation, Image enhancement
- **Logs**: `backend/logs/celery.log`
- **PID File**: `/tmp/aivideo_celery.pid`

### 4. Redis
- **Port**: 6379
- **Purpose**: Celery message broker + SSE pub/sub

---

## Manual Service Management

### Start Services Individually

#### Frontend
```bash
npm run dev -- -p 8080
```

#### Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Celery Worker
```bash
cd backend
source venv/bin/activate
celery -A app.core.celery_app worker --loglevel=info
```

#### Redis
```bash
redis-server --daemonize yes --port 6379
```

### Stop Services Individually

#### Frontend
```bash
lsof -ti :8080 | xargs kill -9
# OR
pkill -f "next dev"
```

#### Backend
```bash
lsof -ti :8000 | xargs kill -9
# OR
pkill -f "uvicorn.*app.main:app"
```

#### Celery Worker
```bash
pkill -f "celery.*worker"
```

#### Redis
```bash
redis-cli shutdown
```

---

## Monitoring & Debugging

### View Real-Time Logs

#### Backend Logs
```bash
tail -f backend/logs/backend.log
```

#### Celery Logs
```bash
tail -f backend/logs/celery.log
```

#### Frontend Logs
```bash
tail -f logs/frontend.log
```

### Check Service Status

#### Check All Ports
```bash
lsof -i :8080  # Frontend
lsof -i :8000  # Backend
lsof -i :6379  # Redis
```

#### Check Process Status
```bash
ps aux | grep -E "(next dev|uvicorn|celery|redis-server)"
```

#### Check Backend Health
```bash
curl http://localhost:8000/health
```

#### Check Redis Connection
```bash
redis-cli ping
# Expected: PONG
```

---

## Troubleshooting

### Issue: Port Already in Use

**Problem**: Error message "Address already in use"

**Solution**:
```bash
# Option 1: Use stop script
./stop-services.sh

# Option 2: Manual port cleanup
lsof -ti :8080 | xargs kill -9  # Frontend
lsof -ti :8000 | xargs kill -9  # Backend
```

### Issue: Celery Not Processing Tasks

**Problem**: Videos stuck in "PENDING" status

**Solution**:
```bash
# 1. Check Celery is running
ps aux | grep celery

# 2. Restart Celery Worker
pkill -f "celery.*worker"
cd backend
source venv/bin/activate
celery -A app.core.celery_app worker --loglevel=info

# 3. Check Celery logs
tail -f backend/logs/celery.log
```

### Issue: Redis Connection Failed

**Problem**: Error "Error 61 connecting to localhost:6379"

**Solution**:
```bash
# 1. Check if Redis is running
redis-cli ping

# 2. Start Redis if not running
redis-server --daemonize yes --port 6379

# 3. Verify connection
redis-cli ping
# Expected: PONG
```

### Issue: Backend Code Changes Not Applied

**Problem**: Code changes don't take effect

**Solution**:
```bash
# Restart backend (auto-reload should work, but if not):
./restart-services.sh

# For Celery specifically (no auto-reload):
pkill -f "celery.*worker"
cd backend
source venv/bin/activate
celery -A app.core.celery_app worker --loglevel=info
```

### Issue: Frontend Build Errors

**Problem**: Next.js compilation errors

**Solution**:
```bash
# 1. Clear Next.js cache
rm -rf .next

# 2. Reinstall dependencies (if needed)
rm -rf node_modules
npm install

# 3. Restart frontend
./restart-services.sh
```

---

## Environment Setup

### First Time Setup

1. **Install Dependencies**
```bash
# Frontend
npm install

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. **Install Redis**
```bash
# macOS
brew install redis

# Linux (Ubuntu/Debian)
sudo apt-get install redis-server
```

3. **Configure Environment Variables**
```bash
# Create .env file in project root
cp .env.example .env

# Edit .env with your settings
nano .env
```

4. **Start Services**
```bash
./restart-services.sh
```

---

## Production Deployment

For production deployment, use process managers instead of background jobs:

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start all services with PM2
pm2 start ecosystem.config.js

# Monitor services
pm2 monit

# View logs
pm2 logs

# Restart services
pm2 restart all
```

### Using Supervisor (Linux)

```bash
# Install Supervisor
sudo apt-get install supervisor

# Copy supervisor configs
sudo cp deployment/supervisor/*.conf /etc/supervisor/conf.d/

# Reload and start
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

---

## Service Dependencies

```
Redis (Required)
  ↓
Backend API
  ↓
Celery Worker
  ↓
Frontend
```

**Start Order**: Redis → Backend → Celery → Frontend

**Stop Order**: Frontend → Celery → Backend → (Redis can stay running)

---

## Useful Commands Cheat Sheet

```bash
# Quick Restart (All Services)
./restart-services.sh

# Stop All Services
./stop-services.sh

# View All Logs
tail -f logs/frontend.log backend/logs/backend.log backend/logs/celery.log

# Check All Running Processes
ps aux | grep -E "(next|uvicorn|celery|redis)" | grep -v grep

# Check All Ports
lsof -i :8080,8000,6379

# Clean Restart (Clear All)
./stop-services.sh && rm -rf .next backend/__pycache__ && ./restart-services.sh
```

---

## Support

For issues or questions:
1. Check logs in `logs/` and `backend/logs/`
2. Review this troubleshooting guide
3. Check service status with monitoring commands
4. Report issues to the development team

---

**Last Updated**: 2025-10-22
