import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const SERVER_URL =
  import.meta.env.VITE_TIKTOK_SERVER_URL ||
  (typeof window !== 'undefined'
    ? window.location.port === '3000'
      ? `${window.location.protocol}//${window.location.hostname}:3001`
      : window.location.origin
    : 'http://localhost:3001');

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });
  }
  return socket;
}

export function connectTikTok(uniqueId: string) {
  const normalized = uniqueId.trim().replace(/^@/, '');
  if (!normalized) return;
  getSocket().emit('tiktok:connect', { uniqueId: normalized });
}

export function disconnectTikTok() {
  getSocket().emit('tiktok:disconnect');
}
