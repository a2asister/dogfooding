import { ref, onUnmounted } from 'vue'
import { io } from 'socket.io-client'

const socket = ref(null)
const isConnected = ref(false)
const connectionError = ref(null)
const realtimeData = ref(null)
const meters = ref([])
const devices = ref([])
const energyData = ref([])
const meterHistory = ref([])
const alerts = ref([])
const messageHistory = ref([])

const initSocket = (url = 'http://localhost:5560') => {
  if (socket.value?.connected) {
    console.log('WebSocket 已连接，跳过初始化')
    return socket
  }

  console.log('正在连接 WebSocket:', url)
  
  socket.value = io(url, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000
  })

  socket.value.on('connect', () => {
    isConnected.value = true
    connectionError.value = null
    console.log('WebSocket 连接成功:', socket.value.id)
    addMessage('system', '已连接到实时数据服务')
  })

  socket.value.on('disconnect', (reason) => {
    isConnected.value = false
    console.log('WebSocket 断开连接:', reason)
    addMessage('system', `连接已断开: ${reason}`)
  })

  socket.value.on('connect_error', (error) => {
    isConnected.value = false
    connectionError.value = error.message
    console.error('WebSocket 连接错误:', error)
    addMessage('error', `连接错误: ${error.message}`)
  })

  socket.value.on('welcome', (data) => {
    console.log('收到欢迎消息:', data)
    addMessage('info', data.message)
  })

  socket.value.on('initialData', (data) => {
    console.log('收到初始数据')
    meters.value = data.meters || []
    devices.value = data.devices || []
    energyData.value = data.energyData || []
    meterHistory.value = data.meterHistory || []
    alerts.value = data.alerts || []
    addMessage('info', '初始数据加载完成')
  })

  socket.value.on('realtimeData', (data) => {
    realtimeData.value = data
    if (data.meters) {
      meters.value = data.meters
    }
    if (data.devices) {
      devices.value = data.devices
    }
    if (data.energyData) {
      energyData.value.push(data.energyData)
      if (energyData.value.length > 100) {
        energyData.value.shift()
      }
    }
  })

  socket.value.on('metersData', (data) => {
    meters.value = data
    addMessage('info', '电表数据已更新')
  })

  socket.value.on('devicesData', (data) => {
    devices.value = data
    addMessage('info', '设备数据已更新')
  })

  socket.value.on('energyData', (data) => {
    energyData.value = data
    addMessage('info', '能耗数据已更新')
  })

  socket.value.on('meterHistoryData', (data) => {
    meterHistory.value = data
    addMessage('info', '历史数据已更新')
  })

  socket.value.on('alertsData', (data) => {
    alerts.value = data
    addMessage('info', '告警数据已更新')
  })

  socket.value.on('deviceStatusChanged', (device) => {
    const index = devices.value.findIndex(d => d.id === device.id)
    if (index !== -1) {
      devices.value[index] = device
    }
    addMessage('info', `设备 ${device.name} 状态已变更`)
  })

  socket.value.on('deviceControlled', (device) => {
    const index = devices.value.findIndex(d => d.id === device.id)
    if (index !== -1) {
      devices.value[index] = device
    }
    addMessage('info', `设备 ${device.name} 控制命令已执行`)
  })

  socket.value.on('alertResolved', (alert) => {
    const index = alerts.value.findIndex(a => a.id === alert.id)
    if (index !== -1) {
      alerts.value[index] = alert
    }
    addMessage('info', `告警已处理: ${alert.title}`)
  })

  socket.value.on('newAlert', (alert) => {
    alerts.value.unshift(alert)
    addMessage('warning', `新告警: ${alert.title}`)
  })

  socket.value.on('alerts', (unresolvedAlerts) => {
    unresolvedAlerts.forEach(alert => {
      const existing = alerts.value.find(a => a.id === alert.id)
      if (!existing) {
        alerts.value.unshift(alert)
      }
    })
  })

  socket.value.on('error', (error) => {
    console.error('WebSocket 错误:', error)
    addMessage('error', error.message || '发生未知错误')
  })

  return socket
}

const disconnectSocket = () => {
  if (socket.value) {
    socket.value.disconnect()
    socket.value = null
    isConnected.value = false
    console.log('WebSocket 已手动断开')
  }
}

const requestData = (dataType) => {
  if (socket.value?.connected) {
    socket.value.emit('requestData', dataType)
    console.log('请求数据:', dataType)
  } else {
    console.warn('WebSocket 未连接，无法请求数据')
  }
}

const addMessage = (type, text) => {
  messageHistory.value.push({
    type,
    text,
    timestamp: new Date().toISOString()
  })
  if (messageHistory.value.length > 50) {
    messageHistory.value.shift()
  }
}

const getMeterById = (id) => {
  return meters.value.find(m => m.id === id)
}

const getDeviceById = (id) => {
  return devices.value.find(d => d.id === id)
}

const getMeterHistoryByMeterId = (meterId, limit = 50) => {
  return meterHistory.value
    .filter(h => h.meterId === meterId)
    .slice(-limit)
}

const getUnresolvedAlerts = () => {
  return alerts.value.filter(a => !a.resolved)
}

const useSocket = () => {
  onUnmounted(() => {
  })

  return {
    socket,
    isConnected,
    connectionError,
    realtimeData,
    meters,
    devices,
    energyData,
    meterHistory,
    alerts,
    messageHistory,
    initSocket,
    disconnectSocket,
    requestData,
    getMeterById,
    getDeviceById,
    getMeterHistoryByMeterId,
    getUnresolvedAlerts
  }
}

export {
  initSocket,
  disconnectSocket,
  requestData,
  useSocket,
  socket,
  isConnected,
  meters,
  devices,
  energyData,
  alerts
}
