// PM2 process definition used by the deploy pipeline on EC2.
// Run as: pm2 startOrReload apps/api/ecosystem.config.js (from the repo root on the server).
// cwd is pinned to this file's directory so the relative script path resolves
// regardless of where pm2 is invoked from.
// Env comes from apps/api/.env on the server (DATABASE_URL, PORT, NODE_ENV).
module.exports = {
  apps: [
    {
      name: "coligo-api",
      script: "dist/server.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "300M",
      env: { NODE_ENV: "production" },
    },
  ],
};
