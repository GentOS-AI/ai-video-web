#!/bin/bash
#
# AdsVideo.co Database Backup Script
# Automatically backs up PostgreSQL database with rotation
#
# Usage:
#   ./backup-database.sh
#
# Cron: 0 2 * * * /var/www/aivideo/deployment/scripts/backup-database.sh
#

set -e

# Configuration
BACKUP_DIR="/var/backups/aivideo/database"
DB_NAME="aivideo_prod"
DB_USER="aivideo_user"
DB_PASSWORD="CHANGE_THIS"  # Or use .pgpass file for security
RETENTION_DAYS=7

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Timestamp
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_${DB_NAME}_${DATE}.sql.gz"

echo -e "${YELLOW}🗄️  Starting database backup...${NC}"

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Perform backup
echo -e "${YELLOW}📦 Backing up database: $DB_NAME${NC}"
PGPASSWORD="$DB_PASSWORD" pg_dump -U "$DB_USER" -h localhost "$DB_NAME" \
    --format=custom \
    --verbose \
    2>&1 | gzip > "$BACKUP_FILE"

# Check if backup was successful
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup successful: $BACKUP_FILE ($BACKUP_SIZE)${NC}"
else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi

# Cleanup old backups
echo -e "${YELLOW}🧹 Cleaning up old backups (keeping last $RETENTION_DAYS days)${NC}"
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# List recent backups
echo -e "${GREEN}📋 Recent backups:${NC}"
ls -lht "$BACKUP_DIR" | head -n 6

echo -e "${GREEN}✅ Backup completed successfully!${NC}"
