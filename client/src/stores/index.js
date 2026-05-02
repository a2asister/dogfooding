import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { seatApi } from '@/api'

export const useSeatStore = defineStore('seat', () => {
  const selectedSeats = ref([])
  const lockedSeats = ref([])
  const lockExpiresAt = ref(null)
  const lockDuration = ref(0)
  const sessionId = ref(null)
  const currentUser = ref('user-' + Math.random().toString(36).substr(2, 9))

  const totalPrice = computed(() => {
    return selectedSeats.value.reduce((sum, seat) => sum + seat.price, 0)
  })

  const seatCount = computed(() => {
    return selectedSeats.value.length
  })

  const selectSeat = (seat) => {
    const index = selectedSeats.value.findIndex(s => s.id === seat.id)
    if (index === -1) {
      selectedSeats.value.push(seat)
    } else {
      selectedSeats.value.splice(index, 1)
    }
  }

  const clearSelectedSeats = () => {
    selectedSeats.value = []
  }

  const setSessionId = (id) => {
    if (sessionId.value !== id) {
      selectedSeats.value = []
      lockedSeats.value = []
      lockExpiresAt.value = null
      lockDuration.value = 0
    }
    sessionId.value = id
  }

  const lockSelectedSeats = async () => {
    if (selectedSeats.value.length === 0) {
      throw new Error('请先选择座位')
    }

    const seatIds = selectedSeats.value.map(seat => seat.id)
    
    try {
      const result = await seatApi.lockSeats({
        sessionId: sessionId.value,
        seatIds,
        userId: currentUser.value
      })

      if (result.data.lockedSeats && result.data.lockedSeats.length > 0) {
        lockedSeats.value = result.data.lockedSeats
        lockDuration.value = result.data.lockDuration
        if (result.data.lockedSeats.length > 0) {
          lockExpiresAt.value = result.data.lockedSeats[0].expiresAt
        }
      }

      return result
    } catch (error) {
      throw error
    }
  }

  const unlockSeats = async (seatIds = null) => {
    const idsToUnlock = seatIds || lockedSeats.value.map(seat => seat.seatId)
    
    if (idsToUnlock.length === 0) {
      return
    }

    try {
      const result = await seatApi.unlockSeats({
        sessionId: sessionId.value,
        seatIds: idsToUnlock,
        userId: currentUser.value
      })

      lockedSeats.value = []
      lockExpiresAt.value = null
      
      return result
    } catch (error) {
      console.error('解锁失败:', error)
      throw error
    }
  }

  const confirmSeats = async () => {
    const seatIds = lockedSeats.value.map(seat => seat.seatId)
    
    if (seatIds.length === 0) {
      throw new Error('没有锁定的座位')
    }

    try {
      const result = await seatApi.confirmSeats({
        sessionId: sessionId.value,
        seatIds,
        userId: currentUser.value
      })

      lockedSeats.value = []
      lockExpiresAt.value = null
      selectedSeats.value = []
      
      return result
    } catch (error) {
      throw error
    }
  }

  const resetStore = () => {
    selectedSeats.value = []
    lockedSeats.value = []
    lockExpiresAt.value = null
    lockDuration.value = 0
    sessionId.value = null
  }

  return {
    selectedSeats,
    lockedSeats,
    lockExpiresAt,
    lockDuration,
    sessionId,
    currentUser,
    totalPrice,
    seatCount,
    selectSeat,
    clearSelectedSeats,
    setSessionId,
    lockSelectedSeats,
    unlockSeats,
    confirmSeats,
    resetStore
  }
})

export const useOrderStore = defineStore('order', () => {
  const orderInfo = ref({
    event: null,
    session: null,
    seats: [],
    totalPrice: 0,
    orderNo: null
  })

  const setOrderInfo = (info) => {
    orderInfo.value = { ...orderInfo.value, ...info }
  }

  const generateOrderNo = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    
    orderInfo.value.orderNo = `TK${year}${month}${day}${random}`
    return orderInfo.value.orderNo
  }

  const clearOrderInfo = () => {
    orderInfo.value = {
      event: null,
      session: null,
      seats: [],
      totalPrice: 0,
      orderNo: null
    }
  }

  return {
    orderInfo,
    setOrderInfo,
    generateOrderNo,
    clearOrderInfo
  }
})
