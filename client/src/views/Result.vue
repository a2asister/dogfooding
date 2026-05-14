<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAssessmentStore } from '@/store/assessment'
import { ref, computed, onMounted } from 'vue'

const router = useRouter()
const store = useAssessmentStore()
const showContent = ref(false)
const animateChart = ref(false)
const visibleTags = ref<boolean[]>([])

const result = computed(() => store.result)

onMounted(() => {
  if (!result.value) {
    router.push('/')
    return
  }
  
  setTimeout(() => {
    showContent.value = true
  }, 300)
  
  setTimeout(() => {
    animateChart.value = true
  }, 800)
  
  result.value.tags.forEach((_: string, index: number) => {
    setTimeout(() => {
      visibleTags.value[index] = true
    }, 1200 + index * 150)
  })
})

function goHome() {
  router.push('/')
}

function doAgain() {
  store.reset()
  router.push('/assessment')
}
</script>

<template>
  <div class="result" :style="{
    background: result ? `linear-gradient(135deg, ${result.colors[0]} 0%, ${result.colors[1]} 50%, ${result.colors[2]} 100%)` : ''
  }">
    <div class="fluid-bg">
      <div class="fluid-circle c1"></div>
      <div class="fluid-circle c2"></div>
      <div class="fluid-circle c3"></div>
    </div>

    <div class="content" :class="{ visible: showContent }">
      <div class="result-header">
        <h1 class="temperament-title">{{ result?.temperamentName }}</h1>
        <p class="temperament-desc">{{ result?.description }}</p>
      </div>

      <div class="tags-container">
        <span
          v-for="(tag, index) in result?.tags"
          :key="tag"
          class="tag"
          :class="{ visible: visibleTags[index] }"
        >
          {{ tag }}
        </span>
      </div>

      <div class="chart-container" :class="{ animate: animateChart }">
        <h3 class="chart-title">气质维度</h3>
        <div class="ring-charts">
          <div v-for="(value, key) in result?.scores" :key="key" class="ring-item">
            <div class="ring">
              <svg viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#667eea" />
                    <stop offset="100%" stop-color="#764ba2" />
                  </linearGradient>
                </defs>
                <circle class="ring-bg" cx="50" cy="50" r="40" />
                <circle 
                  class="ring-progress" 
                  cx="50" cy="50" r="40"
                  :style="{
                    strokeDashoffset: animateChart ? 251.2 - (251.2 * value / 100) : 251.2
                  }"
                />
              </svg>
              <div class="ring-value">{{ value }}%</div>
            </div>
            <div class="ring-label">{{ key }}</div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn primary" @click="doAgain">再测一次</button>
        <button class="btn secondary" @click="goHome">返回首页</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.fluid-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.fluid-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.3;
  filter: blur(40px);
  animation: fluidMove 8s ease-in-out infinite;
}

.c1 {
  width: 400px;
  height: 400px;
  top: -100px;
  left: -100px;
  background: rgba(255, 255, 255, 0.5);
}

.c2 {
  width: 300px;
  height: 300px;
  bottom: -50px;
  right: -50px;
  background: rgba(255, 255, 255, 0.4);
  animation-delay: -2s;
}

.c3 {
  width: 250px;
  height: 250px;
  top: 50%;
  left: 50%;
  background: rgba(255, 255, 255, 0.3);
  animation-delay: -4s;
}

@keyframes fluidMove {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.content {
  max-width: 800px;
  width: 100%;
  position: relative;
  z-index: 10;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease;
}

.content.visible {
  opacity: 1;
  transform: translateY(0);
}

.result-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.temperament-title {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.temperament-desc {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  max-width: 600px;
  margin: 0 auto;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.tag {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.25);
  color: white;
  border-radius: 25px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  opacity: 0;
  transform: scale(0) translateY(20px);
  transition: all 0.5s ease;
}

.tag.visible {
  opacity: 1;
  transform: scale(1) translateY(0);
  animation: tagBounce 0.6s ease;
}

@keyframes tagBounce {
  0% { transform: scale(0) translateY(20px); }
  50% { transform: scale(1.2) translateY(-10px); }
  100% { transform: scale(1) translateY(0); }
}

.chart-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 2.5rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.chart-title {
  text-align: center;
  color: #2d3748;
  margin-bottom: 2rem;
  font-size: 1.3rem;
}

.ring-charts {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 2rem;
}

.ring-item {
  text-align: center;
}

.ring {
  width: 120px;
  height: 120px;
  position: relative;
  margin-bottom: 0.75rem;
}

.ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 8;
}

.ring-progress {
  fill: none;
  stroke: url(#ringGradient);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 251.2;
  stroke-dashoffset: 251.2;
  transition: stroke-dashoffset 1.5s ease;
}

.ring-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.4rem;
  font-weight: 700;
  color: #2d3748;
}

.ring-label {
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
}

.actions {
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
}

.btn.primary {
  background: white;
  color: #2d3748;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
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
</style>
