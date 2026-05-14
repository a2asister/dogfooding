<template>
  <div class="periodic-table-3d" ref="containerRef">
    <canvas ref="canvasRef"></canvas>
    <div class="controls">
      <div class="control-hint">
        <span>🖱️ 左键拖拽旋转 | 滚轮缩放</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { useElementStore } from '@/stores/elementStore';
import type { Element } from '@/types/element';

const emit = defineEmits<{
  (e: 'select-element', element: Element): void;
}>();

const containerRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();
const store = useElementStore();

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let animationId: number;
let raycaster: THREE.Raycaster;
let mouse: THREE.Vector2;
let elementMeshes: Map<number, THREE.Mesh> = new Map();
let particleSystems: THREE.Points[] = [];
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationVelocity = { x: 0, y: 0 };
let targetRotation = { x: 0.3, y: 0 };

function init() {
  if (!containerRef.value || !canvasRef.value) return;

  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.z = 30;

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0x00d4ff, 1, 100);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);

  const pointLight2 = new THREE.PointLight(0x7b2cbf, 0.8, 100);
  pointLight2.position.set(-10, -10, 10);
  scene.add(pointLight2);

  createElements();
  createParticles();

  window.addEventListener('resize', handleResize);
  canvasRef.value.addEventListener('mousedown', handleMouseDown);
  canvasRef.value.addEventListener('mousemove', handleMouseMove);
  canvasRef.value.addEventListener('mouseup', handleMouseUp);
  canvasRef.value.addEventListener('mouseleave', handleMouseUp);
  canvasRef.value.addEventListener('wheel', handleWheel);
  canvasRef.value.addEventListener('click', handleClick);

  animate();
}

function createElements() {
  if (!scene) return;
  
  const cubeSize = 1.2;
  const spacing = 1.6;
  const startX = -9 * spacing;
  const startY = 2 * spacing;

  store.elements.forEach((element) => {
    const group = element.group || 1;
    const period = element.period || 1;
    
    const x = startX + (group - 1) * spacing;
    const y = startY - (period - 1) * spacing;
    const z = 0;

    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const color = element.color ? new THREE.Color(element.color) : new THREE.Color(0x666666);
    
    const material = new THREE.MeshPhongMaterial({
      color: color,
      transparent: true,
      opacity: 0.85,
      shininess: 100,
      emissive: color,
      emissiveIntensity: 0.2,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.userData = { element, baseY: y, isHovered: false };
    
    scene.add(mesh);
    elementMeshes.set(element.id, mesh);

    createAtomParticles(mesh.position, color);
  });
}

function createAtomParticles(position: THREE.Vector3, color: THREE.Color) {
  if (!scene) return;
  
  const particleCount = 8;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 0.8 + Math.random() * 0.3;
    positions[i * 3] = position.x + Math.cos(angle) * radius;
    positions[i * 3 + 1] = position.y + Math.sin(angle) * radius;
    positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.3;
    
    velocities[i * 3] = Math.random() * 0.02 - 0.01;
    velocities[i * 3 + 1] = Math.random() * 0.02 - 0.01;
    velocities[i * 3 + 2] = Math.random() * 0.02 - 0.01;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const material = new THREE.PointsMaterial({
    color: color,
    size: 0.1,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geometry, material);
  particles.userData = { basePosition: position.clone(), velocities };
  scene.add(particles);
  particleSystems.push(particles);
}

function createParticles() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 500;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.05,
    transparent: true,
    opacity: 0.6,
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

function animate() {
  if (!scene || !camera || !renderer) return;
  
  animationId = requestAnimationFrame(animate);

  const time = Date.now() * 0.001;

  elementMeshes.forEach((mesh, id) => {
    const element = mesh.userData.element as Element;
    const baseY = mesh.userData.baseY as number;
    const isHovered = mesh.userData.isHovered as boolean;

    mesh.rotation.x += 0.003;
    mesh.rotation.y += 0.005;

    const floatOffset = Math.sin(time * 2 + id * 0.5) * 0.15;
    mesh.position.y = baseY + floatOffset;

    if (isHovered) {
      mesh.scale.setScalar(1.2);
      mesh.position.z = 1.5;
      (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.6;
    } else {
      mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, 0, 0.1);
      (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.2;
    }
  });

  particleSystems.forEach((system, index) => {
    const positions = system.geometry.attributes.position.array as Float32Array;
    const basePosition = system.userData.basePosition as THREE.Vector3;
    const velocities = system.userData.velocities as Float32Array;
    const angle = time + index * 0.5;

    for (let i = 0; i < positions.length / 3; i++) {
      const particleAngle = angle + (i / 8) * Math.PI * 2;
      const radius = 0.8 + Math.sin(time * 2 + i) * 0.2;
      
      positions[i * 3] = basePosition.x + Math.cos(particleAngle) * radius + velocities[i * 3] * 10;
      positions[i * 3 + 1] = basePosition.y + Math.sin(particleAngle) * radius + velocities[i * 3 + 1] * 10;
      positions[i * 3 + 2] = basePosition.z + Math.sin(time * 3 + i) * 0.3;
    }
    
    system.geometry.attributes.position.needsUpdate = true;
  });

  targetRotation.y += 0.001;

  if (!isDragging) {
    rotationVelocity.x *= 0.95;
    rotationVelocity.y *= 0.95;
  }

  scene.rotation.x += rotationVelocity.x;
  scene.rotation.y += rotationVelocity.y + 0.002;

  renderer.render(scene, camera);
}

function handleResize() {
  if (!containerRef.value || !camera || !renderer) return;
  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function handleMouseDown(event: MouseEvent) {
  isDragging = true;
  previousMousePosition = { x: event.clientX, y: event.clientY };
}

function handleMouseMove(event: MouseEvent) {
  if (!canvasRef.value || !camera || !raycaster) return;
  
  const rect = canvasRef.value.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  if (isDragging) {
    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;
    
    rotationVelocity.y = deltaX * 0.005;
    rotationVelocity.x = deltaY * 0.005;
    
    previousMousePosition = { x: event.clientX, y: event.clientY };
  }

  raycaster.setFromCamera(mouse, camera);
  const meshes = Array.from(elementMeshes.values());
  const intersects = raycaster.intersectObjects(meshes);

  meshes.forEach(mesh => {
    mesh.userData.isHovered = false;
  });

  if (intersects.length > 0) {
    const mesh = intersects[0].object as THREE.Mesh;
    mesh.userData.isHovered = true;
  }
}

function handleMouseUp() {
  isDragging = false;
}

function handleWheel(event: WheelEvent) {
  if (!camera) return;
  event.preventDefault();
  camera.position.z += event.deltaY * 0.05;
  camera.position.z = Math.max(15, Math.min(50, camera.position.z));
}

function handleClick(event: MouseEvent) {
  if (!canvasRef.value || !camera || !raycaster) return;
  if (Math.abs(rotationVelocity.x) > 0.01 || Math.abs(rotationVelocity.y) > 0.01) return;

  const rect = canvasRef.value.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const meshes = Array.from(elementMeshes.values());
  const intersects = raycaster.intersectObjects(meshes);

  if (intersects.length > 0) {
    const mesh = intersects[0].object as THREE.Mesh;
    const element = mesh.userData.element as Element;
    emit('select-element', element);
  }
}

watch(() => store.elements, () => {
  if (!scene) return;
  
  elementMeshes.forEach(mesh => scene.remove(mesh));
  particleSystems.forEach(system => scene.remove(system));
  elementMeshes.clear();
  particleSystems = [];
  createElements();
}, { deep: true });

onMounted(() => {
  if (store.elements.length > 0) {
    init();
  } else {
    const unwatch = watch(() => store.elements.length, (length) => {
      if (length > 0) {
        init();
        unwatch();
      }
    });
  }
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
  window.removeEventListener('resize', handleResize);
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('mousedown', handleMouseDown);
    canvasRef.value.removeEventListener('mousemove', handleMouseMove);
    canvasRef.value.removeEventListener('mouseup', handleMouseUp);
    canvasRef.value.removeEventListener('mouseleave', handleMouseUp);
    canvasRef.value.removeEventListener('wheel', handleWheel);
    canvasRef.value.removeEventListener('click', handleClick);
  }
  renderer?.dispose();
});
</script>

<style scoped lang="scss">
.periodic-table-3d {
  flex: 1;
  width: 100%;
  position: relative;
  overflow: hidden;

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }
}

.controls {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  z-index: 10;
}

.control-hint {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}
</style>
