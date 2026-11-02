import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const children = [];
let stopping = false;

function start(label, args) {
  const child = spawn(npmCommand, args, {
    stdio: 'inherit',
    shell: isWindows,
    env: process.env,
  });
  children.push({ label, child });
  child.on('error', (error) => {
    console.error(`[${label}] Không thể khởi động: ${error.message}`);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    if (stopping) return;
    if (code !== 0) {
      console.error(`[${label}] Dừng (code=${code}, signal=${signal || 'none'}).`);
      stop(code || 1);
    }
  });
}

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const { child } of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(code), 300);
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
process.on('exit', () => {
  for (const { child } of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
});

console.log('Khởi động giao diện Vite (http://localhost:3000) và TikTok Socket.IO (http://localhost:3001)...');
start('TikTok server', ['run', 'dev:server']);
start('Frontend', ['run', 'dev']);
