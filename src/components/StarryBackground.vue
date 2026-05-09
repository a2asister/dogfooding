<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  opacity: number
}

const stars = ref<Star[]>([])

onMounted(() => {
  const count = window.innerWidth < 768 ? 80 : 150
  for (let i = 0; i < count; i++) {
    stars.value.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
      opacity: Math.random() * 0.5 + 0.3
    })
  }
})
</script>

<template>
  <div class="starry-background">
    <div class="nebula nebula-1"></div>
    <div class="nebula nebula-2"></div>
    <div class="nebula nebula-3"></div>
    <div 
      v-for="star in stars" 
      :key="star.id" 
      class="star"
      :style="{
        left: `${star.x}%`,
        top: `${star.y}%`,
        width: `${star.size}px`,
        height: `${star.size}px`,
        opacity: star.opacity,
        animationDelay: `${star.delay}s`,
        animationDuration: `${star.duration}s`
      }"
    ></div>
  </div>
</template>

<style scoped>
.starry-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
}

.nebula-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #3b4a9c, transparent);
  top: 10%;
  left: -10%;
}

.nebula-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #2d4a6e, transparent);
  bottom: 20%;
  right: -15%;
}

.nebula-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #4a5568, transparent);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.star {
  position: absolute;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
  animation: twinkle ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
    box-shadow: 0 0 3px rgba(255, 255, 255, 0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
  }
}
</style>
