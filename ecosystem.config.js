// PM2 ecosystem configuration for production deployment
module.exports = {
  apps: [{
    name: 'school-management-api',
    script: 'server.js',
    instances: 'max', // Use all available CPU cores
    exec_mode: 'cluster',

    // Environment variables
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },

    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

    // Auto restart settings
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_memory_restart: '1G',

    // Advanced settings
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,

    // Auto restart on crashes
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s',

    // Graceful shutdown
    kill_timeout: 5000
  }],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:username/school-management-api.git',
      path: '/var/www/school-management-api',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
