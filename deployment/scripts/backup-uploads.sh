#!/bin/bash
#
# AdsVideo.co Uploads Backup Script
# Backs up user-uploaded files (videos/images)
#
# Usage:
#   ./backup-uploads.sh
#
# Cron: 0 3 * * * /var/www/aivideo/deployment/scripts/backup-uploads.sh
#

set -e

# Configuration
SOURCE_DIR="/var/www/aivideo/backend/uploads"
BACKUP_DIR="/var/backups/aivideo/uploads"
RETENTION_DAYS=14

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Timestamp
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/uploads_${DATE}.tar.gz"

echo -e "${YELLOW}📁 Starting uploads backup...${NC}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create compressed archive
echo -e "${YELLOW}📦 Archiving uploads directory...${NC}"
tar -czf "$BACKUP_FILE" -C "$(dirname $SOURCE_DIR)" "$(basename $SOURCE_DIR)" 2>&1

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup successful: $BACKUP_FILE ($BACKUP_SIZE)${NC}"
else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi

# Cleanup old backups
echo -e "${YELLOW}🧹 Cleaning up old backups (keeping last $RETENTION_DAYS days)${NC}"
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# List recent backups
echo -e "${GREEN}📋 Recent backups:${NC}"
ls -lht "$BACKUP_DIR" | head -n 6

echo -e "${GREEN}✅ Uploads backup completed!${NC}"
