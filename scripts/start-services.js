const { spawn } = require('child_process');
const path = require('path');

const services = [
  { name: 'user-service', port: 3001 },
  { name: 'permission-service', port: 3002 },
  { name: 'role-service', port: 3003 },
  { name: 'department-service', port: 3004 },
  { name: 'log-service', port: 3005 },
  { name: 'audit-service', port: 3006 },
  { name: 'ticket-service', port: 3007 },
  { name: 'approval-service', port: 3008 },
  { name: 'message-service', port: 3009 },
  { name: 'setting-service', port: 3010 },
];

const processes = [];

services.forEach((service) => {
  const servicePath = path.join(__dirname, '..', 'packages', service.name);
  console.log(`Starting ${service.name} on port ${service.port}...`);
  
  const proc = spawn('pnpm', ['dev'], {
    cwd: servicePath,
    stdio: 'inherit',
    env: { ...process.env, PORT: service.port },
    shell: true,
  });
  
  processes.push(proc);
});

console.log('\nAll services starting...\n');

process.on('SIGINT', () => {
  console.log('\nStopping all services...');
  processes.forEach((proc) => proc.kill());
  process.exit(0);
});
