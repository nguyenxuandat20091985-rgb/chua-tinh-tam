// ===== Chùa Tịnh Tâm - Client (Upgraded) =====
const socket = io();

let myId = null;
let myName = '';
const otherUsers = new Map();

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

// ===== Three.js =====
let scene, camera, renderer, clock;
let templeGroup;

function initThree() {
  const container = document.getElementById('canvas-container');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1008);
  scene.fog = new THREE.Fog(0x1a1008, 14, 38);

  camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 4.2, 13.5);
  camera.lookAt(0, 2.3, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  clock = new THREE.Clock();

  const ambient = new THREE.AmbientLight(0xffe8c0, 0.5);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffd700, 1.15);
  keyLight.position.set(3, 12, 5);
  scene.add(keyLight);

  const fill = new THREE.PointLight(0xffaa44, 0.85, 32);
  fill.position.set(0, 6, -2);
  scene.add(fill);

  const rim = new THREE.PointLight(0xffcc66, 0.45, 22);
  rim.position.set(-5, 5, 4);
  scene.add(rim);

  buildTemple();
  animate();
}

function buildTemple() {
  templeGroup = new THREE.Group();
  scene.add(templeGroup);

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(26, 22),
    new THREE.MeshStandardMaterial({ color: 0x3d2b1a, roughness: 0.88 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  templeGroup.add(floor);

  // Red carpet
  const carpet = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 15),
    new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.65 })
  );
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.set(0, 0.015, 2.5);
  templeGroup.add(carpet);

  // Walls
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0c, roughness: 0.9 });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 11, 0.4), wallMat);
  backWall.position.set(0, 5.5, -6.5);
  templeGroup.add(backWall);

  [-11.5, 11.5].forEach(x => {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.35, 11, 20), wallMat);
    side.position.set(x, 5.5, 2);
    templeGroup.add(side);
  });

  // Platform
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(11, 1.3, 4.2),
    new THREE.MeshStandardMaterial({ color: 0x5c3d1e, roughness: 0.55, metalness: 0.25 })
  );
  platform.position.set(0, 0.65, -3.8);
  templeGroup.add(platform);

  // Buddha
  const buddha = new THREE.Group();
  buddha.position.set(0, 1.3, -4.5);

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.88,
    roughness: 0.22,
    emissive: 0x332200,
    emissiveIntensity: 0.18
  });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 2.4, 18), goldMat);
  body.position.y = 1.2;
  buddha.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.58, 18, 18), goldMat);
  head.position.y = 2.85;
  buddha.add(head);

  // Halo
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.09, 10, 36),
    new THREE.MeshStandardMaterial({
      color: 0xffe066,
      emissive: 0xffaa00,
      emissiveIntensity: 0.7,
      metalness: 0.5,
      roughness: 0.25
    })
  );
  halo.position.y = 2.85;
  halo.rotation.x = Math.PI / 2;
  buddha.add(halo);

  // Lotus base
  const lotus = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.7, 0.45, 14),
    new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.45, roughness: 0.35 })
  );
  lotus.position.y = 0.22;
  buddha.add(lotus);

  templeGroup.add(buddha);

  // Incense burner
  const burner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.52, 0.55, 14),
    new THREE.MeshStandardMaterial({ color: 0x8b6914, metalness: 0.75, roughness: 0.28 })
  );
  burner.position.set(0, 1.55, -2.0);
  templeGroup.add(burner);

  // Smoke
  for (let i = 0; i < 10; i++) {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.22 })
    );
    s.position.set((Math.random()-0.5)*0.35, 1.9 + i*0.32, -2.0 + (Math.random()-0.5)*0.2);
    s.userData = { baseY: s.position.y, phase: Math.random()*Math.PI*2 };
    s.name = 'smoke';
    templeGroup.add(s);
  }

  // Pillars
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.7 });
  [-6.5, -3.2, 3.2, 6.5].forEach(x => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 9, 10), pillarMat);
    p.position.set(x, 4.5, -6);
    templeGroup.add(p);
  });

  // Floating lights
  for (let i = 0; i < 14; i++) {
    const l = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffcc44 })
    );
    l.position.set((Math.random()-0.5)*18, 3+Math.random()*5, -5+Math.random()*10);
    templeGroup.add(l);
  }
}

function createAvatar(color, isHost = false) {
  const group = new THREE.Group();

  // Robe (áo lam)
  const robeColor = isHost ? 0xd4c4a8 : (color || 0x7a9aab);
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.38, 0.95, 10),
    new THREE.MeshStandardMaterial({ color: robeColor, roughness: 0.8 })
  );
  body.position.y = 0.48;
  group.add(body);

  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.23, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xe8c4a0 })
  );
  head.position.y = 1.1;
  group.add(head);

  // Simple hair bun
  const bun = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );
  bun.position.set(0, 1.28, -0.05);
  group.add(bun);

  if (isHost) {
    // Host stands a bit taller / different pose marker
    group.scale.set(1.15, 1.15, 1.15);
  }

  return group;
}

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  templeGroup.children.forEach(c => {
    if (c.name === 'smoke') {
      c.position.y = c.userData.baseY + Math.sin(t * 1.6 + c.userData.phase) * 0.18;
      c.position.x += Math.sin(t + c.userData.phase) * 0.0018;
      c.material.opacity = 0.12 + Math.sin(t * 2.2 + c.userData.phase) * 0.1;
    }
  });

  camera.position.x = Math.sin(t * 0.12) * 0.35;
  camera.lookAt(0, 2.1, -2.2);

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== UI & Socket =====
function addMessage({ name, color, text, special }) {
  const div = document.createElement('div');
  div.className = 'msg' + (special ? ' special' : '');
  div.innerHTML = `<span class="name" style="color:${color || '#ffd700'}">${escapeHtml(name)}</span> ${escapeHtml(text)}`;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  while (messagesEl.children.length > 45) {
    messagesEl.removeChild(messagesEl.firstChild);
  }
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function updateRanking(list) {
  rankListEl.innerHTML = '';
  if (!list || list.length === 0) {
    rankListEl.innerHTML = '<div style="opacity:0.6;text-align:center;padding:6px 0">Chưa có</div>';
    return;
  }
  list.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'rank-item' + (i === 0 ? ' top1' : i === 1 ? ' top2' : i === 2 ? ' top3' : '');
    div.innerHTML = `
      <span class="rank-num">${item.rank}</span>
      <span class="rank-name">${escapeHtml(item.name)}</span>
      <span class="rank-coins">${item.coins}</span>
    `;
    rankListEl.appendChild(div);
  });
}

function showDonationEffect(data) {
  donationEffect.innerHTML = `
    <span class="emoji">${data.emoji}</span>
    <div class="text">${escapeHtml(data.name)} • ${data.label}</div>
  `;
  donationEffect.classList.remove('hidden');
  clearTimeout(donationEffect._timer);
  donationEffect._timer = setTimeout(() => {
    donationEffect.classList.add('hidden');
  }, 2500);
}

joinBtn.addEventListener('click', () => {
  myName = nameInput.value.trim() || 'Phật tử';
  joinScreen.classList.add('hidden');
  appEl.classList.remove('hidden');
  myNameEl.textContent = myName;

  initThree();
  socket.emit('join', { name: myName });
});

nameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') joinBtn.click();
});

socket.on('connect', () => { myId = socket.id; });

socket.on('users', list => {
  list.forEach(u => {
    if (u.id === myId) return;
    addOtherUser(u);
  });
});

socket.on('user-joined', u => {
  if (u.id === myId) return;
  addOtherUser(u);
  addMessage({ name: 'Hệ thống', color: '#aaa', text: `${u.name} đã vào chùa` });
});

socket.on('user-left', id => {
  const data = otherUsers.get(id);
  if (data) {
    scene.remove(data.mesh);
    otherUsers.delete(id);
  }
});

socket.on('user-moved', ({ id, x, z }) => {
  const data = otherUsers.get(id);
  if (data) {
    data.mesh.position.x = x;
    data.mesh.position.z = z;
  }
});

socket.on('chat', msg => addMessage(msg));

socket.on('online-count', n => {
  onlineCountEl.textContent = `${n} người`;
});

socket.on('ranking', list => updateRanking(list));

socket.on('donation', data => {
  showDonationEffect(data);
});

socket.on('new-host', ({ id, name }) => {
  // Could update avatar scale if needed
});

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
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendChat();
});

document.querySelectorAll('.pray-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    socket.emit('pray', btn.dataset.pray);
  });
});

document.querySelectorAll('.donate-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    socket.emit('donate', btn.dataset.donate);
  });
});

nameInput.focus();
