#!/bin/bash
#
# AdsVideo.co Health Check Script
# Checks all services and sends alerts if issues detected
#
# Usage:
#   ./health-check.sh
#
# Cron: */5 * * * * /var/www/aivideo/deployment/scripts/health-check.sh
#

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ISSUES=0

echo "🏥 AdsVideo.co Health Check - $(date)"
echo "========================================"

# Check Nginx
echo -n "Nginx: "
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Down${NC}"
    ((ISSUES++))
fi

# Check Frontend
echo -n "Frontend (Next.js): "
if systemctl is-active --quiet aivideo-frontend; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Down${NC}"
    ((ISSUES++))
fi

# Check Backend API
echo -n "Backend (FastAPI): "
if systemctl is-active --quiet aivideo-api; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Down${NC}"
    ((ISSUES++))
fi

# Check Celery Worker
echo -n "Celery Worker: "
if systemctl is-active --quiet aivideo-celery; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Down${NC}"
    ((ISSUES++))
fi

# Check PostgreSQL
echo -n "PostgreSQL: "
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Down${NC}"
    ((ISSUES++))
fi

# Check Redis
echo -n "Redis: "
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Down${NC}"
    ((ISSUES++))
fi

# Check HTTPS endpoint
echo -n "HTTPS Website: "
if curl -s -o /dev/null -w "%{http_code}" https://adsvideo.co | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Accessible${NC}"
else
    echo -e "${RED}❌ Not accessible${NC}"
    ((ISSUES++))
fi

# Check API endpoint
echo -n "API Health: "
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://adsvideo.co/api/v1/health)
if [ "$API_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Unhealthy (HTTP $API_RESPONSE)${NC}"
    ((ISSUES++))
fi

# Disk space check
echo -n "Disk Space: "
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✅ ${DISK_USAGE}% used${NC}"
elif [ "$DISK_USAGE" -lt 90 ]; then
    echo -e "${YELLOW}⚠️  ${DISK_USAGE}% used${NC}"
else
    echo -e "${RED}❌ ${DISK_USAGE}% used (CRITICAL)${NC}"
    ((ISSUES++))
fi

# Memory check
echo -n "Memory: "
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
if [ "$MEM_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✅ ${MEM_USAGE}% used${NC}"
elif [ "$MEM_USAGE" -lt 90 ]; then
    echo -e "${YELLOW}⚠️  ${MEM_USAGE}% used${NC}"
else
    echo -e "${RED}❌ ${MEM_USAGE}% used (HIGH)${NC}"
fi

echo "========================================"

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All systems operational!${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $ISSUES issue(s)!${NC}"
    # TODO: Send alert email/Slack notification
    exit 1
fi
