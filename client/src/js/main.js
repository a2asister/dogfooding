import * as THREE from 'three';

let scene, camera, renderer, cubeGroup, courseMeshes = [];
let targetRotation = 0, currentRotation = 0, velocity = 0;
let isDragging = false, startX = 0, previousX = 0;
let courses = [], categories = [];
let selectedCourse = null;
let raycaster, mouse;
let hoveredFace = null;
let isExploded = false;

const API_BASE = '/api';

async function init() {
  await loadData();
  initThreeJS();
  createTagCloud();
  setupEventListeners();
  animate();
}

async function loadData() {
  try {
    const [coursesRes, categoriesRes] = await Promise.all([
      fetch(`${API_BASE}/courses`),
      fetch(`${API_BASE}/categories`)
    ]);
    courses = await coursesRes.json();
    categories = await categoriesRes.json();
    createCourseCube();
  } catch (error) {
    console.error('加载数据失败:', error);
    createDemoData();
    createCourseCube();
  }
}

function createDemoData() {
  courses = [
    { id: 1, name: 'Vue3 实战进阶', cover: 'https://picsum.photos/400/300?random=1', description: '深入学习 Vue3 Composition API', instructor: '张老师', duration: '48课时' },
    { id: 2, name: 'React Hooks 深度解析', cover: 'https://picsum.photos/400/300?random=2', description: '全面掌握 React Hooks 生态', instructor: '李老师', duration: '36课时' },
    { id: 3, name: 'Node.js 微服务架构', cover: 'https://picsum.photos/400/300?random=3', description: '微服务架构设计与实践', instructor: '王老师', duration: '52课时' },
    { id: 4, name: 'Python 机器学习入门', cover: 'https://picsum.photos/400/300?random=4', description: '从零开始学习机器学习', instructor: '赵老师', duration: '40课时' },
    { id: 5, name: 'Flutter 跨平台开发', cover: 'https://picsum.photos/400/300?random=5', description: '构建高性能跨平台应用', instructor: '陈老师', duration: '44课时' },
    { id: 6, name: 'Unity 3D 游戏开发', cover: 'https://picsum.photos/400/300?random=6', description: '系统学习 Unity 游戏开发', instructor: '刘老师', duration: '60课时' },
  ];
  categories = [
    { id: 0, name: '全部', color: '#6b7280' },
    { id: 1, name: '前端开发', color: '#6366f1' },
    { id: 2, name: '后端开发', color: '#10b981' },
    { id: 3, name: '移动开发', color: '#f59e0b' },
  ];
}

function initThreeJS() {
  const container = document.querySelector('.scene-container');
  const canvas = document.getElementById('cube-canvas');

  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  cubeGroup = new THREE.Group();
  scene.add(cubeGroup);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  window.addEventListener('resize', onWindowResize);
}

function createCourseCube() {
  courseMeshes.forEach(mesh => cubeGroup.remove(mesh));
  courseMeshes = [];

  const size = 2;
  const displayCourses = courses.slice(0, 6);

  while (displayCourses.length < 6) {
    displayCourses.push(displayCourses[displayCourses.length % displayCourses.length]);
  }

  const facePositions = [
    { pos: [0, 0, size / 2], rot: [0, 0, 0] },
    { pos: [0, 0, -size / 2], rot: [0, Math.PI, 0] },
    { pos: [-size / 2, 0, 0], rot: [0, -Math.PI / 2, 0] },
    { pos: [size / 2, 0, 0], rot: [0, Math.PI / 2, 0] },
    { pos: [0, size / 2, 0], rot: [-Math.PI / 2, 0, 0] },
    { pos: [0, -size / 2, 0], rot: [Math.PI / 2, 0, 0] },
  ];

  displayCourses.forEach((course, index) => {
    const geometry = new THREE.PlaneGeometry(size * 0.9, size * 0.7);
    
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#1e1e3f';
    ctx.fillRect(0, 0, 400, 300);
    
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(0, 0, 400, 180);
    
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(course.name, 200, 230);
    
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '16px Arial';
    ctx.fillText(course.instructor || '讲师', 200, 265);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.FrontSide,
      metalness: 0.3,
      roughness: 0.5,
    });

    const mesh = new THREE.Mesh(geometry, material);
    const face = facePositions[index];
    mesh.position.set(...face.pos);
    mesh.rotation.set(...face.rot);
    mesh.userData = { course, originalPosition: mesh.position.clone(), index };
    
    cubeGroup.add(mesh);
    courseMeshes.push(mesh);
  });

  const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(size, size, size));
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.3 });
  const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
  cubeGroup.add(edgeLines);
}

function createTagCloud() {
  const tagCloud = document.getElementById('tag-cloud');
  tagCloud.innerHTML = '';

  const allTag = document.createElement('span');
  allTag.className = 'tag active';
  allTag.textContent = '全部课程';
  allTag.style.backgroundColor = '#6b7280';
  allTag.dataset.categoryId = '';
  allTag.addEventListener('click', () => filterByCategory(''));
  tagCloud.appendChild(allTag);

  categories.forEach(cat => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = cat.name;
    tag.style.backgroundColor = cat.color;
    tag.dataset.categoryId = cat.id;
    tag.addEventListener('click', () => filterByCategory(cat.id));
    tagCloud.appendChild(tag);
  });
}

async function filterByCategory(categoryId) {
  document.querySelectorAll('.tag').forEach(tag => {
    tag.classList.toggle('active', tag.dataset.categoryId == categoryId);
  });

  if (categoryId) {
    try {
      const res = await fetch(`${API_BASE}/courses?categoryId=${categoryId}`);
      courses = await res.json();
    } catch {
      courses = courses.filter(c => c.id % 3 === parseInt(categoryId) % 3);
    }
  } else {
    try {
      const res = await fetch(`${API_BASE}/courses`);
      courses = await res.json();
    } catch {
      createDemoData();
    }
  }

  createCourseCube();
}

function setupEventListeners() {
  const canvas = document.getElementById('cube-canvas');
  const detailEl = document.getElementById('course-detail');
  const closeBtn = document.getElementById('close-detail');

  canvas.addEventListener('mousedown', onDragStart);
  canvas.addEventListener('mousemove', onDragMove);
  canvas.addEventListener('mouseup', onDragEnd);
  canvas.addEventListener('mouseleave', onDragEnd);

  canvas.addEventListener('touchstart', (e) => onDragStart(e.touches[0]));
  canvas.addEventListener('touchmove', (e) => onDragMove(e.touches[0]));
  canvas.addEventListener('touchend', onDragEnd);

  canvas.addEventListener('click', onClick);
  canvas.addEventListener('mousemove', onMouseMove);

  closeBtn.addEventListener('click', closeDetail);
  detailEl.addEventListener('click', (e) => {
    if (e.target === detailEl) closeDetail();
  });
}

function onDragStart(e) {
  isDragging = true;
  startX = e.clientX;
  previousX = e.clientX;
  velocity = 0;
}

function onDragMove(e) {
  if (!isDragging) return;
  const deltaX = e.clientX - previousX;
  previousX = e.clientX;
  targetRotation += deltaX * 0.01;
  velocity = deltaX * 0.02;
}

function onDragEnd() {
  isDragging = false;
}

function onMouseMove(e) {
  const canvas = document.getElementById('cube-canvas');
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(courseMeshes);

  if (hoveredFace && (!intersects.length || intersects[0].object !== hoveredFace)) {
    const originalPos = hoveredFace.userData.originalPosition;
    hoveredFace.position.copy(originalPos);
    hoveredFace = null;
  }

  if (intersects.length > 0 && !isDragging && !isExploded) {
    hoveredFace = intersects[0].object;
    const dir = hoveredFace.position.clone().normalize();
    hoveredFace.position.copy(hoveredFace.userData.originalPosition).add(dir.multiplyScalar(0.3));
  }
}

function onClick(e) {
  if (isDragging || isExploded) return;

  const canvas = document.getElementById('cube-canvas');
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(courseMeshes);

  if (intersects.length > 0) {
    selectedCourse = intersects[0].object.userData.course;
    explodeCube();
    setTimeout(showDetail, 600);
  }
}

function explodeCube() {
  isExploded = true;
  courseMeshes.forEach((mesh, i) => {
    const dir = mesh.position.clone().normalize();
    const targetPos = mesh.userData.originalPosition.clone().add(dir.multiplyScalar(3));
    animatePosition(mesh, targetPos, 0.6, i * 0.05);
  });
}

function animatePosition(mesh, targetPos, duration, delay) {
  const startPos = mesh.position.clone();
  const startTime = performance.now() + delay * 1000;
  
  function update() {
    const elapsed = (performance.now() - startTime) / 1000;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    
    mesh.position.lerpVectors(startPos, targetPos, eased);
    
    if (t < 1) requestAnimationFrame(update);
  }
  update();
}

function showDetail() {
  const detailEl = document.getElementById('course-detail');
  document.getElementById('detail-cover').src = selectedCourse.cover;
  document.getElementById('detail-name').textContent = selectedCourse.name;
  document.getElementById('detail-instructor').textContent = selectedCourse.instructor || '讲师';
  document.getElementById('detail-duration').textContent = selectedCourse.duration || '课时';
  document.getElementById('detail-description').textContent = selectedCourse.description || '暂无描述';
  detailEl.classList.remove('hidden');
}

function closeDetail() {
  const detailEl = document.getElementById('course-detail');
  detailEl.classList.add('hidden');
  
  courseMeshes.forEach((mesh, i) => {
    animatePosition(mesh, mesh.userData.originalPosition, 0.5, i * 0.05);
  });
  
  setTimeout(() => {
    isExploded = false;
  }, 600);
}

function onWindowResize() {
  const container = document.querySelector('.scene-container');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (!isDragging) {
    velocity *= 0.95;
    targetRotation += velocity;
  }

  const snapAngle = Math.PI / 2;
  const snappedTarget = Math.round(targetRotation / snapAngle) * snapAngle;
  const springStrength = isDragging ? 0.1 : 0.05;
  currentRotation += (snappedTarget - currentRotation) * springStrength;

  cubeGroup.rotation.y = currentRotation;

  renderer.render(scene, camera);
}

init();
