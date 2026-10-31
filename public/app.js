// ===== Chùa Tịnh Tâm - Visual Upgrade =====
const socket = io();

let myId = null;
let myName = '';
const otherUsers = new Map();
let npcAvatars = [];

// DOM
const joinScreen = document.getElementById('join-screen');
const appEl = document.getElementById('app');
const nameInput = document.getElementById('name-input');
const joinBtn = document.getElementById('join-btn');
const messagesEl = document.getElementById('messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const onlineCountEl = document.getElementById('online-count');
const myNameEl = document.getElementById('my-name');
const rankListEl = document.getElementById('rank-list');
const donationEffect = document.getElementById('donation-effect');
const floatingNames = document.getElementById('floating-names');

// Three.js
let scene, camera, renderer, clock;
let templeGroup;

function initThree() {
  const container = document.getElementById('canvas-container');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a0f08);
  scene.fog = new THREE.Fog(0x1a0f08, 16, 42);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 5.2, 15.5);
  camera.lookAt(0, 2.8, -1);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  clock = new THREE.Clock();

  // Lights - warmer & stronger
  scene.add(new THREE.AmbientLight(0xffe4b5, 0.48));
  const key = new THREE.DirectionalLight(0xffd700, 1.25);
  key.position.set(4, 14, 6);
  scene.add(key);
  const fill = new THREE.PointLight(0xffaa33, 1.0, 35);
  fill.position.set(0, 7, -1);
  scene.add(fill);
  const rim = new THREE.PointLight(0xffcc55, 0.55, 25);
  rim.position.set(-6, 6, 5);
  scene.add(rim);
  // Extra glow near Buddha
  const buddhaGlow = new THREE.PointLight(0xffcc44, 0.7, 12);
  buddhaGlow.position.set(0, 5, -4);
  scene.add(buddhaGlow);

  buildTemple();
  spawnDenseNPCs();
  animate();
}

function buildTemple() {
  templeGroup = new THREE.Group();
  scene.add(templeGroup);

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 24),
    new THREE.MeshStandardMaterial({ color: 0x3a2818, roughness: 0.9 })
  );
  floor.rotation.x = -Math.PI / 2;
  templeGroup.add(floor);

  // Red carpet with pattern feel
  const carpet = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 16),
    new THREE.MeshStandardMaterial({ color: 0x9b0000, roughness: 0.6, metalness: 0.1 })
  );
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.set(0, 0.02, 2.8);
  templeGroup.add(carpet);

  // Walls
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x27180c, roughness: 0.92 });
  const back = new THREE.Mesh(new THREE.BoxGeometry(26, 12, 0.5), wallMat);
  back.position.set(0, 6, -7);
  templeGroup.add(back);
  [-12.5, 12.5].forEach(x => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.4, 12, 22), wallMat);
    s.position.set(x, 6, 2);
    templeGroup.add(s);
  });

  // Platform
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(12, 1.4, 4.5),
    new THREE.MeshStandardMaterial({ color: 0x5a3a1c, roughness: 0.5, metalness: 0.3 })
  );
  platform.position.set(0, 0.7, -4);
  templeGroup.add(platform);

  // Buddha group
  const buddha = new THREE.Group();
  buddha.position.set(0, 1.4, -4.8);

  const gold = new THREE.MeshStandardMaterial({
    color: 0xffd700, metalness: 0.9, roughness: 0.18,
    emissive: 0x442200, emissiveIntensity: 0.22
  });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, 2.6, 20), gold);
  body.position.y = 1.3;
  buddha.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 20), gold);
  head.position.y = 3.05;
  buddha.add(head);

  // Big halo
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(1.7, 0.1, 12, 40),
    new THREE.MeshStandardMaterial({
      color: 0xffe066, emissive: 0xffaa00, emissiveIntensity: 0.85,
      metalness: 0.55, roughness: 0.2
    })
  );
  halo.position.y = 3.05;
  halo.rotation.x = Math.PI / 2;
  buddha.add(halo);

  // Lotus
  const lotus = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.85, 0.5, 16),
    new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.5, roughness: 0.3 })
  );
  lotus.position.y = 0.25;
  buddha.add(lotus);

  templeGroup.add(buddha);

  // Incense
  const burner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.55, 0.6, 14),
    new THREE.MeshStandardMaterial({ color: 0x8b6914, metalness: 0.8, roughness: 0.25 })
  );
  burner.position.set(0, 1.65, -2.2);
  templeGroup.add(burner);

  // Smoke particles
  for (let i = 0; i < 14; i++) {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(0.13 + Math.random()*0.06, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xddddee, transparent: true, opacity: 0.2 })
    );
    s.position.set((Math.random()-0.5)*0.4, 2.0 + i*0.28, -2.2 + (Math.random()-0.5)*0.25);
    s.userData = { baseY: s.position.y, phase: Math.random()*Math.PI*2 };
    s.name = 'smoke';
    templeGroup.add(s);
  }

  // Pillars
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.65 });
  [-7, -3.5, 3.5, 7].forEach(x => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 10, 12), pillarMat);
    p.position.set(x, 5, -6.5);
    templeGroup.add(p);
  });

  // Floating golden lights
  for (let i = 0; i < 18; i++) {
    const l = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffcc44 })
    );
    l.position.set((Math.random()-0.5)*20, 3.5+Math.random()*5, -6+Math.random()*12);
    templeGroup.add(l);
  }

  // Red cushions on platform
  const cushionMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.7 });
  [-2.8, -1.4, 1.4, 2.8].forEach(x => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.18, 12), cushionMat);
    c.position.set(x, 1.5, -3.2);
    templeGroup.add(c);
  });
}

// Dense NPC crowd for visual density (like TikTok)
function spawnDenseNPCs() {
  const robeColors = [0x7a9aab, 0x6b8e9f, 0x8aa5b5, 0x5d7a8a, 0x9bb0be];
  // Left side rows
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 9; col++) {
      const x = -1.8 - col * 0.85 - (row % 2) * 0.3;
      const z = 1.5 + row * 1.15 + Math.random() * 0.2;
      const mesh = createAvatar(robeColors[Math.floor(Math.random()*robeColors.length)]);
      mesh.position.set(x, 0, z);
      mesh.rotation.y = Math.random() * 0.15 - 0.07;
      scene.add(mesh);
      npcAvatars.push(mesh);
    }
  }
  // Right side rows
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 9; col++) {
      const x = 1.8 + col * 0.85 + (row % 2) * 0.3;
      const z = 1.5 + row * 1.15 + Math.random() * 0.2;
      const mesh = createAvatar(robeColors[Math.floor(Math.random()*robeColors.length)]);
      mesh.position.set(x, 0, z);
      mesh.rotation.y = Math.random() * 0.15 - 0.07;
      scene.add(mesh);
      npcAvatars.push(mesh);
    }
  }
  // Front center few
  for (let i = 0; i < 6; i++) {
    const mesh = createAvatar(0x8aa5b5);
    mesh.position.set((Math.random()-0.5)*1.6, 0, 0.8 + i * 0.9);
    scene.add(mesh);
    npcAvatars.push(mesh);
  }
}

function createAvatar(color, isHost = false) {
  const group = new THREE.Group();
  const robeColor = isHost ? 0xd4c4a8 : (color || 0x7a9aab);

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.36, 0.9, 10),
    new THREE.MeshStandardMaterial({ color: robeColor, roughness: 0.82 })
  );
  body.position.y = 0.45;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xe8c4a0 })
  );
  head.position.y = 1.05;
  group.add(head);

  const bun = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
  );
  bun.position.set(0, 1.22, -0.04);
  group.add(bun);

  if (isHost) group.scale.set(1.2, 1.2, 1.2);
  return group;
}

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  templeGroup.children.forEach(c => {
    if (c.name === 'smoke') {
      c.position.y = c.userData.baseY + Math.sin(t * 1.5 + c.userData.phase) * 0.2;
      c.position.x += Math.sin(t * 0.8 + c.userData.phase) * 0.0015;
      c.material.opacity = 0.1 + Math.sin(t * 2 + c.userData.phase) * 0.1;
    }
  });

  // Subtle camera breathe
  camera.position.x = Math.sin(t * 0.1) * 0.3;
  camera.position.y = 5.2 + Math.sin(t * 0.15) * 0.08;
  camera.lookAt(0, 2.6, -1.5);

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== Floating name effect =====
function spawnFloatingName(name, color) {
  const el = document.createElement('div');
  el.className = 'float-name';
  el.textContent = name;
  el.style.color = color || '#ffd700';
  el.style.left = (20 + Math.random() * 60) + '%';
  el.style.top = (35 + Math.random() * 30) + '%';
  floatingNames.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

// Random floating names to simulate dense live (like TikTok)
const sampleNames = ['Huymoew','Bì','vanthuan','La','Thủy','Chương Vân','Anh Thu','Ngọc','Hoàng An','Minh','Hải','Yến Nhi','Bình An','Tấn Lộc','Phương','Hằng','Quang','Kim','Đức'];
setInterval(() => {
  if (appEl.classList.contains('hidden')) return;
  const n = sampleNames[Math.floor(Math.random() * sampleNames.length)];
  spawnFloatingName(n, '#' + Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0'));
}, 1800);

// ===== UI & Socket =====
function addMessage({ name, color, text, special }) {
  const div = document.createElement('div');
  div.className = 'msg' + (special ? ' special' : '');
  div.innerHTML = `<span class="name" style="color:${color||'#ffd700'}">${escapeHtml(name)}</span> ${escapeHtml(text)}`;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  while (messagesEl.children.length > 40) messagesEl.removeChild(messagesEl.firstChild);
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function updateRanking(list) {
  rankListEl.innerHTML = '';
  if (!list || !list.length) {
    rankListEl.innerHTML = '<div style="opacity:.55;text-align:center;padding:5px 0">Chưa có</div>';
    return;
  }
  list.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'rank-item' + (i===0?' top1':i===1?' top2':i===2?' top3':'');
    div.innerHTML = `<span class="rank-num">${item.rank}</span><span class="rank-name">${escapeHtml(item.name)}</span><span class="rank-coins">${item.coins}</span>`;
    rankListEl.appendChild(div);
  });
}

function showDonationEffect(data) {
  donationEffect.innerHTML = `<span class="emoji">${data.emoji}</span><div class="text">${escapeHtml(data.name)} • ${data.label}</div>`;
  donationEffect.classList.remove('hidden');
  clearTimeout(donationEffect._timer);
  donationEffect._timer = setTimeout(() => donationEffect.classList.add('hidden'), 2800);
  spawnFloatingName(data.name + ' ' + data.emoji, data.color);
}

joinBtn.addEventListener('click', () => {
  myName = nameInput.value.trim() || 'Phật tử';
  joinScreen.classList.add('hidden');
  appEl.classList.remove('hidden');
  myNameEl.textContent = myName;
  initThree();
  socket.emit('join', { name: myName });
});

nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') joinBtn.click(); });

socket.on('connect', () => { myId = socket.id; });

socket.on('users', list => {
  list.forEach(u => { if (u.id !== myId) addOtherUser(u); });
});

socket.on('user-joined', u => {
  if (u.id === myId) return;
  addOtherUser(u);
  addMessage({ name: 'Hệ thống', color: '#aaa', text: u.name + ' đã vào chùa' });
  spawnFloatingName(u.name, u.color);
});

socket.on('user-left', id => {
  const d = otherUsers.get(id);
  if (d) { scene.remove(d.mesh); otherUsers.delete(id); }
});

socket.on('user-moved', ({ id, x, z }) => {
  const d = otherUsers.get(id);
  if (d) { d.mesh.position.x = x; d.mesh.position.z = z; }
});

socket.on('chat', msg => {
  addMessage(msg);
  if (msg.special) spawnFloatingName(msg.name, msg.color);
});

socket.on('online-count', n => {
  // Show higher number for atmosphere (real + NPCs visual)
  onlineCountEl.textContent = (n + 80 + Math.floor(Math.random()*30)) + ' người';
});

socket.on('ranking', list => updateRanking(list));
socket.on('donation', data => showDonationEffect(data));

function addOtherUser(u) {
  if (otherUsers.has(u.id)) return;
  const mesh = createAvatar(u.color, u.isHost);
  mesh.position.set(u.x, 0, u.z);
  scene.add(mesh);
  otherUsers.set(u.id, { mesh, name: u.name, color: u.color });
}

function sendChat() {
  const text = chatInput.value.trim();
  if (!text) return;
  socket.emit('chat', text);
  chatInput.value = '';
}

sendBtn.addEventListener('click', sendChat);
chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });

document.querySelectorAll('.pray-buttons button').forEach(btn => {
  btn.addEventListener('click', () => socket.emit('pray', btn.dataset.pray));
});

document.querySelectorAll('.donate-btn').forEach(btn => {
  btn.addEventListener('click', () => socket.emit('donate', btn.dataset.donate));
});

nameInput.focus();
