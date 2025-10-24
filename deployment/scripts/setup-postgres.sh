#!/bin/bash

################################################################################
# PostgreSQL Setup Script for Production Environment
################################################################################
#
# This script automates the installation and configuration of PostgreSQL
# for the AIVideo.DIY backend application.
#
# Usage:
#   sudo ./setup-postgres.sh
#
# What it does:
#   1. Installs PostgreSQL 14
#   2. Creates database and user
#   3. Configures access control
#   4. Sets up automatic backups
#   5. Verifies installation
#
# Author: AI Video DIY Team
# Date: 2025-10-24
#
################################################################################

set -e  # Exit on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="aivideo_prod"
DB_USER="aivideo_user"
DB_PASSWORD=""  # Will prompt user
PG_VERSION="14"

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Prompt for database password
prompt_password() {
    print_header "Database Configuration"

    echo -n "Enter password for PostgreSQL user '$DB_USER': "
    read -s DB_PASSWORD
    echo ""

    echo -n "Confirm password: "
    read -s DB_PASSWORD_CONFIRM
    echo ""

    if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
        print_error "Passwords do not match"
        exit 1
    fi

    if [ -z "$DB_PASSWORD" ]; then
        print_error "Password cannot be empty"
        exit 1
    fi

    print_success "Password set"
}

################################################################################
# Installation Steps
################################################################################

# Step 1: Install PostgreSQL
install_postgres() {
    print_header "Step 1: Installing PostgreSQL $PG_VERSION"

    if command -v psql &> /dev/null; then
        print_warning "PostgreSQL is already installed"
        psql --version

        read -p "Reinstall? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Skipping installation"
            return
        fi
    fi

    print_info "Updating package list..."
    apt update -qq

    print_info "Installing PostgreSQL..."
    apt install -y postgresql postgresql-contrib > /dev/null 2>&1

    print_success "PostgreSQL installed successfully"
    psql --version
}

# Step 2: Start PostgreSQL service
start_postgres() {
    print_header "Step 2: Starting PostgreSQL Service"

    systemctl start postgresql
    systemctl enable postgresql

    if systemctl is-active --quiet postgresql; then
        print_success "PostgreSQL service is running"
    else
        print_error "Failed to start PostgreSQL service"
        exit 1
    fi
}

# Step 3: Create database and user
create_database() {
    print_header "Step 3: Creating Database and User"

    # Check if database exists
    DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

    if [ "$DB_EXISTS" = "1" ]; then
        print_warning "Database '$DB_NAME' already exists"
        read -p "Drop and recreate? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
            print_success "Dropped existing database"
        else
            print_info "Using existing database"
            return
        fi
    fi

    # Create user
    print_info "Creating user '$DB_USER'..."
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || \
    sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

    # Create database
    print_info "Creating database '$DB_NAME'..."
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

    # Grant privileges
    print_info "Granting privileges..."
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

    # PostgreSQL 15+ requires additional schema permissions
    sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;" 2>/dev/null || true

    print_success "Database and user created successfully"
}

# Step 4: Configure PostgreSQL
configure_postgres() {
    print_header "Step 4: Configuring PostgreSQL"

    PG_CONFIG="/etc/postgresql/$PG_VERSION/main/postgresql.conf"
    PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

    # Backup original configs
    if [ ! -f "$PG_CONFIG.backup" ]; then
        cp "$PG_CONFIG" "$PG_CONFIG.backup"
        print_info "Backed up postgresql.conf"
    fi

    if [ ! -f "$PG_HBA.backup" ]; then
        cp "$PG_HBA" "$PG_HBA.backup"
        print_info "Backed up pg_hba.conf"
    fi

    # Configure listen address (localhost only for security)
    print_info "Configuring listen address..."
    sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" "$PG_CONFIG"

    # Configure max connections
    sed -i "s/max_connections = 100/max_connections = 200/" "$PG_CONFIG"

    # Configure shared buffers (25% of RAM, min 128MB)
    TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}')
    SHARED_BUFFERS=$((TOTAL_RAM / 4))
    if [ $SHARED_BUFFERS -lt 128 ]; then
        SHARED_BUFFERS=128
    fi
    sed -i "s/shared_buffers = 128MB/shared_buffers = ${SHARED_BUFFERS}MB/" "$PG_CONFIG"

    print_success "PostgreSQL configuration updated"

    # Configure pg_hba.conf
    print_info "Configuring authentication..."

    # Add local connection for our user
    if ! grep -q "$DB_USER" "$PG_HBA"; then
        echo "# AIVideo.DIY application user" >> "$PG_HBA"
        echo "local   $DB_NAME    $DB_USER                    md5" >> "$PG_HBA"
        echo "host    $DB_NAME    $DB_USER    127.0.0.1/32    md5" >> "$PG_HBA"
        print_success "Authentication configured"
    else
        print_warning "Authentication already configured"
    fi

    # Restart PostgreSQL to apply changes
    print_info "Restarting PostgreSQL..."
    systemctl restart postgresql

    if systemctl is-active --quiet postgresql; then
        print_success "PostgreSQL restarted successfully"
    else
        print_error "Failed to restart PostgreSQL"
        exit 1
    fi
}

# Step 5: Test connection
test_connection() {
    print_header "Step 5: Testing Connection"

    export PGPASSWORD="$DB_PASSWORD"

    # Test connection
    if psql -U "$DB_USER" -d "$DB_NAME" -h localhost -c "SELECT version();" > /dev/null 2>&1; then
        print_success "Connection test successful"
    else
        print_error "Connection test failed"
        print_info "Try manually: psql -U $DB_USER -d $DB_NAME -h localhost"
        exit 1
    fi

    unset PGPASSWORD
}

# Step 6: Create tables
create_tables() {
    print_header "Step 6: Creating Database Tables"

    read -p "Create tables now? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_info "Skipping table creation (run init_db.py manually later)"
        return
    fi

    # Check if backend exists
    if [ ! -d "/root/ai-video-web/backend" ]; then
        print_warning "Backend directory not found at /root/ai-video-web/backend"
        print_info "Clone the repository first, then run: python backend/scripts/init_db.py"
        return
    fi

    cd /root/ai-video-web/backend

    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        print_info "Creating virtual environment..."
        python3 -m venv venv
    fi

    # Activate venv and run init script
    print_info "Running database initialization script..."
    source venv/bin/activate

    # Update DATABASE_URL temporarily
    export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"

    python scripts/init_db.py

    if [ $? -eq 0 ]; then
        print_success "Tables created successfully"
    else
        print_error "Failed to create tables"
        print_info "Run manually: cd backend && python scripts/init_db.py"
    fi

    deactivate
}

# Step 7: Setup automatic backups
setup_backups() {
    print_header "Step 7: Setting Up Automatic Backups"

    read -p "Setup automatic daily backups? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_info "Skipping backup setup"
        return
    fi

    BACKUP_SCRIPT="/root/ai-video-web/deployment/scripts/backup-database.sh"

    if [ ! -f "$BACKUP_SCRIPT" ]; then
        print_warning "Backup script not found at $BACKUP_SCRIPT"
        print_info "Clone the repository to set up backups"
        return
    fi

    # Make backup script executable
    chmod +x "$BACKUP_SCRIPT"

    # Create .pgpass file for passwordless backups
    PGPASS_FILE="/root/.pgpass"
    echo "localhost:5432:$DB_NAME:$DB_USER:$DB_PASSWORD" > "$PGPASS_FILE"
    chmod 600 "$PGPASS_FILE"

    # Add cron job
    CRON_JOB="0 2 * * * $BACKUP_SCRIPT >> /var/log/postgres-backup.log 2>&1"

    if ! crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        print_success "Daily backup cron job added (runs at 2:00 AM)"
    else
        print_warning "Backup cron job already exists"
    fi
}

# Step 8: Display summary
display_summary() {
    print_header "Installation Summary"

    echo -e "${GREEN}✅ PostgreSQL $PG_VERSION installed and configured${NC}"
    echo ""
    echo "Database Information:"
    echo "  Database Name: $DB_NAME"
    echo "  Database User: $DB_USER"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo ""
    echo "Connection String:"
    echo -e "${BLUE}postgresql://$DB_USER:****@localhost:5432/$DB_NAME${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Update backend/.env file with the connection string above"
    echo "2. Run: python backend/scripts/init_db.py (if not done already)"
    echo "3. Restart backend: pm2 restart backend"
    echo ""
    echo "To migrate data from SQLite:"
    echo "  cd backend"
    echo "  export POSTGRES_URL='postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME'"
    echo "  python scripts/migrate_sqlite_to_postgres.py"
    echo ""
    print_success "Setup complete!"
}

################################################################################
# Main Execution
################################################################################

main() {
    print_header "PostgreSQL Production Setup"

    check_root
    prompt_password
    install_postgres
    start_postgres
    create_database
    configure_postgres
    test_connection
    create_tables
    setup_backups
    display_summary
}

# Run main function
main
