<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import QuizCard from './components/QuizCard.vue'
import ComboEffect from './components/ComboEffect.vue'
import { getQuestions, submitAnswer } from './api'

interface Question {
  id: number
  question: string
  options: string[]
  answer: number
  explanation: string
}

const currentQuestionIndex = ref(0)
const questions = ref<Question[]>([])
const selectedAnswer = ref<number | null>(null)
const isFlipped = ref(false)
const isCorrect = ref(false)
const combo = ref(0)
const showCombo = ref(false)
const cardAnimation = ref('')
const showError = ref(false)
const loading = ref(true)

const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || null
})

const score = computed(() => {
  return questions.value.reduce((acc, q, index) => {
    if (index < currentQuestionIndex.value) {
      return acc + 1
    }
    return acc
  }, 0)
})

onMounted(async () => {
  try {
    const response = await getQuestions()
    questions.value = response
  } catch (error) {
    console.error('Failed to load questions:', error)
    questions.value = [
      {
        id: 1,
        question: 'JavaScript 中，以下哪个方法用于数组遍历并返回新数组？',
        options: ['forEach', 'map', 'filter', 'reduce'],
        answer: 1,
        explanation: 'map() 方法创建一个新数组，其结果是该数组中的每个元素是调用一次提供的函数后的返回值。'
      },
      {
        id: 2,
        question: 'CSS 中，flex 容器的主轴方向由哪个属性控制？',
        options: ['flex-wrap', 'flex-direction', 'justify-content', 'align-items'],
        answer: 1,
        explanation: 'flex-direction 属性指定了弹性子元素在父容器中的位置和方向。'
      },
      {
        id: 3,
        question: 'Vue 3 中，以下哪个是响应式 API？',
        options: ['ref', 'computed', 'watch', '以上都是'],
        answer: 3,
        explanation: 'ref、computed、watch 都是 Vue 3 中的响应式 API。'
      },
      {
        id: 4,
        question: 'TypeScript 中，interface 和 type 的主要区别是？',
        options: ['没有区别', 'interface 可以被扩展，type 不行', 'interface 可以声明合并，type 不行', 'type 更灵活'],
        answer: 2,
        explanation: 'interface 可以被多次声明，并且会自动合并；而 type 只能声明一次。'
      },
      {
        id: 5,
        question: 'HTTP 状态码 304 表示什么？',
        options: ['请求成功', '重定向', '未修改', '服务器错误'],
        answer: 2,
        explanation: '304 Not Modified 表示资源未被修改，可以使用缓存的版本。'
      }
    ]
  } finally {
    loading.value = false
  }
})

const selectAnswer = async (index: number) => {
  if (selectedAnswer.value !== null || !currentQuestion.value) return

  selectedAnswer.value = index
  isFlipped.value = true

  const correct = index === currentQuestion.value.answer
  isCorrect.value = correct

  try {
    await submitAnswer({
      userId: 'user_001',
      questionId: currentQuestion.value.id,
      isCorrect: correct
    })
  } catch (error) {
    console.error('Failed to submit answer:', error)
  }

  if (correct) {
    combo.value++
    if (combo.value >= 2) {
      showCombo.value = true
      setTimeout(() => {
        showCombo.value = false
      }, 2000)
    }
  } else {
    combo.value = 0
    showError.value = true
    setTimeout(() => {
      showError.value = false
    }, 1000)
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value >= questions.value.length - 1) {
    return
  }

  cardAnimation.value = 'slide-out'
  
  setTimeout(() => {
    currentQuestionIndex.value++
    selectedAnswer.value = null
    isFlipped.value = false
    isCorrect.value = false
    cardAnimation.value = 'slide-in'
    
    setTimeout(() => {
      cardAnimation.value = ''
    }, 500)
  }, 300)
}

const resetGame = () => {
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  isFlipped.value = false
  isCorrect.value = false
  combo.value = 0
  cardAnimation.value = ''
  showError.value = false
}
</script>

<template>
  <div class="app-container">
    <div class="game-info">
      <div class="info-item">
        <span class="info-label">题目</span>
        <span class="info-value">{{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">得分</span>
        <span class="info-value">{{ score }}</span>
      </div>
      <div class="info-item combo-badge" :class="{ active: combo >= 2 }">
        <span class="info-label">连击</span>
        <span class="info-value">{{ combo }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="currentQuestion" class="card-wrapper" :class="cardAnimation">
      <QuizCard
        :question="currentQuestion"
        :selected-answer="selectedAnswer"
        :is-flipped="isFlipped"
        :is-correct="isCorrect"
        :show-error="showError"
        @select-answer="selectAnswer"
      />
    </div>

    <div v-else class="game-over">
      <h1>🎉 答题完成！</h1>
      <p class="final-score">最终得分：{{ score }} / {{ questions.length }}</p>
      <button class="btn-primary" @click="resetGame">再来一次</button>
    </div>

    <div v-if="!loading && currentQuestion && selectedAnswer !== null" class="action-buttons">
      <button
        v-if="currentQuestionIndex < questions.length - 1"
        class="btn-primary"
        @click="nextQuestion"
      >
        下一题 →
      </button>
      <button
        v-else
        class="btn-primary"
        @click="resetGame"
      >
        完成
      </button>
    </div>

    <ComboEffect v-if="showCombo" :combo="combo" />
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  max-width: 600px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.game-info {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 15px 30px;
  border-radius: 50px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
}

.info-label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.info-value {
  font-size: 24px;
  font-weight: bold;
}

.combo-badge.active {
  color: #ffd700;
  animation: pulse 0.5s ease-in-out;
}

.card-wrapper {
  width: 100%;
  perspective: 1000px;
}

.card-wrapper.slide-out {
  animation: slideOut 0.3s ease-in forwards;
}

.card-wrapper.slide-in {
  animation: slideIn 0.5s ease-out forwards;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.game-over {
  text-align: center;
  color: white;
  padding: 40px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
}

.game-over h1 {
  font-size: 36px;
  margin-bottom: 20px;
}

.final-score {
  font-size: 24px;
  margin-bottom: 30px;
}

.action-buttons {
  margin-top: 30px;
}

.btn-primary {
  padding: 15px 40px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(245, 87, 108, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

@keyframes slideOut {
  from {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateX(-150%) scale(0.8);
    opacity: 0;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(150%) scale(0.8);
    opacity: 0;
  }
  to {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
