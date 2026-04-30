<template>
  <div class="relative w-full h-full">
    <canvas ref="canvasRef" class="w-full h-full"></canvas>
    
    <div class="absolute top-4 left-4 bg-dark-secondary/90 backdrop-blur-sm border border-border rounded-lg p-3">
      <h3 class="text-sm font-bold text-text-primary mb-2">园区导航</h3>
      <div class="space-y-1">
        <button 
          v-for="venue in venues" 
          :key="venue.id"
          @click="focusOnVenue(venue)"
          class="w-full text-left text-xs p-2 rounded hover:bg-primary/20 transition-colors"
          :class="selectedVenue?.id === venue.id ? 'bg-primary/30 text-primary' : 'text-text-tertiary'">
          <span class="inline-block w-2 h-2 rounded-full mr-2" 
            :class="venue.status === '开放' ? 'bg-success' : 'bg-error'"></span>
          {{ venue.name }}
        </button>
      </div>
    </div>
    
    <div class="absolute bottom-4 left-4 bg-dark-secondary/90 backdrop-blur-sm border border-border rounded-lg p-3">
      <h3 class="text-sm font-bold text-text-primary mb-2">操作说明</h3>
      <ul class="text-xs text-text-tertiary space-y-1">
        <li>🖱️ 鼠标左键拖拽: 旋转视角</li>
        <li>🖱️ 鼠标右键拖拽: 平移视角</li>
        <li>🖱️ 滚轮: 缩放</li>
        <li>👆 点击场馆: 查看详情</li>
      </ul>
    </div>
    
    <div v-if="hoveredVenue" class="absolute top-4 right-4 bg-dark-secondary/90 backdrop-blur-sm border border-primary/50 rounded-lg p-4 max-w-xs shadow-glow-blue">
      <h3 class="text-base font-bold text-primary mb-2">{{ hoveredVenue.name }}</h3>
      <div class="space-y-1 text-sm">
        <div class="flex justify-between">
          <span class="text-text-tertiary">位置:</span>
          <span class="text-text-secondary">{{ hoveredVenue.location }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-text-tertiary">状态:</span>
          <span class="text-success">{{ hoveredVenue.status }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-text-tertiary">当前游客:</span>
          <span class="text-warning">{{ hoveredVenue.currentVisitors }}/{{ hoveredVenue.capacity }}</span>
        </div>
        <div class="mt-2">
          <div class="flex justify-between text-xs text-text-tertiary mb-1">
            <span>拥挤程度</span>
            <span>{{ Math.round((hoveredVenue.currentVisitors / hoveredVenue.capacity) * 100) }}%</span>
          </div>
          <div class="w-full h-1.5 bg-dark-tertiary rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all" 
              :class="getCrowdLevel(hoveredVenue).color"
              :style="{ width: (hoveredVenue.currentVisitors / hoveredVenue.capacity) * 100 + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="absolute top-4 right-4 flex flex-col gap-2" v-if="!hoveredVenue">
      <button @click="resetCamera" class="bg-dark-secondary/90 border border-border rounded-lg p-2 hover:bg-primary/20 transition-colors" title="重置视角">
        <svg class="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
      <button @click="toggleAutoRotate" class="bg-dark-secondary/90 border border-border rounded-lg p-2 hover:bg-primary/20 transition-colors" :class="autoRotate ? 'bg-primary/30 border-primary' : ''" title="自动旋转">
        <svg class="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, shallowRef, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps({
  venues: {
    type: Array,
    default: () => []
  },
  selectedVenue: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['venue-select'])

const canvasRef = ref(null)
const scene = shallowRef(null)
const camera = shallowRef(null)
const renderer = shallowRef(null)
const controls = shallowRef(null)
const venueMeshes = ref([])
const hoveredVenue = ref(null)
const autoRotate = ref(true)
const raycaster = shallowRef(null)
const mouse = ref(new THREE.Vector2())
const animationId = ref(null)

const venuePositions = {
  'v1': { x: -8, z: -6, color: 0x00ff88 },
  'v2': { x: 8, z: -6, color: 0xff6644 },
  'v3': { x: 0, z: 8, color: 0x44aaff },
  'v4': { x: -8, z: 6, color: 0x88aaff },
  'v5': { x: 8, z: 6, color: 0x44ddff }
}

const initScene = () => {
  if (!canvasRef.value) return
  
  scene.value = new THREE.Scene()
  scene.value.background = new THREE.Color(0x0a0a1a)
  scene.value.fog = new THREE.Fog(0x0a0a1a, 20, 80)
  
  const aspect = canvasRef.value.clientWidth / canvasRef.value.clientHeight
  camera.value = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000)
  camera.value.position.set(0, 25, 30)
  
  renderer.value = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: true
  })
  renderer.value.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight)
  renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.value.shadowMap.enabled = true
  renderer.value.shadowMap.type = THREE.PCFSoftShadowMap
  
  controls.value = new OrbitControls(camera.value, renderer.value.domElement)
  controls.value.enableDamping = true
  controls.value.dampingFactor = 0.05
  controls.value.minDistance = 10
  controls.value.maxDistance = 60
  controls.value.maxPolarAngle = Math.PI / 2.2
  controls.value.autoRotate = autoRotate.value
  controls.value.autoRotateSpeed = 0.5
  
  raycaster.value = new THREE.Raycaster()
  raycaster.value.far = 100
  
  addLights()
  createGround()
  createVenueMeshes()
  createDecorations()
  
  animate()
}

const addLights = () => {
  const ambientLight = new THREE.AmbientLight(0x404080, 0.4)
  scene.value.add(ambientLight)
  
  const mainLight = new THREE.DirectionalLight(0xffffff, 0.8)
  mainLight.position.set(20, 30, 20)
  mainLight.castShadow = true
  mainLight.shadow.mapSize.width = 2048
  mainLight.shadow.mapSize.height = 2048
  mainLight.shadow.camera.near = 0.5
  mainLight.shadow.camera.far = 100
  mainLight.shadow.camera.left = -30
  mainLight.shadow.camera.right = 30
  mainLight.shadow.camera.top = 30
  mainLight.shadow.camera.bottom = -30
  scene.value.add(mainLight)
  
  const fillLight = new THREE.DirectionalLight(0x6688ff, 0.3)
  fillLight.position.set(-20, 20, -20)
  scene.value.add(fillLight)
  
  const venueLight1 = new THREE.PointLight(0x00ff88, 1, 15)
  venueLight1.position.set(-8, 5, -6)
  scene.value.add(venueLight1)
  
  const venueLight2 = new THREE.PointLight(0xff6644, 1, 15)
  venueLight2.position.set(8, 5, -6)
  scene.value.add(venueLight2)
  
  const venueLight3 = new THREE.PointLight(0x44aaff, 1, 15)
  venueLight3.position.set(0, 5, 8)
  scene.value.add(venueLight3)
}

const createGround = () => {
  const groundGeometry = new THREE.PlaneGeometry(80, 80)
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a2a1a,
    roughness: 0.9,
    metalness: 0.1
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.value.add(ground)
  
  const gridHelper = new THREE.GridHelper(80, 40, 0x2a3a2a, 0x1a2a1a)
  gridHelper.position.y = 0.01
  scene.value.add(gridHelper)
  
  const mainRoadGeometry = new THREE.PlaneGeometry(3, 80)
  const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x333340,
    roughness: 0.8
  })
  
  const road1 = new THREE.Mesh(mainRoadGeometry, roadMaterial)
  road1.rotation.x = -Math.PI / 2
  road1.position.y = 0.02
  scene.value.add(road1)
  
  const road2 = new THREE.Mesh(mainRoadGeometry, roadMaterial)
  road2.rotation.x = -Math.PI / 2
  road2.rotation.z = Math.PI / 2
  road2.position.y = 0.02
  scene.value.add(road2)
}

const createVenueMeshes = () => {
  props.venues.forEach(venue => {
    const pos = venuePositions[venue.id] || { x: 0, z: 0, color: 0x888888 }
    
    const group = new THREE.Group()
    group.userData = { venue, originalColor: pos.color }
    
    const baseGeometry = new THREE.BoxGeometry(10, 0.5, 8)
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a3a,
      roughness: 0.7,
      metalness: 0.2
    })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 0.25
    base.receiveShadow = true
    base.castShadow = true
    group.add(base)
    
    const buildingGeometry = new THREE.BoxGeometry(8, 4, 6)
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: pos.color,
      roughness: 0.5,
      metalness: 0.3,
      emissive: pos.color,
      emissiveIntensity: 0.1
    })
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial)
    building.position.y = 2.5
    building.castShadow = true
    building.receiveShadow = true
    group.add(building)
    
    const roofGeometry = new THREE.ConeGeometry(5.5, 2, 4)
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a4a5a,
      roughness: 0.6,
      metalness: 0.2
    })
    const roof = new THREE.Mesh(roofGeometry, roofMaterial)
    roof.position.y = 5.5
    roof.rotation.y = Math.PI / 4
    roof.castShadow = true
    group.add(roof)
    
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      emissive: 0x4488cc,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8
    })
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const windowGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.1)
        const window1 = new THREE.Mesh(windowGeometry, windowMaterial)
        window1.position.set(-2.5 + i * 2.5, 2 + j * 1.5, 3.01)
        group.add(window1)
        
        const window2 = new THREE.Mesh(windowGeometry, windowMaterial)
        window2.position.set(-2.5 + i * 2.5, 2 + j * 1.5, -3.01)
        group.add(window2)
      }
    }
    
    const ringGeometry = new THREE.RingGeometry(5.5, 5.8, 32)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: pos.color,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.03
    group.add(ring)
    
    group.position.set(pos.x, 0, pos.z)
    scene.value.add(group)
    venueMeshes.value.push({ group, venue, building, ring })
  })
}

const createDecorations = () => {
  const treeGeometry = new THREE.ConeGeometry(0.8, 2, 8)
  const treeMaterial = new THREE.MeshStandardMaterial({
    color: 0x228833,
    roughness: 0.8
  })
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1)
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a3a2a,
    roughness: 0.9
  })
  
  const treePositions = [
    [-15, -12], [-15, -4], [-15, 4], [-15, 12],
    [15, -12], [15, -4], [15, 4], [15, 12],
    [-12, -15], [-4, -15], [4, -15], [12, -15],
    [-12, 15], [-4, 15], [4, 15], [12, 15]
  ]
  
  treePositions.forEach(([x, z]) => {
    const tree = new THREE.Mesh(treeGeometry, treeMaterial)
    tree.position.set(x, 2.5, z)
    tree.castShadow = true
    scene.value.add(tree)
    
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.set(x, 0.5, z)
    trunk.castShadow = true
    scene.value.add(trunk)
  })
  
  const lamppostGeometry = new THREE.CylinderGeometry(0.1, 0.15, 4)
  const lamppostMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.8,
    roughness: 0.3
  })
  const lampGeometry = new THREE.SphereGeometry(0.4, 16, 16)
  const lampMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffaa,
    emissive: 0xffff88,
    emissiveIntensity: 0.5
  })
  
  const lampPositions = [
    [-5, -12], [5, -12], [-5, 12], [5, 12],
    [-12, -5], [12, -5], [-12, 5], [12, 5]
  ]
  
  lampPositions.forEach(([x, z]) => {
    const lamppost = new THREE.Mesh(lamppostGeometry, lamppostMaterial)
    lamppost.position.set(x, 2, z)
    lamppost.castShadow = true
    scene.value.add(lamppost)
    
    const lamp = new THREE.Mesh(lampGeometry, lampMaterial)
    lamp.position.set(x, 4.5, z)
    scene.value.add(lamp)
    
    const pointLight = new THREE.PointLight(0xffffaa, 0.5, 8)
    pointLight.position.set(x, 4.5, z)
    scene.value.add(pointLight)
  })
}

const animate = () => {
  animationId.value = requestAnimationFrame(animate)
  
  const time = Date.now() * 0.001
  
  venueMeshes.value.forEach(({ venue, ring, building }, index) => {
    if (ring) {
      ring.scale.setScalar(1 + Math.sin(time * 2 + index) * 0.05)
    }
    
    if (props.selectedVenue?.id === venue.id || hoveredVenue.value?.id === venue.id) {
      if (building?.material) {
        building.material.emissiveIntensity = 0.3 + Math.sin(time * 4) * 0.1
      }
    } else if (building?.material) {
      building.material.emissiveIntensity = 0.1
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
  venueMeshes.value.forEach(({ group }) => {
    group.traverse((child) => {
      if (child.isMesh) {
        allMeshes.push(child)
      }
    })
  })
  
  const intersects = raycaster.value.intersectObjects(allMeshes)
  
  if (intersects.length > 0) {
    let foundVenue = null
    for (const mesh of venueMeshes.value) {
      let isDescendant = false
      mesh.group.traverse((child) => {
        if (child === intersects[0].object) {
          isDescendant = true
        }
      })
      if (isDescendant) {
        foundVenue = mesh.venue
        break
      }
    }
    
    if (foundVenue && foundVenue.id !== hoveredVenue.value?.id) {
      hoveredVenue.value = foundVenue
      canvasRef.value.style.cursor = 'pointer'
    }
  } else if (hoveredVenue.value) {
    hoveredVenue.value = null
    canvasRef.value.style.cursor = 'grab'
  }
}

const onMouseClick = () => {
  if (hoveredVenue.value) {
    emit('venue-select', hoveredVenue.value)
  }
}

const focusOnVenue = (venue) => {
  const pos = venuePositions[venue.id]
  if (!pos || !camera.value || !controls.value) return
  
  const targetPosition = new THREE.Vector3(pos.x + 8, 12, pos.z + 10)
  const targetLookAt = new THREE.Vector3(pos.x, 2, pos.z)
  
  animateCamera(targetPosition, targetLookAt)
  emit('venue-select', venue)
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
    new THREE.Vector3(0, 25, 30),
    new THREE.Vector3(0, 0, 0)
  )
  emit('venue-select', null)
}

const toggleAutoRotate = () => {
  autoRotate.value = !autoRotate.value
  if (controls.value) {
    controls.value.autoRotate = autoRotate.value
  }
}

const getCrowdLevel = (venue) => {
  const ratio = venue.currentVisitors / venue.capacity
  if (ratio < 0.5) return { level: '低', color: 'bg-success' }
  if (ratio < 0.8) return { level: '中', color: 'bg-warning' }
  return { level: '高', color: 'bg-error' }
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
