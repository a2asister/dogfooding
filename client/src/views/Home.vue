<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAssessmentStore } from '@/store/assessment'
import { ref, onMounted } from 'vue'

const router = useRouter()
const store = useAssessmentStore()
const particles = ref<Array<{ x: number; y: number; size: number; color: string; delay: number }>>([])

onMounted(() => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
  for (let i = 0; i < 30; i++) {
    particles.value.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2
    })
  }
})

function startAssessment() {
  store.reset()
  router.push('/assessment')
}

function goToHistory() {
  router.push('/history')
}
</script>

<template>
  <div class="home">
    <div class="particles">
      <div
        v-for="(particle, index) in particles"
        :key="index"
        class="particle"
        :style="{
          left: particle.x + '%',
          top: particle.y + '%',
          width: particle.size + 'px',
          height: particle.size + 'px',
          backgroundColor: particle.color,
          animationDelay: particle.delay + 's'
        }"
      />
    </div>
    
    <div class="content">
      <h1 class="title">
        <span class="title-char" v-for="(char, index) in '情绪动态气质测评'" :key="index" :style="{ animationDelay: index * 0.1 + 's' }">
          {{ char }}
        </span>
      </h1>
      
      <p class="subtitle">探索你的内心世界，发现独特的气质色彩</p>
      
      <div class="buttons">
        <button class="btn primary" @click="startAssessment">
          <span class="btn-text">开始测评</span>
          <div class="btn-shine"></div>
        </button>
        <button class="btn secondary" @click="goToHistory">
          查看历史
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
  animation: float 4s ease-in-out infinite;
}

.content {
  text-align: center;
  z-index: 10;
  padding: 2rem;
}

.title {
  font-size: 3rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.title-char {
  display: inline-block;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 3rem;
}

.buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn.primary {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
}

.btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(255, 107, 107, 0.5);
}

.btn.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn.secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}
</style>
