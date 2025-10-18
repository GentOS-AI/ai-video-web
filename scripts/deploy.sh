#!/bin/bash

##############################################################################
# AI Video Web - Local Deployment Trigger Script
#
# This script runs on your LOCAL machine to deploy to the remote server
# Usage: ./scripts/deploy.sh [options]
#
# Options:
#   -m "message"    Git commit message (default: "Deploy: updates")
#   -s              Skip git push (only deploy to server)
#   -h              Show help
#
# Examples:
#   ./scripts/deploy.sh                           # Commit, push, and deploy
#   ./scripts/deploy.sh -m "Add new feature"      # Custom commit message
#   ./scripts/deploy.sh -s                        # Deploy without git push
##############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Load environment variables from .env
if [ -f .env ]; then
    # Only load standard environment variables (not SSH command)
    export $(cat .env | grep -E '^(PROD_SERVER|DOMAIN)=' | xargs)
fi

# Configuration (from .env or defaults)
SERVER_HOST="${PROD_SERVER:-23.95.254.67}"
SSH_PORT="3200"
SSH_USER="root"
PROJECT_DIR="/root/ai-video-web"
DEPLOY_SCRIPT="$PROJECT_DIR/scripts/server-deploy.sh"

# Default options
COMMIT_MESSAGE="Deploy: updates"
SKIP_GIT_PUSH=false

# Parse command line arguments
while getopts "m:sh" opt; do
    case $opt in
        m)
            COMMIT_MESSAGE="$OPTARG"
            ;;
        s)
            SKIP_GIT_PUSH=true
            ;;
        h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -m \"message\"    Git commit message (default: \"Deploy: updates\")"
            echo "  -s              Skip git push (only deploy to server)"
            echo "  -h              Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                           # Commit, push, and deploy"
            echo "  $0 -m \"Add new feature\"      # Custom commit message"
            echo "  $0 -s                        # Deploy without git push"
            exit 0
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            exit 1
            ;;
    esac
done

# Helper functions
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING:${NC} $1"
}

log_info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] INFO:${NC} $1"
}

log_step() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')] ▶${NC} $1"
}

# Print deployment header
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         AI Video Web - Deployment Script                ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check if we're in the project directory
if [ ! -f "package.json" ] || [ ! -d ".git" ]; then
    log_error "This script must be run from the project root directory"
    exit 1
fi

log_info "Project directory: $(pwd)"
log_info "Target server: $SSH_USER@$SERVER_HOST:$SSH_PORT"
log_info "Remote path: $PROJECT_DIR"
echo ""

# Step 2: Check git status
log_step "Checking git status..."
if [ "$SKIP_GIT_PUSH" = false ]; then
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "You have uncommitted changes"
        git status --short

        echo ""
        read -p "$(echo -e ${YELLOW}Do you want to commit these changes? [y/N]:${NC} )" -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log "Staging all changes..."
            git add .

            log "Creating commit: $COMMIT_MESSAGE"
            git commit -m "$COMMIT_MESSAGE"

            log "Pushing to GitHub..."
            git push origin main

            if [ $? -ne 0 ]; then
                log_error "Git push failed!"
                exit 1
            fi

            log "Code pushed successfully"
        else
            log_warning "Skipping git commit. Deploying current remote version."
        fi
    else
        log_info "No uncommitted changes"

        # Check if local is ahead of remote
        LOCAL=$(git rev-parse @)
        REMOTE=$(git rev-parse @{u} 2>/dev/null)

        if [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
            log "Pushing local commits to GitHub..."
            git push origin main

            if [ $? -ne 0 ]; then
                log_error "Git push failed!"
                exit 1
            fi

            log "Code pushed successfully"
        else
            log_info "Already up to date with remote"
        fi
    fi
else
    log_warning "Skipping git push (--skip-push flag)"
fi

echo ""

# Step 3: Test SSH connection
log_step "Testing SSH connection to server..."
if ! ssh -p "$SSH_PORT" -o ConnectTimeout=10 "$SSH_USER@$SERVER_HOST" "echo 'Connected successfully'" &>/dev/null; then
    log_error "Cannot connect to server $SSH_USER@$SERVER_HOST:$SSH_PORT"
    log_error "Please check:"
    log_error "  1. Server is running and accessible"
    log_error "  2. SSH credentials are correct"
    log_error "  3. Port $SSH_PORT is open"
    exit 1
fi
log "SSH connection successful"

# Step 4: Check if project exists on server
log_step "Checking remote project directory..."
if ! ssh -p "$SSH_PORT" "$SSH_USER@$SERVER_HOST" "[ -d $PROJECT_DIR ]"; then
    log_error "Project directory $PROJECT_DIR does not exist on server!"
    echo ""
    log_info "Please run the following command on the server to clone the repository:"
    echo -e "${CYAN}GIT_SSH_COMMAND=\"ssh -i ~/.ssh/id_ed25519\" git clone git@github.com:GentOS-AI/ai-video-web.git $PROJECT_DIR${NC}"
    exit 1
fi
log "Remote project directory found"

# Step 5: Check if deployment script exists on server
log_step "Checking deployment script on server..."
if ! ssh -p "$SSH_PORT" "$SSH_USER@$SERVER_HOST" "[ -f $DEPLOY_SCRIPT ]"; then
    log_warning "Deployment script not found on server"
    log "Uploading deployment script..."

    scp -P "$SSH_PORT" scripts/server-deploy.sh "$SSH_USER@$SERVER_HOST:$DEPLOY_SCRIPT"
    ssh -p "$SSH_PORT" "$SSH_USER@$SERVER_HOST" "chmod +x $DEPLOY_SCRIPT"

    log "Deployment script uploaded"
fi

# Step 6: Upload ecosystem.config.js and .env.production if they don't exist
log_step "Uploading configuration files..."

if [ -f "ecosystem.config.js" ]; then
    scp -P "$SSH_PORT" ecosystem.config.js "$SSH_USER@$SERVER_HOST:$PROJECT_DIR/"
    log "ecosystem.config.js uploaded"
fi

if [ -f ".env.production" ]; then
    # Check if .env.production exists on server
    if ! ssh -p "$SSH_PORT" "$SSH_USER@$SERVER_HOST" "[ -f $PROJECT_DIR/.env.production ]"; then
        log_warning ".env.production not found on server"
        read -p "$(echo -e ${YELLOW}Upload .env.production to server? [y/N]:${NC} )" -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            scp -P "$SSH_PORT" .env.production "$SSH_USER@$SERVER_HOST:$PROJECT_DIR/"
            log ".env.production uploaded"
        else
            log_warning "Skipped .env.production upload. Make sure environment variables are configured on server!"
        fi
    fi
fi

echo ""

# Step 7: Execute deployment on server
log_step "Starting remote deployment..."
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Remote Server Deployment Log${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

ssh -p "$SSH_PORT" "$SSH_USER@$SERVER_HOST" "cd $PROJECT_DIR && bash $DEPLOY_SCRIPT"

DEPLOY_RESULT=$?

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Step 8: Check deployment result
if [ $DEPLOY_RESULT -eq 0 ]; then
    log "✓ Deployment completed successfully!"
    echo ""
    log_info "Your application is now running on:"
    log_info "  - Server: http://$SERVER_HOST"
    if [ -n "$DOMAIN" ]; then
        log_info "  - Domain: https://$DOMAIN"
    fi
    echo ""
    log_info "Useful commands:"
    echo -e "  ${CYAN}ssh -p$SSH_PORT $SSH_USER@$SERVER_HOST${NC}    # SSH to server"
    echo -e "  ${CYAN}pm2 logs${NC}                                   # View application logs"
    echo -e "  ${CYAN}pm2 status${NC}                                 # Check service status"
    echo -e "  ${CYAN}pm2 restart all${NC}                            # Restart services"
    echo ""
else
    log_error "✗ Deployment failed!"
    echo ""
    log_info "To debug, SSH to the server and check logs:"
    echo -e "  ${CYAN}ssh -p$SSH_PORT $SSH_USER@$SERVER_HOST${NC}"
    echo -e "  ${CYAN}tail -f $PROJECT_DIR/logs/deploy.log${NC}"
    echo -e "  ${CYAN}pm2 logs${NC}"
    echo ""
    exit 1
fi

echo ""
exit 0
