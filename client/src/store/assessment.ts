import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAssessmentStore = defineStore('assessment', () => {
  const currentQuestion = ref(0)
  const answers = ref<Array<{ questionId: number; answer: string; score: number }>>([])
  const userId = ref('user_' + Date.now())
  const result = ref<any>(null)

  function setAnswer(questionId: number, answer: string, score: number) {
    const existingIndex = answers.value.findIndex(a => a.questionId === questionId)
    if (existingIndex >= 0) {
      answers.value[existingIndex] = { questionId, answer, score }
    } else {
      answers.value.push({ questionId, answer, score })
    }
  }

  function nextQuestion() {
    currentQuestion.value++
  }

  function reset() {
    currentQuestion.value = 0
    answers.value = []
    result.value = null
  }

  return {
    currentQuestion,
    answers,
    userId,
    result,
    setAnswer,
    nextQuestion,
    reset
  }
})
