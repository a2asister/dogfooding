import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { User } from './user'
import { useUserStore } from './user'

export interface Message {
  messageId: string
  fromUserId: number
  toUserId: number
  content: string
  createdAt: string
  isRead?: number
  fromUsername?: string
}

export interface Friend extends User {
  unread_count: number
}

export const useChatStore = defineStore('chat', () => {
  const userStore = useUserStore()
  const friends = ref<Friend[]>([])
  const currentFriend = ref<Friend | null>(null)
  const messages = ref<Message[]>([])
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 10

  const currentUserId = computed(() => userStore.user?.id ?? 0)

  const unreadTotal = computed(() => {
    return friends.value.reduce((sum, f) => sum + f.unread_count, 0)
  })

  const connectWebSocket = (token: string) => {
    if (ws.value && (ws.value.readyState === WebSocket.OPEN || ws.value.readyState === WebSocket.CONNECTING)) {
      return
    }

    try {
      ws.value = new WebSocket('ws://localhost:4525')
      
      ws.value.onopen = () => {
        isConnected.value = true
        reconnectAttempts.value = 0
        ws.value?.send(JSON.stringify({ type: 'auth', token }))
      }

      ws.value.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'message') {
          messages.value.push({
            messageId: data.messageId,
            fromUserId: data.fromUserId,
            toUserId: data.toUserId,
            content: data.content,
            createdAt: data.createdAt,
            fromUsername: data.fromUsername
          })
          
          if (currentFriend.value?.id !== data.fromUserId) {
            const friend = friends.value.find(f => f.id === data.fromUserId)
            if (friend) {
              friend.unread_count++
            }
          }
        }
      }

      ws.value.onclose = () => {
        isConnected.value = false
        if (reconnectAttempts.value < maxReconnectAttempts) {
          reconnectAttempts.value++
          setTimeout(() => connectWebSocket(token), 3000)
        }
      }

      ws.value.onerror = () => {
        isConnected.value = false
      }
    } catch (e) {
      console.error('WebSocket 连接失败:', e)
    }
  }

  const sendMessage = (toUserId: number, content: string) => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      return false
    }

    const messageId = uuidv4()
    ws.value.send(JSON.stringify({
      type: 'message',
      messageId,
      toUserId,
      content
    }))

    messages.value.push({
      messageId,
      fromUserId: currentUserId.value,
      toUserId,
      content,
      createdAt: new Date().toISOString()
    })

    return true
  }

  const setFriends = (newFriends: Friend[]) => {
    friends.value = newFriends
  }

  const setCurrentFriend = (friend: Friend) => {
    currentFriend.value = friend
    friend.unread_count = 0
  }

  const setMessages = (newMessages: Message[]) => {
    messages.value = newMessages
  }

  const disconnectWebSocket = () => {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
  }

  return {
    friends,
    currentFriend,
    messages,
    isConnected,
    currentUserId,
    unreadTotal,
    connectWebSocket,
    disconnectWebSocket,
    sendMessage,
    setFriends,
    setCurrentFriend,
    setMessages
  }
})
