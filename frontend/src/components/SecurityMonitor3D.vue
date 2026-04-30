<template>
  <div class="relative w-full h-full">
    <canvas ref="canvasRef" class="w-full h-full"></canvas>
    
    <div class="absolute top-4 left-4 bg-dark-secondary/90 backdrop-blur-sm border border-border rounded-lg p-3">
      <h3 class="text-sm font-bold text-text-primary mb-2">安防监控</h3>
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs text-text-tertiary">在线设备:</span>
          <span class="text-sm font-bold text-success">{{ onlineCount }}/{{ totalCount }}</span>
        </div>
        <div class="w-full h-1.5 bg-dark-tertiary rounded-full overflow-hidden">
          <div class="h-full bg-success rounded-full" 
            :style="{ width: (onlineCount / totalCount * 100) + '%' }"></div>
        </div>
      </div>
    </div>
    
    <div class="absolute top-4 right-4 flex flex-col gap-2">
      <button @click="resetCamera" class="bg-dark-secondary/90 border border-border rounded-lg p-2 hover:bg-primary/20 transition-colors" title="重置视角">
        <svg class="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
      <button @click="toggleAutoRotate" class="bg-dark-secondary/90 border border-border rounded-lg p-2 hover:bg-primary/20 transition-colors" :class="autoRotate ? 'bg-primary/30 border-primary' : ''" title="自动旋转">
        <svg class="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
    
    <div v-if="selectedCamera" class="absolute bottom-4 left-4 right-4 bg-dark-secondary/95 backdrop-blur-sm border border-primary/50 rounded-lg p-4 shadow-glow-blue">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h4 class="text-base font-bold text-primary mb-2">{{ selectedCamera.name }}</h4>
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-text-tertiary text-xs">位置</span>
              <div class="text-text-secondary">{{ selectedCamera.location }}</div>
            </div>
            <div>
              <span class="text-text-tertiary text-xs">状态</span>
              <div class="flex items-center gap-1">
                <span class="status-dot" :class="selectedCamera.status === '在线' ? 'bg-success animate-pulse' : 'bg-error'"></span>
                <span :class="selectedCamera.status === '在线' ? 'text-success' : 'text-error'">{{ selectedCamera.status }}</span>
              </div>
            </div>
            <div>
              <span class="text-text-tertiary text-xs">最后更新</span>
              <div class="text-text-secondary">{{ formatTime(selectedCamera.lastUpdate) }}</div>
            </div>
          </div>
        </div>
        <button @click="selectedCamera = null" class="text-text-tertiary hover:text-text-primary ml-4">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="absolute bottom-4 left-4 bg-dark-secondary/90 backdrop-blur-sm border border-border rounded-lg p-2" v-if="!selectedCamera">
      <div class="flex gap-4 text-xs">
        <div class="flex items-center gap-1">
          <span class="status-dot bg-success animate-pulse"></span>
          <span class="text-text-tertiary">在线</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="status-dot bg-error"></span>
          <span class="text-text-tertiary">离线</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, shallowRef, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps({
  securityDevices: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['camera-select'])

const canvasRef = ref(null)
const scene = shallowRef(null)
const camera = shallowRef(null)
const renderer = shallowRef(null)
const controls = shallowRef(null)
const cameraMeshes = ref([])
const selectedCamera = ref(null)
const autoRotate = ref(true)
const animationId = ref(null)
const raycaster = shallowRef(null)
const mouse = ref(new THREE.Vector2())

const cameraPositions = {
  's1': { x: -15, z: -15, angle: 0 },
  's2': { x: -8, z: -6, angle: Math.PI / 4 },
  's3': { x: 8, z: -6, angle: -Math.PI / 4 },
  's4': { x: 15, z: -15, angle: Math.PI }
}

const onlineCount = computed(() => {
  return props.securityDevices.filter(d => d.status === '在线').length
})

const totalCount = computed(() => props.securityDevices.length)

const formatTime = (isoString) => {
  if (!isoString) return 'N/A'
  const date = new Date(isoString)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const initScene = () => {
  if (!canvasRef.value) return
  
  scene.value = new THREE.Scene()
  scene.value.background = new THREE.Color(0x0a0a1a)
  scene.value.fog = new THREE.Fog(0x0a0a1a, 15, 60)
  
  const aspect = canvasRef.value.clientWidth / canvasRef.value.clientHeight
  camera.value = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000)
  camera.value.position.set(0, 20, 25)
  
  renderer.value = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.value.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight)
  renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.value.shadowMap.enabled = true
  
  controls.value = new OrbitControls(camera.value, renderer.value.domElement)
  controls.value.enableDamping = true
  controls.value.dampingFactor = 0.05
  controls.value.minDistance = 8
  controls.value.maxDistance = 50
  controls.value.maxPolarAngle = Math.PI / 2.1
  controls.value.autoRotate = autoRotate.value
  controls.value.autoRotateSpeed = 0.3
  
  raycaster.value = new THREE.Raycaster()
  
  addLights()
  createFloor()
  createCameraMeshes()
  createConnectionLines()
  
  animate()
}

const addLights = () => {
  const ambientLight = new THREE.AmbientLight(0x303050, 0.4)
  scene.value.add(ambientLight)
  
  const mainLight = new THREE.DirectionalLight(0xffffff, 0.6)
  mainLight.position.set(10, 20, 10)
  mainLight.castShadow = true
  scene.value.add(mainLight)
  
  const rimLight = new THREE.DirectionalLight(0x4466ff, 0.3)
  rimLight.position.set(-10, 15, -10)
  scene.value.add(rimLight)
}

const createFloor = () => {
  const floorGeometry = new THREE.PlaneGeometry(60, 60)
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x151525,
    roughness: 0.9
  })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.value.add(floor)
  
  const gridHelper = new THREE.GridHelper(60, 30, 0x252540, 0x151525)
  gridHelper.position.y = 0.01
  scene.value.add(gridHelper)
  
  const buildingGeometry = new THREE.BoxGeometry(18, 3, 12)
  const buildingMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a40,
    roughness: 0.7,
    metalness: 0.2
  })
  
  const buildings = [
    { x: 0, z: 0 },
    { x: -15, z: 10 },
    { x: 15, z: 10 },
    { x: -15, z: -10 },
    { x: 15, z: -10 }
  ]
  
  buildings.forEach((pos, index) => {
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial)
    building.position.set(pos.x, 1.5, pos.z)
    building.castShadow = true
    building.receiveShadow = true
    scene.value.add(building)
    
    const edgeGeometry = new THREE.EdgesGeometry(buildingGeometry)
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.5 })
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial)
    edges.position.set(pos.x, 1.5, pos.z)
    scene.value.add(edges)
  })
}

const createCameraMeshes = () => {
  props.securityDevices.forEach(device => {
    const pos = cameraPositions[device.id] || { x: 0, z: 0, angle: 0 }
    const isOnline = device.status === '在线'
    
    const group = new THREE.Group()
    group.userData = { device }
    
    const poleGeometry = new THREE.CylinderGeometry(0.08, 0.12, 5)
    const poleMaterial = new THREE.MeshStandardMaterial({
      color: 0x404050,
      metalness: 0.8,
      roughness: 0.3
    })
    const pole = new THREE.Mesh(poleGeometry, poleMaterial)
    pole.position.y = 2.5
    pole.castShadow = true
    group.add(pole)
    
    const armGeometry = new THREE.BoxGeometry(1.5, 0.08, 0.08)
    const arm = new THREE.Mesh(armGeometry, poleMaterial)
    arm.position.set(0.75, 4.8, 0)
    arm.rotation.z = -0.2
    arm.castShadow = true
    group.add(arm)
    
    const cameraBodyGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.5)
    const cameraMaterial = new THREE.MeshStandardMaterial({
      color: isOnline ? 0x303040 : 0x202030,
      metalness: 0.6,
      roughness: 0.4
    })
    const cameraBody = new THREE.Mesh(cameraBodyGeometry, cameraMaterial)
    cameraBody.position.set(1.8, 4.5, 0)
    cameraBody.rotation.z = -0.3
    cameraBody.castShadow = true
    group.add(cameraBody)
    
    const lensGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.2, 16)
    const lensMaterial = new THREE.MeshStandardMaterial({
      color: isOnline ? 0x00ff88 : 0x666666,
      emissive: isOnline ? 0x00ff88 : 0x000000,
      emissiveIntensity: isOnline ? 0.8 : 0,
      metalness: 0.9,
      roughness: 0.1
    })
    const lens = new THREE.Mesh(lensGeometry, lensMaterial)
    lens.position.set(2.15, 4.5, 0)
    lens.rotation.z = Math.PI / 2
    lens.rotation.x = Math.PI / 2
    group.add(lens)
    
    if (isOnline) {
      const lightConeGeometry = new THREE.ConeGeometry(2, 6, 32, 1, true)
      const lightConeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
      })
      const lightCone = new THREE.Mesh(lightConeGeometry, lightConeMaterial)
      lightCone.position.set(3, 3.5, 0)
      lightCone.rotation.z = -Math.PI / 2 - 0.3
      group.add(lightCone)
      
      const pointLight = new THREE.PointLight(0x00ff88, 0.5, 8)
      pointLight.position.set(2, 4.5, 0)
      group.add(pointLight)
    }
    
    const ringGeometry = new THREE.RingGeometry(0.8, 1, 32)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: isOnline ? 0x00ff88 : 0xff4444,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.02
    group.add(ring)
    
    group.position.set(pos.x, 0, pos.z)
    group.rotation.y = pos.angle
    scene.value.add(group)
    
    cameraMeshes.value.push({ group, device, lens, ring })
  })
}

const createConnectionLines = () => {
  const material = new THREE.LineDashedMaterial({
    color: 0x4488ff,
    dashSize: 0.3,
    gapSize: 0.2,
    transparent: true,
    opacity: 0.4
  })
  
  const onlineCameras = cameraMeshes.value.filter(m => m.device.status === '在线')
  
  for (let i = 0; i < onlineCameras.length; i++) {
    for (let j = i + 1; j < onlineCameras.length; j++) {
      const start = onlineCameras[i].group.position
      const end = onlineCameras[j].group.position
      
      const midY = 3 + Math.random() * 2
      
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(start.x, 5, start.z),
        new THREE.Vector3((start.x + end.x) / 2, midY + 5, (start.z + end.z) / 2),
        new THREE.Vector3(end.x, 5, end.z)
      )
      
      const points = curve.getPoints(20)
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      
      const line = new THREE.Line(geometry, material)
      line.computeLineDistances()
      scene.value.add(line)
    }
  }
}

const animate = () => {
  animationId.value = requestAnimationFrame(animate)
  
  const time = Date.now() * 0.001
  
  cameraMeshes.value.forEach(({ device, lens, ring }, index) => {
    const isOnline = device.status === '在线'
    
    if (ring) {
      const scale = 1 + Math.sin(time * 1.5 + index) * 0.1
      ring.scale.setScalar(scale)
      ring.material.opacity = 0.2 + Math.sin(time * 2 + index) * 0.1
    }
    
    if (isOnline && lens) {
      lens.material.emissiveIntensity = 0.6 + Math.sin(time * 3 + index) * 0.4
    }
  })
  
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
  cameraMeshes.value.forEach(({ group }) => {
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
  cameraMeshes.value.forEach(({ group }) => {
    group.traverse((child) => {
      if (child.isMesh) {
        allMeshes.push(child)
      }
    })
  })
  
  const intersects = raycaster.value.intersectObjects(allMeshes)
  
  if (intersects.length > 0) {
    for (const mesh of cameraMeshes.value) {
      let isDescendant = false
      mesh.group.traverse((child) => {
        if (child === intersects[0].object) {
          isDescendant = true
        }
      })
      if (isDescendant) {
        selectedCamera.value = mesh.device
        emit('camera-select', mesh.device)
        
        const pos = cameraPositions[mesh.device.id]
        if (pos && camera.value && controls.value) {
          const targetPos = new THREE.Vector3(pos.x + 5, 10, pos.z + 5)
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
    new THREE.Vector3(0, 20, 25),
    new THREE.Vector3(0, 0, 0)
  )
  selectedCamera.value = null
}

const toggleAutoRotate = () => {
  autoRotate.value = !autoRotate.value
  if (controls.value) {
    controls.value.autoRotate = autoRotate.value
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
