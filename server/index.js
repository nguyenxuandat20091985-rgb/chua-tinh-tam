/**
 * Chùa Tịnh Tâm – Server
 * - Serve Vite build (production) hoặc proxy dev
 * - Socket.io + TikTok LIVE event bridge (không phụ thuộc Euler signing)
 */
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { TikTokLiveClient, EventType } from 'piratetok-live-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);

// Always keep the real production origin allowed. FRONTEND_ORIGINS can add
// trusted preview/custom domains, but must never accidentally remove production.
const allowedOrigins = new Set([
  'https://chua-tinh-tam.vercel.app',
  ...(process.env.FRONTEND_ORIGINS || '')
    .split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean),
]);
const originAllowed = (origin) => !origin || allowedOrigins.has(origin);
const corsOptions = {
  origin(origin, callback) {
    if (originAllowed(origin)) return callback(null, true);
    console.warn('[CORS] blocked origin:', origin || '(missing)');
    return callback(new Error('Origin không được phép kết nối Chùa Tịnh Tâm'));
  },
};
const io = new Server(httpServer, { cors: corsOptions });

app.use(cors(corsOptions));
app.use(express.json());

/** @type {Map<string, InstanceType<typeof TikTokLiveClient>>} */
const connections = new Map();

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'chua-tinh-tam',
    status: 'ready',
    uptimeSec: Math.floor(process.uptime()),
    tiktokConnections: connections.size,
    tiktokProvider: 'piratetok-live-js',
  });
});

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

io.on('connection', (socket) => {
  console.log('[WS] client', socket.id);

  socket.on('tiktok:connect', async (payload) => {
    const uniqueId = String(payload?.uniqueId || '')
      .replace(/^@/, '')
      .trim()
      .replace(/[^a-zA-Z0-9._]/g, '');

    if (!uniqueId) {
      socket.emit('tiktok:error', { message: 'Thiếu @username TikTok' });
      return;
    }

    const prev = connections.get(socket.id);
    if (prev) {
      try { await prev.disconnect(); } catch (_) {}
      connections.delete(socket.id);
    }

    socket.emit('tiktok:status', { status: 'connecting', uniqueId });

    const tiktok = new TikTokLiveClient(uniqueId).maxRetries(10);
    connections.set(socket.id, tiktok);

    const emitUser = (data) => ({
      uniqueId: data?.user?.uniqueId || data?.user?.unique_id || data?.user?.username || uniqueId,
      nickname: data?.user?.nickname || data?.user?.uniqueId || data?.user?.username || uniqueId,
      userId: String(data?.user?.id || data?.user?.userId || ''),
    });

    tiktok.on(EventType.chat, (data) => {
      const user = emitUser(data);
      socket.emit('tiktok:chat', {
        ...user,
        comment: data?.content || data?.comment || '',
      });
    });

    tiktok.on(EventType.gift, (data) => {
      if (data?.isCombo && !data?.isStreakOver) return;
      const user = emitUser(data);
      const repeat = Number(data?.repeatCount || 1);
      const diamond = Number(data?.gift?.diamondCount || data?.diamondCount || 0);
      socket.emit('tiktok:gift', {
        ...user,
        giftName: data?.gift?.name || data?.giftName || 'Quà',
        repeatCount: repeat,
        diamondCount: diamond,
        totalXu: Number(data?.diamondTotal || diamond * repeat),
      });
    });

    tiktok.on(EventType.like, (data) => {
      const user = emitUser(data);
      socket.emit('tiktok:like', {
        ...user,
        likeCount: Number(data?.count || data?.likeCount || 1),
        totalLikeCount: Number(data?.total || data?.totalLikes || data?.totalLikeCount || 0),
      });
    });

    tiktok.on(EventType.follow, (data) => {
      socket.emit('tiktok:social', { ...emitUser(data), action: 'follow' });
    });

    tiktok.on(EventType.share, (data) => {
      socket.emit('tiktok:social', { ...emitUser(data), action: 'share' });
    });

    tiktok.on(EventType.join, (data) => {
      socket.emit('tiktok:member', emitUser(data));
    });

    tiktok.on(EventType.liveEnded, () => {
      socket.emit('tiktok:status', { status: 'ended', uniqueId });
      if (connections.get(socket.id) === tiktok) connections.delete(socket.id);
    });

    tiktok.on(EventType.reconnecting, (data) => {
      socket.emit('tiktok:status', {
        status: 'connecting',
        uniqueId,
        reconnecting: true,
        attempt: data?.attempt,
        maxRetries: data?.maxRetries,
      });
    });

    tiktok.on(EventType.disconnected, () => {
      socket.emit('tiktok:status', { status: 'disconnected', uniqueId });
      if (connections.get(socket.id) === tiktok) connections.delete(socket.id);
    });

    tiktok.on('error', (err) => {
      console.error('[TikTok] stream error', err?.message || err);
      socket.emit('tiktok:error', {
        message: err?.message || 'Không thể nhận dữ liệu TikTok LIVE.',
      });
    });

    // PirateTok 0.3.x resolves connect() only after the WSS handshake succeeds;
    // reconnecting/disconnected events then report subsequent stream state.
    void tiktok.connect()
      .then((roomId) => {
        if (connections.get(socket.id) !== tiktok) return;
        console.log('[TikTok] connected', uniqueId, 'roomId', roomId);
        socket.emit('tiktok:status', { status: 'connected', uniqueId, roomId });
      })
      .catch((err) => {
        console.error('[TikTok] connect error', err?.message || err);
        if (connections.get(socket.id) === tiktok) connections.delete(socket.id);
        socket.emit('tiktok:error', {
          message: err?.message || 'Không kết nối được. Kiểm tra username đang LIVE và thử lại.',
        });
        socket.emit('tiktok:status', { status: 'disconnected', uniqueId });
      });
  });

  socket.on('tiktok:disconnect', async () => {
    const prev = connections.get(socket.id);
    if (prev) {
      try { await prev.disconnect(); } catch (_) {}
      connections.delete(socket.id);
    }
    socket.emit('tiktok:status', { status: 'disconnected' });
  });

  socket.on('disconnect', async () => {
    const prev = connections.get(socket.id);
    if (prev) {
      try { await prev.disconnect(); } catch (_) {}
      connections.delete(socket.id);
    }
  });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(200).send('Chạy npm run build hoặc dùng Vite dev + server riêng.');
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Chùa Tịnh Tâm server: http://localhost:${PORT}`);
  console.log('Socket.io + TikTok LIVE connector không cần Euler signing sẵn sàng.');
});
