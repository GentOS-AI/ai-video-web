#!/bin/bash
#
# AdsVideo.co Database Restore Script
# Restores PostgreSQL database from backup
#
# Usage:
#   ./restore-database.sh <backup_file>
#
# Example:
#   ./restore-database.sh /var/backups/aivideo/database/db_aivideo_prod_20250118_020000.sql.gz
#

set -e

# Configuration
DB_NAME="aivideo_prod"
DB_USER="aivideo_user"
DB_PASSWORD="CHANGE_THIS"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check arguments
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Error: No backup file specified${NC}"
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 /var/backups/aivideo/database/db_aivideo_prod_20250118.sql.gz"
    exit 1
fi

BACKUP_FILE=$1

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will OVERWRITE the current database!${NC}"
echo "Backup file: $BACKUP_FILE"
echo -n "Are you sure? (type 'yes' to confirm): "
read CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Stop services
echo -e "${YELLOW}🛑 Stopping services...${NC}"
sudo systemctl stop aivideo-api
sudo systemctl stop aivideo-celery

# Drop and recreate database
echo -e "${YELLOW}🗑️  Dropping existing database...${NC}"
PGPASSWORD="$DB_PASSWORD" psql -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
PGPASSWORD="$DB_PASSWORD" psql -U postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# Restore backup
echo -e "${YELLOW}📥 Restoring database from backup...${NC}"
gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASSWORD" pg_restore -U "$DB_USER" -d "$DB_NAME" --verbose

if [ ${PIPESTATUS[1]} -eq 0 ]; then
    echo -e "${GREEN}✅ Database restored successfully!${NC}"
else
    echo -e "${RED}❌ Restore failed!${NC}"
    exit 1
fi

# Start services
echo -e "${YELLOW}▶️  Starting services...${NC}"
sudo systemctl start aivideo-api
sudo systemctl start aivideo-celery

echo -e "${GREEN}✅ Restore completed! Services restarted.${NC}"
