<template>
  <div class="relative w-full h-full">
    <canvas ref="canvasRef" class="w-full h-full"></canvas>
    
    <div class="absolute top-4 left-4 bg-dark-secondary/90 backdrop-blur-sm border border-border rounded-lg p-3">
      <h3 class="text-sm font-bold text-text-primary mb-2">异常告警监控</h3>
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs text-text-tertiary">待处理:</span>
          <span class="text-sm font-bold text-error">{{ pendingCount }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-text-tertiary">处理中:</span>
          <span class="text-sm font-bold text-warning">{{ processingCount }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-text-tertiary">已完成:</span>
          <span class="text-sm font-bold text-success">{{ completedCount }}</span>
        </div>
      </div>
    </div>
    
    <div class="absolute top-4 right-4 flex flex-col gap-2">
      <button @click="resetCamera" class="bg-dark-secondary/90 border border-border rounded-lg p-2 hover:bg-primary/20 transition-colors" title="重置视角">
        <svg class="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </button>
      <button @click="togglePause" class="bg-dark-secondary/90 border border-border rounded-lg p-2 hover:bg-primary/20 transition-colors" :class="isPaused ? 'bg-warning/30 border-warning' : ''" :title="isPaused ? '继续动画' : '暂停动画'">
        <svg class="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="isPaused" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
    
    <div v-if="selectedAlert" class="absolute bottom-4 left-4 right-4 bg-dark-secondary/95 backdrop-blur-sm border rounded-lg p-4" 
      :class="[
        selectedAlert.severity === '紧急' ? 'border-error shadow-glow-red' : 
        selectedAlert.severity === '警告' ? 'border-warning shadow-glow-yellow' : 
        'border-info shadow-glow-blue'
      ]">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="status-dot animate-pulse" 
              :class="[
                selectedAlert.severity === '紧急' ? 'bg-error' : 
                selectedAlert.severity === '警告' ? 'bg-warning' : 'bg-info'
              ]"></span>
            <h4 class="text-base font-bold" 
              :class="[
                selectedAlert.severity === '紧急' ? 'text-error' : 
                selectedAlert.severity === '警告' ? 'text-warning' : 'text-info'
              ]">{{ selectedAlert.type }}</h4>
            <span class="text-xs px-2 py-0.5 rounded" 
              :class="[
                selectedAlert.status === '未处理' ? 'bg-error/20 text-error' : 
                selectedAlert.status === '处理中' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
              ]">{{ selectedAlert.status }}</span>
          </div>
          <p class="text-text-secondary text-sm mb-3">{{ selectedAlert.message }}</p>
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-text-tertiary text-xs">严重程度</span>
              <div class="flex items-center gap-1">
                <span :class="[
                  selectedAlert.severity === '紧急' ? 'text-error' : 
                  selectedAlert.severity === '警告' ? 'text-warning' : 'text-info'
                ]">{{ selectedAlert.severity }}</span>
              </div>
            </div>
            <div>
              <span class="text-text-tertiary text-xs">创建时间</span>
              <div class="text-text-secondary">{{ formatTime(selectedAlert.createdAt) }}</div>
            </div>
            <div>
              <span class="text-text-tertiary text-xs">操作</span>
              <div class="flex gap-2">
                <button v-if="selectedAlert.status === '未处理'" 
                  @click="handleAlert(selectedAlert, '处理中')"
                  class="text-xs px-3 py-1 bg-warning/20 text-warning rounded hover:bg-warning/30 transition-colors">
                  开始处理
                </button>
                <button v-if="selectedAlert.status === '处理中'" 
                  @click="handleAlert(selectedAlert, '已完成')"
                  class="text-xs px-3 py-1 bg-success/20 text-success rounded hover:bg-success/30 transition-colors">
                  标记完成
                </button>
              </div>
            </div>
          </div>
        </div>
        <button @click="selectedAlert = null" class="text-text-tertiary hover:text-text-primary ml-4">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="absolute bottom-4 left-4 bg-dark-secondary/90 backdrop-blur-sm border border-border rounded-lg p-2" v-if="!selectedAlert">
      <div class="flex gap-4 text-xs">
        <div class="flex items-center gap-1">
          <span class="status-dot bg-error animate-pulse"></span>
          <span class="text-text-tertiary">紧急</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="status-dot bg-warning"></span>
          <span class="text-text-tertiary">警告</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="status-dot bg-info"></span>
          <span class="text-text-tertiary">提醒</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, shallowRef, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { apiService } from '../utils/api'

const props = defineProps({
  alerts: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['alert-update', 'alert-select'])

const canvasRef = ref(null)
const scene = shallowRef(null)
const camera = shallowRef(null)
const renderer = shallowRef(null)
const controls = shallowRef(null)
const alertMeshes = ref([])
const selectedAlert = ref(null)
const isPaused = ref(false)
const animationId = ref(null)
const raycaster = shallowRef(null)
const mouse = ref(new THREE.Vector2())
const particleSystems = ref([])

const pendingCount = computed(() => props.alerts.filter(a => a.status === '未处理').length)
const processingCount = computed(() => props.alerts.filter(a => a.status === '处理中').length)
const completedCount = computed(() => props.alerts.filter(a => a.status === '已完成').length)

const alertPositions = {
  'al1': { x: -6, z: 4 },
  'al2': { x: 6, z: -4 },
  'al3': { x: 0, z: 6 }
}

const formatTime = (isoString) => {
  if (!isoString) return 'N/A'
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', { 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const getAlertColor = (alert) => {
  if (alert.severity === '紧急') return 0xff4444
  if (alert.severity === '警告') return 0xffaa00
  return 0x44aaff
}

const initScene = () => {
  if (!canvasRef.value) return
  
  scene.value = new THREE.Scene()
  scene.value.background = new THREE.Color(0x0a0a1a)
  scene.value.fog = new THREE.FogExp2(0x0a0a1a, 0.02)
  
  const aspect = canvasRef.value.clientWidth / canvasRef.value.clientHeight
  camera.value = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000)
  camera.value.position.set(0, 15, 20)
  
  renderer.value = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.value.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight)
  renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  
  controls.value = new OrbitControls(camera.value, renderer.value.domElement)
  controls.value.enableDamping = true
  controls.value.dampingFactor = 0.05
  controls.value.minDistance = 5
  controls.value.maxDistance = 40
  controls.value.maxPolarAngle = Math.PI / 2.2
  
  raycaster.value = new THREE.Raycaster()
  
  addLights()
  createGrid()
  createAlertMeshes()
  createParticleEffects()
  
  animate()
}

const addLights = () => {
  const ambientLight = new THREE.AmbientLight(0x202040, 0.3)
  scene.value.add(ambientLight)
  
  const mainLight = new THREE.DirectionalLight(0xffffff, 0.4)
  mainLight.position.set(10, 20, 10)
  scene.value.add(mainLight)
}

const createGrid = () => {
  const gridHelper = new THREE.GridHelper(40, 20, 0x303050, 0x151530)
  gridHelper.position.y = 0.01
  scene.value.add(gridHelper)
  
  const innerGeometry = new THREE.RingGeometry(12, 12.1, 64)
  const innerMaterial = new THREE.MeshBasicMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  })
  const innerRing = new THREE.Mesh(innerGeometry, innerMaterial)
  innerRing.rotation.x = -Math.PI / 2
  scene.value.add(innerRing)
  
  const outerGeometry = new THREE.RingGeometry(18, 18.1, 64)
  const outerMaterial = new THREE.MeshBasicMaterial({
    color: 0x8844ff,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
  })
  const outerRing = new THREE.Mesh(outerGeometry, outerMaterial)
  outerRing.rotation.x = -Math.PI / 2
  scene.value.add(outerRing)
  
  const centerGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32)
  const centerMaterial = new THREE.MeshBasicMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.8
  })
  const center = new THREE.Mesh(centerGeometry, centerMaterial)
  center.position.y = 0.05
  scene.value.add(center)
}

const createAlertMeshes = () => {
  props.alerts.forEach((alert, index) => {
    const pos = alertPositions[alert.id] || { 
      x: (Math.random() - 0.5) * 20, 
      z: (Math.random() - 0.5) * 20 
    }
    
    const color = getAlertColor(alert)
    const isActive = alert.status !== '已完成'
    
    const group = new THREE.Group()
    group.userData = { alert }
    
    const baseGeometry = new THREE.CylinderGeometry(1.2, 1.5, 0.2, 32)
    const baseMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: isActive ? 0.3 : 0.1
    })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 0.1
    group.add(base)
    
    const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 16)
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: isActive ? 0.5 : 0.2,
      transparent: true,
      opacity: isActive ? 0.8 : 0.4
    })
    const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial)
    pillar.position.y = 2.2
    group.add(pillar)
    
    const topGeometry = new THREE.OctahedronGeometry(0.8, 0)
    const topMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: isActive ? 0.8 : 0.3,
      transparent: true,
      opacity: 0.9
    })
    const top = new THREE.Mesh(topGeometry, topMaterial)
    top.position.y = 5
    group.add(top)
    
    const ringGeometry = new THREE.RingGeometry(1, 1.2, 32)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: isActive ? 0.5 : 0.2,
      side: THREE.DoubleSide
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.02
    group.add(ring)
    
    if (isActive) {
      const pointLight = new THREE.PointLight(color, isActive ? 0.8 : 0.3, 8)
      pointLight.position.set(0, 4, 0)
      group.add(pointLight)
    }
    
    const haloGeometry = new THREE.SphereGeometry(2, 32, 32)
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0,
      side: THREE.BackSide
    })
    const halo = new THREE.Mesh(haloGeometry, haloMaterial)
    halo.position.y = 2
    group.add(halo)
    
    group.position.set(pos.x, 0, pos.z)
    scene.value.add(group)
    
    alertMeshes.value.push({ 
      group, 
      alert, 
      pillar, 
      top, 
      ring, 
      halo,
      baseMaterial,
      pillarMaterial,
      topMaterial,
      ringMaterial
    })
  })
}

const createParticleEffects = () => {
  alertMeshes.value.forEach(({ alert, group }) => {
    if (alert.status === '已完成') return
    
    const color = getAlertColor(alert)
    const particleCount = alert.severity === '紧急' ? 200 : alert.severity === '警告' ? 100 : 50
    
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = []
    const sizes = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2
      positions[i * 3 + 1] = Math.random() * 6
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2
      
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: Math.random() * 0.03 + 0.01,
        z: (Math.random() - 0.5) * 0.02
      })
      
      sizes[i] = Math.random() * 0.1 + 0.05
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
    const material = new THREE.PointsMaterial({
      color: color,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })
    
    const particles = new THREE.Points(geometry, material)
    particles.userData = { velocities }
    
    group.add(particles)
    particleSystems.value.push({ particles, alert, group })
  })
}

const animate = () => {
  animationId.value = requestAnimationFrame(animate)
  
  if (!isPaused.value) {
    const time = Date.now() * 0.001
    
    alertMeshes.value.forEach(({ alert, top, ring, halo, pillarMaterial, topMaterial, ringMaterial }, index) => {
      const isActive = alert.status !== '已完成'
      const isSelected = selectedAlert.value?.id === alert.id
      
      if (top) {
        top.rotation.y += 0.02
        top.rotation.x += 0.01
      }
      
      if (ring) {
        const scale = 1 + Math.sin(time * 2 + index) * 0.2
        ring.scale.setScalar(scale)
        ringMaterial.opacity = isActive ? (0.3 + Math.sin(time * 3 + index) * 0.2) : 0.1
      }
      
      if (isActive && halo) {
        const pulseScale = 1 + Math.sin(time * 4 + index) * 0.3
        halo.scale.setScalar(pulseScale)
        halo.material.opacity = 0.1 + Math.sin(time * 3 + index) * 0.1
      }
      
      if (isActive && pillarMaterial) {
        const pulse = 0.3 + Math.sin(time * 4 + index) * 0.3
        pillarMaterial.emissiveIntensity = isSelected ? pulse * 1.5 : pulse
      }
      
      if (isActive && topMaterial) {
        const pulse = 0.5 + Math.sin(time * 5 + index) * 0.3
        topMaterial.emissiveIntensity = isSelected ? pulse * 1.5 : pulse
      }
    })
    
    particleSystems.value.forEach(({ particles, alert }) => {
      if (alert.status === '已完成') return
      
      const positions = particles.geometry.attributes.position.array
      const velocities = particles.userData.velocities
      
      for (let i = 0; i < velocities.length; i++) {
        positions[i * 3] += velocities[i].x
        positions[i * 3 + 1] += velocities[i].y
        positions[i * 3 + 2] += velocities[i].z
        
        if (positions[i * 3 + 1] > 8) {
          positions[i * 3] = (Math.random() - 0.5) * 2
          positions[i * 3 + 1] = 0
          positions[i * 3 + 2] = (Math.random() - 0.5) * 2
        }
      }
      
      particles.geometry.attributes.position.needsUpdate = true
    })
  }
  
  controls.value.update()
  renderer.value.render(scene.value, camera.value)
}

const onMouseMove = (event) => {
  if (!canvasRef.value || !raycaster.value || !camera.value) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  mouse.value.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.value.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  
  raycaster.value.setFromCamera(mouse.value, camera.value)
  
  const allMeshes = []
  alertMeshes.value.forEach(({ group }) => {
    group.traverse((child) => {
      if (child.isMesh) {
        allMeshes.push(child)
      }
    })
  })
  
  const intersects = raycaster.value.intersectObjects(allMeshes)
  
  if (intersects.length > 0) {
    canvasRef.value.style.cursor = 'pointer'
  } else {
    canvasRef.value.style.cursor = 'grab'
  }
}

const onMouseClick = (event) => {
  if (!canvasRef.value || !raycaster.value || !camera.value) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  mouse.value.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.value.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  
  raycaster.value.setFromCamera(mouse.value, camera.value)
  
  const allMeshes = []
  alertMeshes.value.forEach(({ group }) => {
    group.traverse((child) => {
      if (child.isMesh) {
        allMeshes.push(child)
      }
    })
  })
  
  const intersects = raycaster.value.intersectObjects(allMeshes)
  
  if (intersects.length > 0) {
    for (const mesh of alertMeshes.value) {
      let isDescendant = false
      mesh.group.traverse((child) => {
        if (child === intersects[0].object) {
          isDescendant = true
        }
      })
      if (isDescendant) {
        selectedAlert.value = mesh.alert
        emit('alert-select', mesh.alert)
        
        const pos = mesh.group.position
        if (camera.value && controls.value) {
          const targetPos = new THREE.Vector3(pos.x + 5, 8, pos.z + 5)
          const targetLookAt = new THREE.Vector3(pos.x, 2, pos.z)
          animateCamera(targetPos, targetLookAt)
        }
        break
      }
    }
  }
}

const animateCamera = (targetPos, targetLookAt) => {
  const startPos = camera.value.position.clone()
  const startTarget = controls.value.target.clone()
  const duration = 1000
  const startTime = Date.now()
  
  const animateStep = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    
    camera.value.position.lerpVectors(startPos, targetPos, eased)
    controls.value.target.lerpVectors(startTarget, targetLookAt, eased)
    controls.value.update()
    
    if (progress < 1) {
      requestAnimationFrame(animateStep)
    }
  }
  
  animateStep()
}

const resetCamera = () => {
  animateCamera(
    new THREE.Vector3(0, 15, 20),
    new THREE.Vector3(0, 0, 0)
  )
  selectedAlert.value = null
}

const togglePause = () => {
  isPaused.value = !isPaused.value
}

const handleAlert = async (alert, newStatus) => {
  try {
    await apiService.updateAlert(alert.id, { status: newStatus })
    emit('alert-update', { alertId: alert.id, status: newStatus })
    
    const mesh = alertMeshes.value.find(m => m.alert.id === alert.id)
    if (mesh) {
      mesh.alert.status = newStatus
      if (newStatus === '已完成') {
        mesh.group.traverse((child) => {
          if (child.material) {
            child.material.emissiveIntensity = 0.1
            child.material.opacity = 0.3
          }
        })
      }
    }
    
    selectedAlert.value = { ...alert, status: newStatus }
  } catch (error) {
    console.error('处理告警失败:', error)
  }
}

const onResize = () => {
  if (!canvasRef.value || !camera.value || !renderer.value) return
  
  const aspect = canvasRef.value.clientWidth / canvasRef.value.clientHeight
  camera.value.aspect = aspect
  camera.value.updateProjectionMatrix()
  renderer.value.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight)
}

onMounted(() => {
  nextTick(() => {
    initScene()
    if (canvasRef.value) {
      canvasRef.value.addEventListener('mousemove', onMouseMove)
      canvasRef.value.addEventListener('click', onMouseClick)
    }
    window.addEventListener('resize', onResize)
  })
})

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('mousemove', onMouseMove)
    canvasRef.value.removeEventListener('click', onMouseClick)
  }
  window.removeEventListener('resize', onResize)
  
  if (renderer.value) {
    renderer.value.dispose()
  }
})
</script>

<style scoped>
canvas {
  display: block;
}
</style>
