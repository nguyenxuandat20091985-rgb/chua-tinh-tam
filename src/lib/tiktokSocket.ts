import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let activeTikTokUser: string | null = null;

// In Vite development, the Socket.IO server always runs on port 3001.
// In production, VITE_TIKTOK_SERVER_URL must point to the persistent Node service.
const SERVER_URL =
  import.meta.env.VITE_TIKTOK_SERVER_URL ||
  (import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : 'https://chua-tinh-tam-live.onrender.com');

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

    // Khi Socket.IO tự kết nối lại, khôi phục phòng LIVE đang theo dõi.
    socket.on('connect', () => {
      if (activeTikTokUser) {
        socket?.emit('tiktok:connect', { uniqueId: activeTikTokUser });
      }
    });

    socket.on('tiktok:status', (data: { status?: string }) => {
      if (data.status === 'disconnected' || data.status === 'ended') {
        activeTikTokUser = null;
      }
    });
  }
  return socket;
}

export function connectTikTok(uniqueId: string) {
  const normalized = uniqueId.trim().replace(/^@/, '');
  if (!normalized) return;
  activeTikTokUser = normalized;
  const current = getSocket();
  if (current.connected) {
    current.emit('tiktok:connect', { uniqueId: normalized });
  }
}

export function disconnectTikTok() {
  activeTikTokUser = null;
  getSocket().emit('tiktok:disconnect');
}
