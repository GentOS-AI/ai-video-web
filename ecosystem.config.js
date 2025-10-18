/**
 * PM2 Ecosystem Configuration for AI Video Web
 *
 * This configuration file defines how PM2 manages the application processes
 * on the production server.
 *
 * Usage:
 *   pm2 start ecosystem.config.js        # Start all services
 *   pm2 restart ecosystem.config.js      # Restart all services
 *   pm2 stop ecosystem.config.js         # Stop all services
 *   pm2 delete ecosystem.config.js       # Remove all services
 *   pm2 logs                             # View logs
 *   pm2 monit                            # Monitor processes
 *
 * Documentation: https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [
    {
      // Frontend Next.js Application
      name: 'ai-video-web',
      script: 'npm',
      args: 'start',
      cwd: '/root/ai-video-web',
      instances: 1,
      exec_mode: 'fork',

      // Auto-restart configuration
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',

      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Logging
      error_file: '/root/ai-video-web/logs/frontend-error.log',
      out_file: '/root/ai-video-web/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Advanced settings
      min_uptime: '10s',          // Minimum uptime before considering app as online
      max_restarts: 10,            // Max restarts within 1 minute before stopping
      restart_delay: 4000,         // Delay between restarts (ms)

      // Health monitoring
      listen_timeout: 3000,        // Time to wait for app to be ready
      kill_timeout: 5000,          // Time to wait before force killing

      // Process management
      wait_ready: false,
      shutdown_with_message: false,
    },

    // Backend FastAPI Server
    {
      // Backend API Server
      name: 'ai-video-api',
      script: 'venv/bin/uvicorn',
      args: 'app.main:app --host 127.0.0.1 --port 8000',
      cwd: '/root/ai-video-web/backend',
      instances: 1,
      exec_mode: 'fork',
      interpreter: 'none',  // Direct binary execution

      // Auto-restart configuration
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',

      // Environment variables
      env: {
        PYTHONUNBUFFERED: '1',
      },

      // Logging
      error_file: '/root/ai-video-web/logs/backend-error.log',
      out_file: '/root/ai-video-web/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Advanced settings
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,

      // Health monitoring
      listen_timeout: 3000,
      kill_timeout: 5000,
    },
  ],

  /**
   * Deployment configuration (alternative to manual scripts)
   * Uncomment and configure if you want to use PM2's built-in deployment
   */
  /*
  deploy: {
    production: {
      user: 'root',
      host: '23.95.254.67',
      port: '3200',
      ref: 'origin/main',
      repo: 'git@github.com:GentOS-AI/ai-video-web.git',
      path: '/root/ai-video-web',
      ssh_options: ['StrictHostKeyChecking=no', 'PasswordAuthentication=no'],
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'post-setup': 'npm install',
    },
  },
  */
};
