const path = require('path');

module.exports = {
  apps: [
    {
      name: 'company-chat-worker',
      script: path.join(__dirname, 'node_modules', 'tsx', 'dist', 'cli.mjs'),
      args: 'worker.ts',
      cwd: __dirname,
      interpreter: 'node',
      interpreter_args: '--import tsx/esm',
      node_args: '--no-warnings',
      env: {
        NEXT_PUBLIC_SUPABASE_URL: 'https://czjdhvtbejywzhprwlbn.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6amRodnRiZWp5d3pocHJ3bGJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjg5MDk4NCwiZXhwIjoyMDg4NDY2OTg0fQ.r7CjCxpp3U_7si6wezpvtXL5MHG26FOJKcV-YN83Olg',
        WORKER_ID: 'home-pc',
        WORKER_POLL_INTERVAL: '5000',
        WORKER_TASK_TIMEOUT: '300000',
      },
      restart_delay: 5000,
      max_restarts: 50,
      autorestart: true,
    },
  ],
};
