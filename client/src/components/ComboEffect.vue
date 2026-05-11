<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  combo: number
}

const props = defineProps<Props>()

const scale = ref(0)
const fireParticles = ref<{ id: number; x: number; y: number; delay: number; size: number }[]>([])

onMounted(() => {
  setTimeout(() => {
    scale.value = 1
  }, 50)

  const particles: { id: number; x: number; y: number; delay: number; size: number }[] = []
  for (let i = 0; i < 20; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
      size: 20 + Math.random() * 40
    })
  }
  fireParticles.value = particles
})
</script>

<template>
  <div class="combo-overlay">
    <div class="fire-container">
      <div
        v-for="particle in fireParticles"
        :key="particle.id"
        class="fire-particle"
        :style="{
          left: particle.x + '%',
          top: particle.y + '%',
          width: particle.size + 'px',
          height: particle.size + 'px',
          animationDelay: particle.delay + 's'
        }"
      ></div>
    </div>

    <div
      class="combo-text"
      :style="{ transform: `scale(${scale})` }"
    >
      <span class="fire-label">🔥 连击</span>
      <span class="combo-number">{{ combo }}</span>
      <span class="combo-unit">x</span>
    </div>
  </div>
</template>

<style scoped>
.combo-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  pointer-events: none;
}

.fire-container {
  position: absolute;
  width: 300px;
  height: 300px;
}

.fire-particle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #ff4500, #ff6347, #ffd700, transparent);
  animation: fire 1.5s ease-out infinite;
  opacity: 0;
}

.combo-text {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fire-label {
  font-size: 36px;
  font-weight: bold;
  color: #ff4500;
  text-shadow: 0 0 20px #ff4500, 0 0 40px #ff6347;
  animation: pulse 0.5s ease-in-out infinite alternate;
}

.combo-number {
  font-size: 120px;
  font-weight: bold;
  background: linear-gradient(135deg, #ff4500, #ffd700, #ff4500);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient 2s ease infinite, scaleUp 0.5s ease-out;
  text-shadow: none;
  filter: drop-shadow(0 0 30px #ff4500);
}

.combo-unit {
  font-size: 60px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 20px #ffd700;
}

@keyframes fire {
  0% {
    transform: scale(0) translateY(0);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: scale(2) translateY(-100px);
    opacity: 0;
  }
}

@keyframes pulse {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.1);
  }
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes scaleUp {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}
</style>
