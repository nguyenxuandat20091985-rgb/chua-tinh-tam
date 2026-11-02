import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
if (!existsSync(viteBin)) {
  console.error('Chưa cài dependencies. Hãy chạy: npm install');
  process.exit(1);
}

const children = [];
let stopping = false;

function start(label, args) {
  const child = spawn(process.execPath, args, {
    cwd: root,
    stdio: 'inherit',
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
    if (child.exitCode === null && !child.killed) child.kill('SIGTERM');
  }
  const forceStop = setTimeout(() => {
    for (const { child } of children) {
      if (child.exitCode === null) child.kill('SIGKILL');
    }
    process.exit(code);
  }, 1500);
  forceStop.unref();
  Promise.all(children.map(({ child }) => new Promise((resolve) => {
    if (child.exitCode !== null) return resolve();
    child.once('exit', resolve);
  }))).then(() => process.exit(code));
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

console.log('Chùa Tịnh Tâm: Frontend http://localhost:3000 | TikTok Socket.IO http://localhost:3001');
start('TikTok server', [path.join(root, 'server', 'index.js')]);
start('Frontend', [viteBin]);
