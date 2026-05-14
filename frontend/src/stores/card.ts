import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface CardTemplate {
  id: number
  name: string
  description: string
  category: string
  background: string
  defaultContent: {
    title: string
    message: string
  }
  decorations: Array<{ id: number; emoji: string; x: number; y: number }>
}

export interface Card {
  id: number
  title: string
  message: string
  senderName: string
  receiverName: string
  background: string
  music: string
  decorations: Array<{ id: number; emoji: string; x: number; y: number }>
  shareCode: string
  isReceived: boolean
  createdAt: string
  receivedAt: string | null
  senderId: number | null
  receiverId: number | null
}

export const useCardStore = defineStore('card', () => {
  const templates = ref<CardTemplate[]>([])
  const sentCards = ref<Card[]>([])
  const receivedCards = ref<Card[]>([])

  const setTemplates = (data: CardTemplate[]): void => {
    templates.value = data
  }

  const setCards = (data: { sent: Card[]; received: Card[] }): void => {
    sentCards.value = data.sent
    receivedCards.value = data.received
  }

  const addSentCard = (card: Card): void => {
    sentCards.value.unshift(card)
  }

  const removeCard = (id: number): void => {
    sentCards.value = sentCards.value.filter(c => c.id !== id)
    receivedCards.value = receivedCards.value.filter(c => c.id !== id)
  }

  return {
    templates,
    sentCards,
    receivedCards,
    setTemplates,
    setCards,
    addSentCard,
    removeCard
  }
})
