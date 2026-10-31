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

const users = new Map(); // socketId -> { id, name, x, z, color, joinedAt }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (data) => {
    const name = (data.name || 'Phật tử').trim().slice(0, 20) || 'Phật tử';
    const color = data.color || '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    // Random position in the hall (kneeling area)
    const x = (Math.random() - 0.5) * 8;
    const z = 2 + Math.random() * 6;

    const user = {
      id: socket.id,
      name,
      x,
      z,
      color,
      joinedAt: Date.now()
    };
    users.set(socket.id, user);

    // Send current users to the new joiner
    socket.emit('users', Array.from(users.values()));
    // Notify everyone else
    socket.broadcast.emit('user-joined', user);
    // Broadcast online count
    io.emit('online-count', users.size);
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

  socket.on('move', (pos) => {
    const user = users.get(socket.id);
    if (!user) return;
    user.x = pos.x;
    user.z = pos.z;
    socket.broadcast.emit('user-moved', { id: socket.id, x: pos.x, z: pos.z });
  });

  socket.on('disconnect', () => {
    users.delete(socket.id);
    io.emit('user-left', socket.id);
    io.emit('online-count', users.size);
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Chùa Tịnh Tâm đang mở tại http://localhost:${PORT}`);
});
