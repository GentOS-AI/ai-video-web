# Service Management Scripts

## 📋 Overview

This project includes automated scripts for managing all services (Frontend, Backend, Celery Worker, Redis).

## 🚀 Quick Start

### One-Command Restart (Recommended)
```bash
./restart-services.sh
```

This will:
- ✅ Stop all existing services cleanly
- ✅ Start Backend API (port 8000)
- ✅ Start Celery Worker
- ✅ Start Frontend (port 8080)
- ✅ Verify all services are running
- ✅ Display service URLs and logs

### Stop All Services
```bash
./stop-services.sh
```

---

## 📁 Available Scripts

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `restart-services.sh` | **Full restart** of all services | After code changes, troubleshooting, or initial setup |
| `stop-services.sh` | **Stop** all services | Before shutdown or manual service management |
| `start_enhanced_test.sh` | Test AI enhancement workflow | Testing AI image enhancement + script generation |
| `START_MOCK_TEST.sh` | Test with mock Sora service | Development without API costs |
| `test_sse.sh` | Test SSE streaming | Testing real-time progress updates |

---

## 🔧 Service Configuration

### Ports
- **Frontend**: 8080
- **Backend API**: 8000
- **Redis**: 6379

### Log Files
- **Frontend**: `logs/frontend.log`
- **Backend**: `backend/logs/backend.log`
- **Celery**: `backend/logs/celery.log`

### PID Files (Process IDs)
- **Frontend**: `/tmp/aivideo_frontend.pid`
- **Backend**: `/tmp/aivideo_backend.pid`
- **Celery**: `/tmp/aivideo_celery.pid`

---

## 💡 Usage Examples

### Scenario 1: After Code Changes
```bash
# Quick restart to apply changes
./restart-services.sh
```

**Note**:
- Backend API has auto-reload (changes apply automatically)
- Celery Worker **requires restart** to load new code
- Frontend has Turbopack auto-reload

### Scenario 2: Celery Task Not Running
```bash
# Restart only Celery (manual)
pkill -f "celery.*worker"
cd backend
source venv/bin/activate
celery -A app.core.celery_app worker --loglevel=info

# OR restart all services
./restart-services.sh
```

### Scenario 3: Port Conflict
```bash
# Clean stop all services first
./stop-services.sh

# Then restart
./restart-services.sh
```

### Scenario 4: Check Service Status
```bash
# After starting services, check logs
tail -f backend/logs/backend.log
tail -f backend/logs/celery.log
tail -f logs/frontend.log

# Check if services are running
lsof -i :8080  # Frontend
lsof -i :8000  # Backend
ps aux | grep celery  # Celery Worker
redis-cli ping  # Redis
```

---

## 🐛 Troubleshooting

### Problem: Script Permission Denied
```bash
# Solution: Make scripts executable
chmod +x restart-services.sh stop-services.sh
```

### Problem: Port Already in Use
```bash
# Solution 1: Use stop script
./stop-services.sh

# Solution 2: Kill specific port manually
lsof -ti :8080 | xargs kill -9  # Frontend
lsof -ti :8000 | xargs kill -9  # Backend
```

### Problem: Redis Not Running
```bash
# Check Redis status
redis-cli ping

# Start Redis if needed
redis-server --daemonize yes --port 6379
```

### Problem: Celery Not Processing Tasks
```bash
# 1. Check Celery logs
tail -f backend/logs/celery.log

# 2. Restart Celery
pkill -f "celery.*worker"
cd backend && source venv/bin/activate
celery -A app.core.celery_app worker --loglevel=info

# 3. Or use full restart
./restart-services.sh
```

### Problem: Code Changes Not Applied
```bash
# Backend API: Should auto-reload (no restart needed)
# Celery Worker: Needs restart
./restart-services.sh

# OR restart only Celery
pkill -f "celery.*worker"
cd backend && source venv/bin/activate
celery -A app.core.celery_app worker --loglevel=info
```

---

## 📊 Service Health Checks

### After Running `restart-services.sh`

1. **Check Backend API**
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

2. **Check Frontend**
```bash
curl -I http://localhost:8080
# Expected: HTTP/1.1 200 OK
```

3. **Check Redis**
```bash
redis-cli ping
# Expected: PONG
```

4. **Check Celery Worker**
```bash
# Look for "celery@<hostname> ready" in logs
tail -20 backend/logs/celery.log
```

---

## 🎯 Best Practices

### ✅ Do
- Use `restart-services.sh` after pulling new code
- Check logs after starting services
- Stop services before system shutdown
- Keep Redis running (shared service)

### ❌ Don't
- Kill processes with `kill -9` without trying graceful shutdown first
- Run multiple instances on same ports
- Forget to activate venv when running commands manually
- Ignore error messages in logs

---

## 🔄 Service Dependency Order

### Start Order (Important!)
```
1. Redis (required for Celery)
   ↓
2. Backend API (depends on Redis)
   ↓
3. Celery Worker (depends on Redis + Backend models)
   ↓
4. Frontend (depends on Backend API)
```

The `restart-services.sh` script follows this order automatically.

### Stop Order
```
1. Frontend
   ↓
2. Celery Worker
   ↓
3. Backend API
   ↓
4. Redis (optional - can keep running)
```

---

## 📝 Script Customization

### Changing Ports

Edit `restart-services.sh`:
```bash
# Line 13-15
FRONTEND_PORT=8080  # Change to your desired port
BACKEND_PORT=8000   # Change to your desired port
REDIS_PORT=6379     # Change to your desired port
```

### Changing Log Locations

Edit `restart-services.sh`:
```bash
# Line 98, 106, 114
# Update log file paths as needed
```

---

## 📚 Additional Documentation

For detailed service management information, see:
- [SERVICE_MANAGEMENT.md](SERVICE_MANAGEMENT.md) - Complete service management guide
- [README.md](README.md) - Project overview
- [GETTING_STARTED.md](GETTING_STARTED.md) - Initial setup guide

---

## 🆘 Support

If you encounter issues:

1. **Check Logs**
   ```bash
   tail -f logs/frontend.log
   tail -f backend/logs/backend.log
   tail -f backend/logs/celery.log
   ```

2. **Verify Services**
   ```bash
   lsof -i :8080,8000,6379
   ps aux | grep -E "(next|uvicorn|celery|redis)"
   ```

3. **Clean Restart**
   ```bash
   ./stop-services.sh
   rm -rf .next backend/__pycache__
   ./restart-services.sh
   ```

4. **Report Issue**
   - Include error messages from logs
   - Describe steps to reproduce
   - Mention which script you ran

---

**Last Updated**: 2025-10-22
**Script Version**: 1.0
