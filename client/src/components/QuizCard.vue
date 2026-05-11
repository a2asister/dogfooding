<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import StarParticles from './StarParticles.vue'

interface Question {
  id: number
  question: string
  options: string[]
  answer: number
  explanation: string
}

interface Props {
  question: Question
  selectedAnswer: number | null
  isFlipped: boolean
  isCorrect: boolean
  showError: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  selectAnswer: [index: number]
}>()

const showStars = ref(false)
const shakeAnimation = ref(false)
const glowAnimation = ref(false)
const errorTip = ref(false)

watch(() => props.isFlipped, (newVal, oldVal) => {
  if (newVal && !oldVal && props.isCorrect) {
    setTimeout(() => {
      showStars.value = true
      glowAnimation.value = true
      setTimeout(() => {
        showStars.value = false
        glowAnimation.value = false
      }, 1500)
    }, 600)
  }
})

watch(() => props.showError, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    shakeAnimation.value = true
    errorTip.value = true
    setTimeout(() => {
      shakeAnimation.value = false
      errorTip.value = false
    }, 800)
  }
})

const handleOptionClick = (index: number) => {
  if (props.selectedAnswer !== null) return
  emit('selectAnswer', index)
}
</script>

<template>
  <div class="card-container" :class="{ shake: shakeAnimation, 'glow-green': glowAnimation }">
    <div class="card" :class="{ flipped: isFlipped }">
      <div class="card-face card-front">
        <div class="question-content">
          <h2 class="question-title">问题</h2>
          <p class="question-text">{{ question.question }}</p>
        </div>
        
        <div class="options-list">
          <button
            v-for="(option, index) in question.options"
            :key="index"
            class="option-btn"
            :class="{
              selected: selectedAnswer === index,
              correct: selectedAnswer !== null && index === question.answer,
              wrong: selectedAnswer === index && index !== question.answer
            }"
            :disabled="selectedAnswer !== null"
            @click="handleOptionClick(index)"
          >
            <span class="option-label">{{ String.fromCharCode(65 + index) }}</span>
            <span class="option-text">{{ option }}</span>
          </button>
        </div>

        <div class="hint">
          选择答案查看解析
        </div>
      </div>

      <div class="card-face card-back">
        <div class="answer-content">
          <div class="result-badge" :class="{ correct: isCorrect, wrong: !isCorrect }">
            {{ isCorrect ? '✓ 回答正确！' : '✗ 回答错误' }}
          </div>
          
          <div class="correct-answer">
            <span class="label">正确答案：</span>
            <span class="answer">{{ String.fromCharCode(65 + question.answer) }}</span>
            <span class="answer-text">{{ question.options[question.answer] }}</span>
          </div>

          <div class="explanation">
            <h3 class="explanation-title">📚 解析</h3>
            <p class="explanation-text">{{ question.explanation }}</p>
          </div>
        </div>
      </div>
    </div>

    <StarParticles v-if="showStars" />

    <transition name="slide">
      <div v-if="errorTip" class="error-tip">
        答案错误！
      </div>
    </transition>
  </div>
</template>

<style scoped>
.card-container {
  width: 100%;
  height: 500px;
  perspective: 1500px;
  position: relative;
}

.card-container.shake {
  animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
}

.card-container.glow-green::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 24px;
  background: linear-gradient(45deg, #00ff88, #00ffdd, #00ff88);
  background-size: 400% 400%;
  animation: glow 1.5s ease-in-out infinite;
  z-index: -1;
  filter: blur(15px);
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.card.flipped {
  transform: rotateX(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
  background: white;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 30px;
  overflow: hidden;
}

.card-front {
  display: flex;
  flex-direction: column;
}

.card-back {
  transform: rotateX(180deg);
}

.question-content {
  flex-shrink: 0;
  margin-bottom: 20px;
}

.question-title {
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.question-text {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  line-height: 1.5;
}

.options-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 16px 20px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.option-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #667eea;
  transform: translateX(5px);
}

.option-btn:disabled {
  cursor: not-allowed;
}

.option-btn.selected {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.option-btn.correct {
  background: #00ff88;
  border-color: #00ff88;
  color: #333;
}

.option-btn.wrong {
  background: #ff4757;
  border-color: #ff4757;
  color: white;
}

.option-label {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 50%;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
}

.option-btn.selected .option-label,
.option-btn.correct .option-label,
.option-btn.wrong .option-label {
  background: rgba(255, 255, 255, 0.3);
}

.option-text {
  font-size: 16px;
}

.hint {
  margin-top: 15px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.answer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.result-badge {
  padding: 12px 30px;
  border-radius: 50px;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 25px;
  align-self: center;
}

.result-badge.correct {
  background: linear-gradient(135deg, #00ff88, #00dd77);
  color: #333;
}

.result-badge.wrong {
  background: linear-gradient(135deg, #ff4757, #ff6b7a);
  color: white;
}

.correct-answer {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.correct-answer .label {
  color: #666;
  font-size: 14px;
}

.correct-answer .answer {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  margin: 0 10px;
}

.correct-answer .answer-text {
  font-size: 16px;
  color: #333;
}

.explanation {
  flex: 1;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.explanation-title {
  font-size: 16px;
  color: #667eea;
  margin-bottom: 10px;
}

.explanation-text {
  font-size: 15px;
  color: #555;
  line-height: 1.6;
}

.error-tip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #ff4757, #ff6b7a);
  color: white;
  padding: 15px 40px;
  border-radius: 50px;
  font-size: 20px;
  font-weight: bold;
  z-index: 100;
  box-shadow: 0 10px 30px rgba(255, 71, 87, 0.4);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slide-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) translateY(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) translateY(-30px);
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

@keyframes glow {
  0% {
    background-position: 0% 50%;
    opacity: 1;
  }
  50% {
    background-position: 100% 50%;
    opacity: 0.7;
  }
  100% {
    background-position: 0% 50%;
    opacity: 1;
  }
}
</style>
