import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { logsApi } from '@/api'

export const useLogsStore = defineStore('logs', () => {
  const logs = ref([])
  const stats = ref(null)
  const services = ref([])
  const loading = ref(false)
  const total = ref(0)

  const errorLogs = computed(() => 
    logs.value.filter(log => log.level === 'ERROR' || log.level === 'FATAL')
  )

  const logsByService = computed(() => {
    const grouped = {}
    logs.value.forEach(log => {
      if (!grouped[log.service]) {
        grouped[log.service] = []
      }
      grouped[log.service].push(log)
    })
    return grouped
  })

  const logsByType = computed(() => {
    const grouped = {}
    logs.value.forEach(log => {
      if (!grouped[log.type]) {
        grouped[log.type] = []
      }
      grouped[log.type].push(log)
    })
    return grouped
  })

  async function fetchLogs(params = {}) {
    loading.value = true
    try {
      const result = await logsApi.search(params)
      logs.value = result.data || []
      total.value = result.total || 0
    } catch (error) {
      console.error('获取日志失败:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchStats() {
    try {
      const result = await logsApi.getStats()
      stats.value = result
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  async function fetchServices() {
    try {
      const result = await logsApi.getServices()
      services.value = result.data || []
    } catch (error) {
      console.error('获取服务列表失败:', error)
    }
  }

  async function ingestLogs(logsData, type = 'backend') {
    try {
      await logsApi.ingest(logsData, type)
    } catch (error) {
      console.error('提交日志失败:', error)
    }
  }

  function clearLogs() {
    logs.value = []
    total.value = 0
  }

  return {
    logs,
    stats,
    services,
    loading,
    total,
    errorLogs,
    logsByService,
    logsByType,
    fetchLogs,
    fetchStats,
    fetchServices,
    ingestLogs,
    clearLogs
  }
})
