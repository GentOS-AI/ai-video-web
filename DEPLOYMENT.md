# Deployment Guide - AI Video Web

Complete guide for deploying the AI Video Web application to production server.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Initial Server Setup](#initial-server-setup)
- [Deployment Methods](#deployment-methods)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

---

## Overview

### Deployment Architecture

```
┌─────────────────┐       Git Push        ┌─────────────────┐
│  Local Machine  │ ───────────────────► │     GitHub      │
└─────────────────┘                       └─────────────────┘
         │                                         │
         │ SSH + Deploy Script                    │ Git Pull
         │                                         │
         ▼                                         ▼
┌─────────────────────────────────────────────────────────┐
│               Production Server (23.95.254.67:3200)     │
│  ┌────────────────────────────────────────────────────┐ │
│  │  1. Stop PM2 Services                              │ │
│  │  2. Pull Latest Code from GitHub                   │ │
│  │  3. Install Dependencies (npm install)             │ │
│  │  4. Build Application (npm run build)              │ │
│  │  5. Start PM2 Services                             │ │
│  │  6. Health Check                                   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Running Services:                                       │
│  ├─ ai-video-web (Next.js Frontend) - Port 3000         │
│  └─ ai-video-api (Backend API) - Port 8000 (optional)   │
└─────────────────────────────────────────────────────────┘
         │
         ▼
   https://AdsVideo.co
```

### Key Features

- ✅ **Automated Deployment**: One-command deployment from local machine
- ✅ **Zero-Downtime Strategy**: Build before restart, rollback on failure
- ✅ **Backup & Rollback**: Automatic backup before deployment
- ✅ **Health Checks**: Verify services after deployment
- ✅ **Logging**: Comprehensive deployment and application logs
- ✅ **Process Management**: PM2 for auto-restart and monitoring

---

## Prerequisites

### 1. Server Requirements

**Server Specifications:**
- OS: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- RAM: Minimum 2GB (4GB recommended)
- Storage: Minimum 10GB free space
- Network: Public IP with SSH access

**Software Requirements:**
```bash
# Node.js 20+ (LTS recommended)
node --version  # Should be v20.x.x or higher

# npm (comes with Node.js)
npm --version   # Should be 10.x.x or higher

# PM2 (process manager)
pm2 --version   # Install if missing: npm install -g pm2

# Git
git --version   # Should be 2.x.x or higher
```

### 2. SSH Access Configuration

**From Local Machine:**
```bash
# Test SSH connection
ssh -p 3200 root@23.95.254.67

# Should see successful login without password prompt
```

**On Server:**
```bash
# Verify SSH key for GitHub
ls -la ~/.ssh/id_ed25519      # Should exist
cat ~/.ssh/id_ed25519.pub     # Copy to GitHub Deploy Keys

# Test GitHub SSH connection
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" \
  git ls-remote git@github.com:GentOS-AI/ai-video-web.git
```

**Add SSH Key to GitHub:**
1. Go to: https://github.com/GentOS-AI/ai-video-web/settings/keys
2. Click "Add deploy key"
3. Paste the content of `~/.ssh/id_ed25519.pub`
4. Check "Allow write access" if needed
5. Save

### 3. Environment Variables

Create `.env.production` on server with actual credentials:

```bash
# On server
cd /root/ai-video-web
nano .env.production
```

See [.env.production](.env.production) template for all required variables.

---

## Initial Server Setup

### Step 1: Install Node.js (if not installed)

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version  # Should show v20.x.x
npm --version
```

### Step 2: Install PM2

```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version

# Configure PM2 to start on system boot
pm2 startup
# Follow the instructions shown

# Save PM2 process list
pm2 save
```

### Step 3: Clone Repository

```bash
# Navigate to deployment directory
cd /root

# Clone repository using SSH key
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" \
  git clone git@github.com:GentOS-AI/ai-video-web.git

# Navigate to project
cd ai-video-web

# Verify clone
ls -la
git status
```

### Step 4: Configure Environment

```bash
# Copy environment template
cp .env.production.template .env.production

# Edit with actual credentials
nano .env.production

# Secure the file
chmod 600 .env.production

# Verify it's not tracked by git
git status  # Should NOT show .env.production
```

### Step 5: Initial Build

```bash
# Install dependencies
npm install

# Build application
npm run build

# Verify build
ls -la .next/  # Should contain build artifacts
```

### Step 6: Configure PM2

```bash
# ecosystem.config.js should already exist from git clone
# Verify configuration
cat ecosystem.config.js

# Start services
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs

# Save configuration
pm2 save
```

**Expected PM2 Output:**
```
┌─────┬──────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┐
│ id  │ name             │ namespace   │ version │ mode    │ pid      │ uptime │ ...  │
├─────┼──────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┤
│ 0   │ ai-video-web     │ default     │ 0.1.0   │ fork    │ 12345    │ 0s     │ ...  │
└─────┴──────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┘
```

### Step 7: Configure Nginx (Optional)

If using Nginx as reverse proxy:

```bash
# Install Nginx
apt update && apt install nginx -y

# Create configuration
nano /etc/nginx/sites-available/ai-video-web
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name adsvideo.co www.adsvideo.co;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/ai-video-web /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Enable SSL with Let's Encrypt (recommended)
apt install certbot python3-certbot-nginx -y
certbot --nginx -d adsvideo.co -d www.adsvideo.co
```

---

## Deployment Methods

### Method 1: One-Command Deployment (Recommended)

**From your local machine:**

```bash
# Navigate to project directory
cd /path/to/ai-video-web

# Run deployment script
./scripts/deploy.sh

# With custom commit message
./scripts/deploy.sh -m "Add new feature: video templates"

# Deploy without git push (use current remote version)
./scripts/deploy.sh -s
```

**What it does:**
1. Commits and pushes your local changes to GitHub
2. SSHs to the server
3. Executes `server-deploy.sh` remotely
4. Shows real-time deployment logs
5. Displays deployment summary

**Expected Output:**
```
╔══════════════════════════════════════════════════════════╗
║         AI Video Web - Deployment Script                ║
╚══════════════════════════════════════════════════════════╝

[11:23:45] INFO: Project directory: /Users/lzx/lin/github/ai-video-web
[11:23:45] INFO: Target server: root@23.95.254.67:3200
[11:23:45] INFO: Remote path: /root/ai-video-web

[11:23:45] ▶ Checking git status...
[11:23:46] Pushing to GitHub...
[11:23:48] Code pushed successfully

[11:23:48] ▶ Testing SSH connection to server...
[11:23:49] SSH connection successful

[11:23:49] ▶ Starting remote deployment...

═══════════════════════════════════════════════════════════
  Remote Server Deployment Log
═══════════════════════════════════════════════════════════

[11:23:50] ==========================================
[11:23:50] Starting deployment at 20250118-112350
[11:23:50] ==========================================
[11:23:50] Creating backup of current version...
[11:23:51] Backup created at: /root/ai-video-web/backups/backup-20250118-112350
[11:23:51] Stopping PM2 services...
[11:23:52] PM2 services stopped
[11:23:52] Fetching latest code from GitHub...
[11:23:54] Pulling latest changes...
[11:23:54] INFO: Current commit: a8ab8d8
[11:23:54] INFO: Remote commit:  f9a2b37
[11:23:55] Code updated successfully to commit: f9a2b37
[11:23:55] Installing dependencies...
[11:23:58] Dependencies installed successfully
[11:23:58] Building application...
[11:24:15] Build completed successfully
[11:24:15] Starting PM2 services...
[11:24:17] Performing health check...
[11:24:17] Frontend service is running
[11:24:17] ==========================================
[11:24:17] Deployment completed successfully!
[11:24:17] ==========================================

[11:24:17] ✓ Deployment completed successfully!

[11:24:17] INFO: Your application is now running on:
[11:24:17] INFO:   - Server: http://23.95.254.67
[11:24:17] INFO:   - Domain: https://AdsVideo.co
```

### Method 2: Manual Server Deployment

**SSH to server and run:**

```bash
# SSH to server
ssh -p 3200 root@23.95.254.67

# Navigate to project
cd /root/ai-video-web

# Run deployment script
./scripts/server-deploy.sh
```

This is useful when:
- You've already pushed code to GitHub manually
- You want to rebuild without code changes
- Debugging deployment issues

### Method 3: PM2 Deployment (Alternative)

**Using PM2's built-in deployment:**

```bash
# From local machine
pm2 deploy ecosystem.config.js production setup    # First time only
pm2 deploy ecosystem.config.js production update   # Subsequent deploys
```

Note: Requires uncommenting the `deploy` section in [ecosystem.config.js](ecosystem.config.js).

---

## Configuration

### PM2 Configuration ([ecosystem.config.js](ecosystem.config.js))

**Key Settings:**

```javascript
{
  name: 'ai-video-web',           // Process name
  script: 'npm',                   // Command to run
  args: 'start',                   // Arguments (npm start)
  instances: 1,                    // Number of instances
  exec_mode: 'fork',              // Execution mode
  autorestart: true,               // Auto-restart on crash
  max_memory_restart: '1G',        // Restart if exceeds 1GB RAM
  env: {
    NODE_ENV: 'production',
    PORT: 3000
  }
}
```

**Adjust for your needs:**
- Increase `instances` for load balancing (use 'cluster' mode)
- Adjust `max_memory_restart` based on server RAM
- Add backend API configuration if needed

### Environment Variables ([.env.production](.env.production))

**Critical Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Frontend server port | `3000` |
| `NEXT_PUBLIC_API_URL` | Public API URL | `https://api.adsvideo.co/api/v1` |
| `STRIPE_SECRET_KEY` | Stripe API key | `sk_live_...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |

**Security Checklist:**
- ✅ All keys are production keys (not test keys)
- ✅ File permissions: `chmod 600 .env.production`
- ✅ File is in `.gitignore`
- ✅ API keys have IP restrictions enabled
- ✅ Webhook secrets are configured

---

## Troubleshooting

### Common Issues

#### 1. Build Fails with TypeScript Errors

**Symptom:**
```
Type error: ... is possibly 'undefined'
Build failed!
```

**Solution:**
```bash
# Check TypeScript errors locally first
npm run build

# Fix errors based on TYPESCRIPT_CONFIG.md guidelines
# Common fixes:
# - Add null checks for array access
# - Remove unused variables
# - Ensure all code paths return
```

#### 2. PM2 Process Crashes Immediately

**Symptom:**
```
pm2 status
# Shows: status: errored, restarts: 15
```

**Solution:**
```bash
# Check error logs
pm2 logs ai-video-web --err --lines 50

# Common causes:
# - Port already in use
# - Missing environment variables
# - Build artifacts missing

# Fix port issue
lsof -i :3000        # Check what's using port
pm2 delete all       # Clear PM2
pm2 start ecosystem.config.js

# Fix missing env
cp .env.production.template .env.production
nano .env.production  # Add credentials
```

#### 3. Git Pull Fails with SSH Error

**Symptom:**
```
Permission denied (publickey)
fatal: Could not read from remote repository
```

**Solution:**
```bash
# Test SSH key
ssh -T git@github.com -i ~/.ssh/id_ed25519

# If fails, check key permissions
chmod 600 ~/.ssh/id_ed25519

# Verify key is added to GitHub
cat ~/.ssh/id_ed25519.pub
# Add to: github.com/GentOS-AI/ai-video-web/settings/keys

# Test git command
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" \
  git ls-remote git@github.com:GentOS-AI/ai-video-web.git
```

#### 4. Deployment Rollback

**If deployment fails, rollback manually:**

```bash
cd /root/ai-video-web

# List available backups
ls -lt backups/

# Restore from backup
BACKUP="backups/backup-20250118-112350"
rm -rf .next node_modules
cp -r "$BACKUP/.next" .
cp -r "$BACKUP/node_modules" .

# Restart PM2
pm2 restart all

# Verify
pm2 status
curl http://localhost:3000
```

#### 5. Out of Memory During Build

**Symptom:**
```
FATAL ERROR: Reached heap limit Allocation failed
```

**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Or add to package.json scripts:
# "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"

# For persistent fix, upgrade server RAM
```

### Viewing Logs

**Deployment logs:**
```bash
tail -f /root/ai-video-web/logs/deploy.log
```

**Application logs:**
```bash
# All logs
pm2 logs

# Frontend only
pm2 logs ai-video-web

# Last 100 lines
pm2 logs --lines 100

# Error logs only
pm2 logs --err
```

**Log files location:**
- Deployment: `/root/ai-video-web/logs/deploy.log`
- Frontend output: `/root/ai-video-web/logs/frontend-out.log`
- Frontend errors: `/root/ai-video-web/logs/frontend-error.log`

### Health Checks

**Check if application is running:**

```bash
# PM2 status
pm2 status

# Check port
netstat -tlnp | grep 3000

# Test HTTP response
curl http://localhost:3000

# Test from outside
curl http://23.95.254.67:3000
curl https://adsvideo.co
```

**Expected responses:**
- PM2 status: `online` with green status
- Port 3000: Should show Node.js process
- HTTP response: Should return HTML (not 502/503 error)

---

## Maintenance

### Regular Tasks

#### Update Dependencies

```bash
# SSH to server
cd /root/ai-video-web

# Update to latest compatible versions
npm update

# Rebuild
npm run build

# Restart
pm2 restart all

# Verify
pm2 logs
```

#### Clean Old Backups

```bash
cd /root/ai-video-web/backups

# Backups are auto-cleaned (keeps last 5)
# Manual cleanup:
ls -t | tail -n +6 | xargs rm -rf
```

#### Rotate Logs

```bash
# PM2 log rotation (install module)
pm2 install pm2-logrotate

# Configure rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

#### Monitor Resources

```bash
# Real-time monitoring
pm2 monit

# Server resources
htop              # CPU, RAM usage
df -h             # Disk usage
free -h           # Memory usage
```

### Security Updates

**Monthly security checklist:**

1. **Update system packages:**
   ```bash
   apt update && apt upgrade -y
   ```

2. **Rotate API keys:**
   - Generate new keys in provider dashboards
   - Update `.env.production`
   - Restart services: `pm2 restart all`

3. **Check for npm vulnerabilities:**
   ```bash
   npm audit
   npm audit fix  # Apply automatic fixes
   ```

4. **Review access logs:**
   ```bash
   pm2 logs | grep -i error
   tail -f /var/log/nginx/access.log  # If using Nginx
   ```

5. **Backup database** (if applicable):
   ```bash
   # Example for PostgreSQL
   pg_dump dbname > backup-$(date +%Y%m%d).sql
   ```

### Performance Optimization

**Enable PM2 clustering:**

```javascript
// ecosystem.config.js
{
  instances: 'max',      // Use all CPU cores
  exec_mode: 'cluster'   // Enable load balancing
}
```

**Enable Node.js production mode:**

Verify `NODE_ENV=production` is set in `.env.production`.

**Enable gzip compression:**

If using Nginx, add to config:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

---

## Useful Commands Reference

### Deployment

| Command | Description |
|---------|-------------|
| `./scripts/deploy.sh` | Deploy from local machine |
| `./scripts/deploy.sh -m "msg"` | Deploy with commit message |
| `./scripts/deploy.sh -s` | Deploy without git push |
| `./scripts/server-deploy.sh` | Deploy on server directly |

### PM2 Management

| Command | Description |
|---------|-------------|
| `pm2 start ecosystem.config.js` | Start all services |
| `pm2 restart all` | Restart all services |
| `pm2 stop all` | Stop all services |
| `pm2 delete all` | Remove all services |
| `pm2 logs` | View logs (all services) |
| `pm2 logs ai-video-web` | View frontend logs only |
| `pm2 status` | Show process status |
| `pm2 monit` | Real-time monitoring |
| `pm2 save` | Save current process list |
| `pm2 resurrect` | Restore saved processes |

### Git Operations

| Command | Description |
|---------|-------------|
| `git status` | Check repo status |
| `git pull origin main` | Pull latest changes |
| `git log --oneline -5` | View recent commits |
| `git reset --hard origin/main` | Force reset to remote |

### Server Diagnostics

| Command | Description |
|---------|-------------|
| `tail -f logs/deploy.log` | Watch deployment log |
| `netstat -tlnp \| grep 3000` | Check port 3000 |
| `curl http://localhost:3000` | Test local response |
| `systemctl status nginx` | Check Nginx status |
| `df -h` | Check disk space |
| `free -h` | Check memory usage |
| `htop` | Interactive process viewer |

---

## Support

### Getting Help

**Common resources:**
- Project documentation: `/docs` directory
- Deployment issues: Check logs first (`pm2 logs`, `tail -f logs/deploy.log`)
- GitHub issues: Report bugs at repository issues page
- PM2 documentation: https://pm2.keymetrics.io/docs/usage/quick-start/

**Before asking for help, provide:**
1. Deployment logs (`logs/deploy.log`)
2. PM2 status (`pm2 status`)
3. Error logs (`pm2 logs --err`)
4. Steps to reproduce the issue
5. Server specs and Node.js version

---

## License

This deployment configuration is part of the AI Video Web project.
Refer to the main [README.md](README.md) for license information.

---

**Last Updated:** 2025-01-18
**Version:** 1.0.0
