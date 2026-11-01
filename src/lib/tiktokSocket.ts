import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const SERVER_URL =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : 'http://localhost:3001';

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}

export function connectTikTok(uniqueId: string) {
  getSocket().emit('tiktok:connect', { uniqueId });
}

export function disconnectTikTok() {
  getSocket().emit('tiktok:disconnect');
}
