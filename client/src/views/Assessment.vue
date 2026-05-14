<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAssessmentStore } from '@/store/assessment'
import { questions, calculateResult } from '@/data/questions'
import { saveAssessment } from '@/api'
import { ref, computed, onMounted } from 'vue'

const router = useRouter()
const store = useAssessmentStore()
const selectedOption = ref<number | null>(null)
const isAnimating = ref(false)
const emotionParticles = ref<Array<{ x: number; y: number; color: string; size: number }>>([])

const currentQuestion = computed(() => questions[store.currentQuestion])
const progress = computed(() => ((store.currentQuestion + 1) / questions.length) * 100)

function spawnParticles() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFEAA7', '#DDA0DD']
  for (let i = 0; i < 15; i++) {
    emotionParticles.value.push({
      x: 50 + (Math.random() - 0.5) * 40,
      y: 50 + (Math.random() - 0.5) * 40,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 15 + 5
    })
  }
  setTimeout(() => {
    emotionParticles.value = []
  }, 1000)
}

function selectOption(index: number) {
  if (isAnimating.value) return
  selectedOption.value = index
}

async function nextQuestion() {
  if (selectedOption.value === null || isAnimating.value) return
  
  isAnimating.value = true
  spawnParticles()
  
  const option = currentQuestion.value.options[selectedOption.value]
  store.setAnswer(currentQuestion.value.id, option.text, option.score)
  
  setTimeout(async () => {
    if (store.currentQuestion < questions.length - 1) {
      store.nextQuestion()
      selectedOption.value = null
    } else {
      const scores = store.answers.map(a => a.score)
      const result = calculateResult(scores)
      store.result = result
      
      await saveAssessment(store.userId, store.answers, result)
      router.push('/result')
    }
    isAnimating.value = false
  }, 600)
}

function goBack() {
  router.push('/')
}

onMounted(() => {
  if (store.currentQuestion >= questions.length) {
    store.reset()
  }
})
</script>

<template>
  <div class="assessment">
    <div class="emotion-particles">
      <div
        v-for="(particle, index) in emotionParticles"
        :key="index"
        class="emotion-particle"
        :style="{
          left: particle.x + '%',
          top: particle.y + '%',
          width: particle.size + 'px',
          height: particle.size + 'px',
          backgroundColor: particle.color
        }"
      />
    </div>

    <div class="header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="progress-text">{{ store.currentQuestion + 1 }} / {{ questions.length }}</span>
    </div>

    <div class="question-card" :class="{ animating: isAnimating }">
      <h2 class="question-text">{{ currentQuestion.text }}</h2>
      
      <div class="options">
        <div
          v-for="(option, index) in currentQuestion.options"
          :key="index"
          class="option-card"
          :class="{ selected: selectedOption === index }"
          @click="selectOption(index)"
        >
          <div class="option-radio">
            <div class="option-radio-inner" v-if="selectedOption === index"></div>
          </div>
          <span class="option-text">{{ option.text }}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <button 
        class="next-btn" 
        :class="{ enabled: selectedOption !== null }"
        :disabled="selectedOption === null"
        @click="nextQuestion"
      >
        {{ store.currentQuestion < questions.length - 1 ? '下一题' : '查看结果' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.assessment {
  min-height: 100vh;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.emotion-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.emotion-particle {
  position: absolute;
  border-radius: 50%;
  animation: particleFade 1s ease-out forwards;
}

@keyframes particleFade {
  0% {
    opacity: 1;
    transform: scale(1) translate(0, 0);
  }
  100% {
    opacity: 0;
    transform: scale(0.5) translate(var(--tx, 50px), var(--ty, -50px));
  }
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;
  position: relative;
  z-index: 10;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.progress-container {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #FF6B6B, #FFE66D);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  color: white;
  font-weight: 600;
  min-width: 60px;
}

.question-card {
  max-width: 700px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 10;
  transition: all 0.5s ease;
}

.question-card.animating {
  transform: scale(0.95);
  opacity: 0.8;
}

.question-text {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 2.5rem;
  text-align: center;
  line-height: 1.6;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: #f7fafc;
  border: 2px solid transparent;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-card:hover {
  background: #edf2f7;
  transform: translateX(5px);
}

.option-card.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.option-radio {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid #cbd5e0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.option-card.selected .option-radio {
  border-color: white;
}

.option-radio-inner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  animation: popIn 0.3s ease;
}

@keyframes popIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.option-text {
  font-size: 1.05rem;
  flex: 1;
}

.footer {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  position: relative;
  z-index: 10;
}

.next-btn {
  padding: 1rem 3rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.next-btn.enabled {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
}

.next-btn.enabled:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(255, 107, 107, 0.5);
}
</style>
