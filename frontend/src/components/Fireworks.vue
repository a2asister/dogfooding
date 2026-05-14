<template>
  <canvas ref="canvasRef" class="fireworks-canvas"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  color: string
  size: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let particles: Particle[] = []
let animationId: number = 0
let isRunning = true

const colors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
  '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe'
]

const createParticle = (x: number, y: number): Particle => {
  const angle = Math.random() * Math.PI * 2
  const speed = Math.random() * 3 + 1
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    alpha: 1,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 3 + 1
  }
}

const explode = (x: number, y: number): void => {
  const particleCount = 80
  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle(x, y))
  }
}

const animate = (): void => {
  if (!ctx || !canvasRef.value) return
  
  ctx.fillStyle = 'rgba(26, 26, 46, 0.2)'
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  
  particles = particles.filter(particle => {
    particle.x += particle.vx
    particle.y += particle.vy
    particle.vy += 0.05
    particle.alpha -= 0.012
    
    if (particle.alpha <= 0) return false
    
    if (ctx) {
      ctx.save()
      ctx.globalAlpha = particle.alpha
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
    
    return true
  })
  
  if (isRunning) {
    animationId = requestAnimationFrame(animate)
  }
}

const startAutoExplode = (): void => {
  const autoExplode = (): void => {
    if (!isRunning || !canvasRef.value) return
    const x = Math.random() * canvasRef.value.width
    const y = Math.random() * canvasRef.value.height * 0.6
    explode(x, y)
    setTimeout(autoExplode, Math.random() * 1500 + 500)
  }
  autoExplode()
}

onMounted(() => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  canvasRef.value.width = window.innerWidth
  canvasRef.value.height = window.innerHeight
  
  const handleResize = (): void => {
    if (canvasRef.value) {
      canvasRef.value.width = window.innerWidth
      canvasRef.value.height = window.innerHeight
    }
  }
  window.addEventListener('resize', handleResize)
  
  animate()
  startAutoExplode()
})

onUnmounted(() => {
  isRunning = false
  cancelAnimationFrame(animationId)
})

defineExpose({ explode })
</script>

<style scoped>
.fireworks-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}
</style>
