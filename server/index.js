/**
 * Chùa Tịnh Tâm – Server
 * - Serve Vite build (production) hoặc proxy dev
 * - Socket.io + TikTok Live Connector
 */
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebcastPushConnection } from 'tiktok-live-connector';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);

// Chỉ cho phép frontend đã khai báo kết nối. Có thể thêm nhiều origin,
// phân tách bằng dấu phẩy trong FRONTEND_ORIGINS.
const allowedOrigins = new Set(
  (process.env.FRONTEND_ORIGINS || 'https://chua-tinh-tam.vercel.app')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
);
const originAllowed = (origin) => !origin || allowedOrigins.has(origin);
const corsOptions = {
  origin(origin, callback) {
    if (originAllowed(origin)) return callback(null, true);
    return callback(new Error('Origin không được phép kết nối Chùa Tịnh Tâm'));
  },
};
const io = new Server(httpServer, { cors: corsOptions });

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'chua-tinh-tam', status: 'ready', uptimeSec: Math.floor(process.uptime()), tiktokConnections: connections.size });
});

// Production: serve built frontend
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

/** @type {Map<string, WebcastPushConnection>} */
const connections = new Map();

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

    // Disconnect previous for this socket
    const prev = connections.get(socket.id);
    if (prev) {
      try {
        prev.disconnect();
      } catch (_) {}
      connections.delete(socket.id);
    }

    socket.emit('tiktok:status', { status: 'connecting', uniqueId });

    const tiktok = new WebcastPushConnection(uniqueId, {
      processInitialData: false,
      enableExtendedGiftInfo: true,
      requestPollingIntervalMs: 2000,
    });

    connections.set(socket.id, tiktok);

    tiktok
      .connect()
      .then((state) => {
        console.log('[TikTok] connected', uniqueId, 'roomId', state.roomId);
        socket.emit('tiktok:status', {
          status: 'connected',
          uniqueId,
          roomId: state.roomId,
        });
      })
      .catch((err) => {
        console.error('[TikTok] connect error', err?.message || err);
        if (connections.get(socket.id) === tiktok) connections.delete(socket.id);
        socket.emit('tiktok:error', {
          message:
            err?.message ||
            'Không kết nối được. Kiểm tra username đang LIVE và thử lại.',
        });
        socket.emit('tiktok:status', { status: 'disconnected', uniqueId });
      });

    // —— Map TikTok events → frontend (engine quy tắc phía client) ——

    tiktok.on('chat', (data) => {
      socket.emit('tiktok:chat', {
        uniqueId: data.uniqueId,
        nickname: data.nickname || data.uniqueId,
        comment: data.comment,
        userId: data.userId,
      });
    });

    tiktok.on('gift', (data) => {
      // repeatEnd: chỉ tính khi kết thúc combo (tránh spam)
      if (data.giftType === 1 && !data.repeatEnd) return;

      const repeat = data.repeatCount || 1;
      const diamond = data.diamondCount || data.diamond_count || 1;
      const totalXu = diamond * repeat;

      socket.emit('tiktok:gift', {
        uniqueId: data.uniqueId,
        nickname: data.nickname || data.uniqueId,
        giftName: data.giftName || data.extendedGiftInfo?.name || 'Quà',
        repeatCount: repeat,
        diamondCount: diamond,
        totalXu,
      });
    });

    tiktok.on('like', (data) => {
      socket.emit('tiktok:like', {
        uniqueId: data.uniqueId,
        nickname: data.nickname || data.uniqueId,
        likeCount: data.likeCount || 1,
        totalLikeCount: data.totalLikeCount,
      });
    });

    tiktok.on('social', (data) => {
      // follow / share
      const display = data.displayType || '';
      const isFollow = String(display).includes('follow');
      const isShare = String(display).includes('share');
      if (isFollow || isShare) {
        socket.emit('tiktok:social', {
          uniqueId: data.uniqueId,
          nickname: data.nickname || data.uniqueId,
          action: isFollow ? 'follow' : 'share',
        });
      }
    });

    tiktok.on('member', (data) => {
      socket.emit('tiktok:member', {
        uniqueId: data.uniqueId,
        nickname: data.nickname || data.uniqueId,
      });
    });

    tiktok.on('streamEnd', () => {
      socket.emit('tiktok:status', { status: 'ended', uniqueId });
      connections.delete(socket.id);
    });

    tiktok.on('disconnected', () => {
      socket.emit('tiktok:status', { status: 'disconnected', uniqueId });
      connections.delete(socket.id);
    });

    tiktok.on('error', (err) => {
      socket.emit('tiktok:error', {
        message: err?.message || String(err),
      });
    });
  });

  socket.on('tiktok:disconnect', () => {
    const prev = connections.get(socket.id);
    if (prev) {
      try {
        prev.disconnect();
      } catch (_) {}
      connections.delete(socket.id);
    }
    socket.emit('tiktok:status', { status: 'disconnected' });
  });

  socket.on('disconnect', () => {
    const prev = connections.get(socket.id);
    if (prev) {
      try {
        prev.disconnect();
      } catch (_) {}
      connections.delete(socket.id);
    }
  });
});

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(200).send('Chạy npm run build hoặc dùng Vite dev + server riêng.');
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Chùa Tịnh Tâm server: http://localhost:${PORT}`);
  console.log('Socket.io + TikTok Live Connector sẵn sàng.');
});
