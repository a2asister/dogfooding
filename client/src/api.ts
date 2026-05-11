import axios from 'axios'

const API_BASE = '/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
})

export interface Question {
  id: number
  question: string
  options: string[]
  answer: number
  explanation: string
}

export interface AnswerSubmission {
  userId: string
  questionId: number
  isCorrect: boolean
}

export const getQuestions = async (): Promise<Question[]> => {
  const response = await api.get('/questions')
  return response.data
}

export const submitAnswer = async (data: AnswerSubmission): Promise<void> => {
  await api.post('/answers', data)
}

export const getAnswerRecords = async (userId: string) => {
  const response = await api.get(`/answers/${userId}`)
  return response.data
}
