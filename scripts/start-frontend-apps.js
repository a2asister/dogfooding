const { spawn } = require('child_process');
const path = require('path');

const frontendApps = [
  { name: 'user-app', port: 8081 },
  { name: 'permission-app', port: 8082 },
  { name: 'role-app', port: 8083 },
  { name: 'department-app', port: 8084 },
  { name: 'log-app', port: 8085 },
  { name: 'audit-app', port: 8086 },
  { name: 'ticket-app', port: 8087 },
  { name: 'approval-app', port: 8088 },
  { name: 'message-app', port: 8089 },
  { name: 'setting-app', port: 8090 },
];

const processes = [];

frontendApps.forEach((app) => {
  const appPath = path.join(__dirname, '..', 'packages', app.name);
  console.log(`Starting ${app.name} on port ${app.port}...`);
  
  const proc = spawn('pnpm', ['dev'], {
    cwd: appPath,
    stdio: 'inherit',
    env: { ...process.env, PORT: app.port },
    shell: true,
  });
  
  processes.push(proc);
});

console.log('\nAll frontend apps starting...\n');

process.on('SIGINT', () => {
  console.log('\nStopping all frontend apps...');
  processes.forEach((proc) => proc.kill());
  process.exit(0);
});
