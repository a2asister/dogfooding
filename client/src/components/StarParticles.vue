<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  opacity: number
}

const particles = ref<Particle[]>([])
const particleId = ref(0)

const colors = ['#FFD700', '#FFA500', '#FF69B4', '#00FFFF', '#7FFF00', '#FF6347']

const createParticles = () => {
  const newParticles: Particle[] = []
  const centerX = 50
  const centerY = 50

  for (let i = 0; i < 30; i++) {
    const angle = (Math.PI * 2 * i) / 30 + Math.random() * 0.5
    const speed = 3 + Math.random() * 5
    newParticles.push({
      id: particleId.value++,
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 8 + Math.random() * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    })
  }

  particles.value = newParticles
}

let animationFrame: number

const animate = () => {
  particles.value = particles.value.map(p => ({
    ...p,
    x: p.x + p.vx,
    y: p.y + p.vy,
    vy: p.vy + 0.15,
    opacity: p.opacity - 0.015,
    rotation: p.rotation + p.rotationSpeed
  })).filter(p => p.opacity > 0)

  if (particles.value.length > 0) {
    animationFrame = requestAnimationFrame(animate)
  }
}

onMounted(() => {
  createParticles()
  animationFrame = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<template>
  <div class="particles-container">
    <svg
      v-for="particle in particles"
      :key="particle.id"
      class="star-particle"
      :style="{
        left: particle.x + '%',
        top: particle.y + '%',
        width: particle.size + 'px',
        height: particle.size + 'px',
        transform: `translate(-50%, -50%) rotate(${particle.rotation}deg)`,
        opacity: particle.opacity
      }"
      viewBox="0 0 24 24"
    >
      <path
        :fill="particle.color"
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </svg>
  </div>
</template>

<style scoped>
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.star-particle {
  position: absolute;
  filter: drop-shadow(0 0 8px currentColor);
}
</style>
