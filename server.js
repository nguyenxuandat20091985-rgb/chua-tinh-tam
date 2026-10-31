const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.static(path.join(__dirname, 'public')));

// users: socketId -> { id, name, x, z, color, coins, isHost }
const users = new Map();

// ranking: name -> total coins donated (persists while server runs)
const ranking = new Map();

function getTopRanking(limit = 10) {
  return Array.from(ranking.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, coins], i) => ({ rank: i + 1, name, coins }));
}

function broadcastRanking() {
  io.emit('ranking', getTopRanking());
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (data) => {
    const name = (data.name || 'Phật tử').trim().slice(0, 20) || 'Phật tử';
    const color = data.color || '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const x = (Math.random() - 0.5) * 8;
    const z = 2 + Math.random() * 6;

    // First user becomes host if no host yet
    let isHost = false;
    const hasHost = Array.from(users.values()).some(u => u.isHost);
    if (!hasHost) isHost = true;

    const user = {
      id: socket.id,
      name,
      x,
      z,
      color,
      coins: 0,
      isHost,
      joinedAt: Date.now()
    };
    users.set(socket.id, user);

    // Init ranking entry
    if (!ranking.has(name)) ranking.set(name, 0);

    socket.emit('users', Array.from(users.values()));
    socket.emit('ranking', getTopRanking());
    socket.broadcast.emit('user-joined', user);
    io.emit('online-count', users.size);

    if (isHost) {
      io.emit('chat', {
        id: 'system',
        name: 'Hệ thống',
        color: '#ffd700',
        text: `${name} đã trở thành Host (chủ trì)`,
        time: Date.now(),
        special: true
      });
    }
  });

  socket.on('chat', (msg) => {
    const user = users.get(socket.id);
    if (!user) return;
    const text = String(msg || '').trim().slice(0, 120);
    if (!text) return;
    io.emit('chat', {
      id: socket.id,
      name: user.name,
      color: user.color,
      text,
      time: Date.now()
    });
  });

  socket.on('pray', (type) => {
    const user = users.get(socket.id);
    if (!user) return;
    const messages = {
      nammo: 'Nam Mô A Di Đà Phật 🙏',
      an: 'Cầu gia đình bình an',
      loc: 'Cầu lộc, cầu tài',
      suc: 'Cầu sức khỏe',
      hoa: 'Cúng hoa 🌺'
    };
    const text = messages[type] || 'Nam Mô A Di Đà Phật';
    io.emit('chat', {
      id: socket.id,
      name: user.name,
      color: user.color,
      text,
      time: Date.now(),
      special: true
    });
  });

  // === CÚNG DƯỠNG ===
  socket.on('donate', (type) => {
    const user = users.get(socket.id);
    if (!user) return;

    const packages = {
      huong: { coins: 1, label: 'Đăng hương', emoji: '🕯️' },
      lephat: { coins: 2, label: 'Lễ Phật', emoji: '🙏' },
      hoasen: { coins: 10, label: 'Hoa sen', emoji: '🌺' }
    };

    const pkg = packages[type];
    if (!pkg) return;

    user.coins += pkg.coins;
    const total = (ranking.get(user.name) || 0) + pkg.coins;
    ranking.set(user.name, total);

    // Broadcast donation event (for effects)
    io.emit('donation', {
      id: socket.id,
      name: user.name,
      color: user.color,
      type,
      coins: pkg.coins,
      label: pkg.label,
      emoji: pkg.emoji,
      total
    });

    // Chat notification
    io.emit('chat', {
      id: socket.id,
      name: user.name,
      color: user.color,
      text: `${pkg.emoji} đã cúng ${pkg.label} (+${pkg.coins} tâm)`,
      time: Date.now(),
      special: true
    });

    broadcastRanking();
  });

  socket.on('move', (pos) => {
    const user = users.get(socket.id);
    if (!user) return;
    user.x = pos.x;
    user.z = pos.z;
    socket.broadcast.emit('user-moved', { id: socket.id, x: pos.x, z: pos.z });
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    users.delete(socket.id);
    io.emit('user-left', socket.id);
    io.emit('online-count', users.size);

    // If host left, assign new host
    if (user && user.isHost) {
      const next = users.values().next().value;
      if (next) {
        next.isHost = true;
        io.emit('new-host', { id: next.id, name: next.name });
        io.emit('chat', {
          id: 'system',
          name: 'Hệ thống',
          color: '#ffd700',
          text: `${next.name} đã trở thành Host mới`,
          time: Date.now(),
          special: true
        });
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Chùa Tịnh Tâm đang mở tại http://localhost:${PORT}`);
});
