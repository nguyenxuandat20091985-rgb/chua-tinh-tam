// ===== Chùa Tịnh Tâm - Client =====
const socket = io();

let myId = null;
let myName = '';
const otherUsers = new Map(); // id -> { mesh, name, color }

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

// ===== Three.js Scene =====
let scene, camera, renderer, clock;
let templeGroup;

function initThree() {
  const container = document.getElementById('canvas-container');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1008);
  scene.fog = new THREE.Fog(0x1a1008, 12, 35);

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 4.5, 14);
  camera.lookAt(0, 2.5, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  clock = new THREE.Clock();

  // Lights
  const ambient = new THREE.AmbientLight(0xffe8c0, 0.55);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffd700, 1.1);
  keyLight.position.set(3, 12, 5);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const fill = new THREE.PointLight(0xffaa44, 0.8, 30);
  fill.position.set(0, 6, -2);
  scene.add(fill);

  const rim = new THREE.PointLight(0xffcc66, 0.5, 20);
  rim.position.set(-4, 5, 4);
  scene.add(rim);

  buildTemple();
  animate();
}

function buildTemple() {
  templeGroup = new THREE.Group();
  scene.add(templeGroup);

  // Floor
  const floorGeo = new THREE.PlaneGeometry(24, 20);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x3d2b1a,
    roughness: 0.85,
    metalness: 0.1
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  templeGroup.add(floor);

  // Red carpet path
  const carpetGeo = new THREE.PlaneGeometry(2.2, 14);
  const carpetMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.7 });
  const carpet = new THREE.Mesh(carpetGeo, carpetMat);
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.set(0, 0.01, 3);
  templeGroup.add(carpet);

  // Back wall
  const wallGeo = new THREE.BoxGeometry(22, 10, 0.4);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0c, roughness: 0.9 });
  const backWall = new THREE.Mesh(wallGeo, wallMat);
  backWall.position.set(0, 5, -6);
  templeGroup.add(backWall);

  // Side walls (simple)
  const sideGeo = new THREE.BoxGeometry(0.3, 10, 18);
  const leftWall = new THREE.Mesh(sideGeo, wallMat);
  leftWall.position.set(-11, 5, 2);
  templeGroup.add(leftWall);
  const rightWall = new THREE.Mesh(sideGeo, wallMat);
  rightWall.position.set(11, 5, 2);
  templeGroup.add(rightWall);

  // Platform / altar
  const platformGeo = new THREE.BoxGeometry(10, 1.2, 4);
  const platformMat = new THREE.MeshStandardMaterial({
    color: 0x5c3d1e,
    roughness: 0.6,
    metalness: 0.2
  });
  const platform = new THREE.Mesh(platformGeo, platformMat);
  platform.position.set(0, 0.6, -3.5);
  platform.castShadow = true;
  templeGroup.add(platform);

  // Buddha statue (simplified golden form)
  const buddhaGroup = new THREE.Group();
  buddhaGroup.position.set(0, 1.2, -4.2);

  // Body
  const bodyGeo = new THREE.CylinderGeometry(0.9, 1.1, 2.2, 16);
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.85,
    roughness: 0.25,
    emissive: 0x332200,
    emissiveIntensity: 0.15
  });
  const body = new THREE.Mesh(bodyGeo, goldMat);
  body.position.y = 1.1;
  body.castShadow = true;
  buddhaGroup.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(0.55, 16, 16);
  const head = new THREE.Mesh(headGeo, goldMat);
  head.position.y = 2.6;
  buddhaGroup.add(head);

  // Halo / aureole
  const haloGeo = new THREE.TorusGeometry(1.4, 0.08, 8, 32);
  const haloMat = new THREE.MeshStandardMaterial({
    color: 0xffe066,
    emissive: 0xffaa00,
    emissiveIntensity: 0.6,
    metalness: 0.5,
    roughness: 0.3
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.y = 2.6;
  halo.rotation.x = Math.PI / 2;
  buddhaGroup.add(halo);

  // Lotus base
  const lotusGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.4, 12);
  const lotusMat = new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.4, roughness: 0.4 });
  const lotus = new THREE.Mesh(lotusGeo, lotusMat);
  lotus.position.y = 0.2;
  buddhaGroup.add(lotus);

  templeGroup.add(buddhaGroup);

  // Incense burner
  const burnerGeo = new THREE.CylinderGeometry(0.4, 0.5, 0.5, 12);
  const burnerMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, metalness: 0.7, roughness: 0.3 });
  const burner = new THREE.Mesh(burnerGeo, burnerMat);
  burner.position.set(0, 1.45, -1.8);
  templeGroup.add(burner);

  // Smoke particles (simple)
  const smokeGeo = new THREE.SphereGeometry(0.15, 6, 6);
  const smokeMat = new THREE.MeshBasicMaterial({
    color: 0xcccccc,
    transparent: true,
    opacity: 0.25
  });
  for (let i = 0; i < 8; i++) {
    const s = new THREE.Mesh(smokeGeo, smokeMat.clone());
    s.position.set(
      (Math.random() - 0.5) * 0.3,
      1.8 + i * 0.35,
      -1.8 + (Math.random() - 0.5) * 0.2
    );
    s.userData.baseY = s.position.y;
    s.userData.phase = Math.random() * Math.PI * 2;
    templeGroup.add(s);
    s.name = 'smoke';
  }

  // Pillars
  const pillarGeo = new THREE.CylinderGeometry(0.25, 0.3, 8, 8);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.7 });
  [-6, -3, 3, 6].forEach((x) => {
    const p = new THREE.Mesh(pillarGeo, pillarMat);
    p.position.set(x, 4, -5.5);
    templeGroup.add(p);
  });

  // Decorative lights (floating)
  const lightGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffcc44 });
  for (let i = 0; i < 12; i++) {
    const l = new THREE.Mesh(lightGeo, lightMat);
    l.position.set(
      (Math.random() - 0.5) * 16,
      3 + Math.random() * 4,
      -4 + Math.random() * 8
    );
    templeGroup.add(l);
  }
}

function createAvatar(color) {
  const group = new THREE.Group();

  // Simple robe body
  const bodyGeo = new THREE.CylinderGeometry(0.28, 0.35, 0.9, 8);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: color || 0x6b8e9f,
    roughness: 0.8
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.45;
  group.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(0.22, 10, 10);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xe8c4a0 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.05;
  group.add(head);

  // Kneeling pose offset
  group.position.y = 0;

  return group;
}

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Animate smoke
  templeGroup.children.forEach((c) => {
    if (c.name === 'smoke') {
      c.position.y = c.userData.baseY + Math.sin(t * 1.5 + c.userData.phase) * 0.15;
      c.position.x += Math.sin(t + c.userData.phase) * 0.002;
      c.material.opacity = 0.15 + Math.sin(t * 2 + c.userData.phase) * 0.1;
    }
  });

  // Gentle camera sway
  camera.position.x = Math.sin(t * 0.15) * 0.4;
  camera.lookAt(0, 2.2, -2);

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== Socket & UI =====
function addMessage({ name, color, text, special }) {
  const div = document.createElement('div');
  div.className = 'msg' + (special ? ' special' : '');
  div.innerHTML = `<span class="name" style="color:${color || '#ffd700'}">${escapeHtml(name)}</span> ${escapeHtml(text)}`;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  // Limit messages
  while (messagesEl.children.length > 40) {
    messagesEl.removeChild(messagesEl.firstChild);
  }
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

joinBtn.addEventListener('click', () => {
  myName = nameInput.value.trim() || 'Phật tử';
  joinScreen.classList.add('hidden');
  appEl.classList.remove('hidden');
  myNameEl.textContent = myName;

  initThree();

  socket.emit('join', { name: myName });
});

nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') joinBtn.click();
});

socket.on('connect', () => {
  myId = socket.id;
});

socket.on('users', (list) => {
  list.forEach((u) => {
    if (u.id === myId) return;
    addOtherUser(u);
  });
});

socket.on('user-joined', (u) => {
  if (u.id === myId) return;
  addOtherUser(u);
  addMessage({ name: 'Hệ thống', color: '#aaa', text: `${u.name} đã vào chùa`, special: false });
});

socket.on('user-left', (id) => {
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

socket.on('chat', (msg) => {
  addMessage(msg);
});

socket.on('online-count', (n) => {
  onlineCountEl.textContent = `${n} người`;
});

function addOtherUser(u) {
  if (otherUsers.has(u.id)) return;
  const mesh = createAvatar(u.color);
  mesh.position.set(u.x, 0, u.z);
  scene.add(mesh);
  otherUsers.set(u.id, { mesh, name: u.name, color: u.color });
}

// Chat send
function sendChat() {
  const text = chatInput.value.trim();
  if (!text) return;
  socket.emit('chat', text);
  chatInput.value = '';
}

sendBtn.addEventListener('click', sendChat);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendChat();
});

// Quick pray
document.querySelectorAll('.pray-buttons button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.pray;
    socket.emit('pray', type);
  });
});

// Focus name input on load
nameInput.focus();
