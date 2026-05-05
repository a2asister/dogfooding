import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { robotApi, type Robot } from '@/api/robot'

export const useRobotStore = defineStore('robot', () => {
  const robots = ref<Robot[]>([])
  const loading = ref(false)

  const idleRobots = computed(() =>
    robots.value.filter((r) => r.status === 'idle'),
  )

  const workingRobots = computed(() =>
    robots.value.filter((r) => r.status === 'working' || r.status === 'moving'),
  )

  const lowBatteryRobots = computed(() =>
    robots.value.filter((r) => r.batteryLevel < 30),
  )

  async function fetchRobots() {
    loading.value = true
    try {
      robots.value = await robotApi.getRobots()
    } catch (error) {
      console.error('Failed to fetch robots:', error)
    } finally {
      loading.value = false
    }
  }

  async function createRobot(data: Parameters<typeof robotApi.createRobot>[0]) {
    const newRobot = await robotApi.createRobot(data)
    robots.value.push(newRobot)
    return newRobot
  }

  async function updateRobot(id: string, data: Partial<Robot>) {
    const updatedRobot = await robotApi.updateRobot(id, data)
    const index = robots.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      robots.value[index] = updatedRobot
    }
    return updatedRobot
  }

  async function deleteRobot(id: string) {
    await robotApi.deleteRobot(id)
    robots.value = robots.value.filter((r) => r.id !== id)
  }

  async function moveRobot(id: string) {
    const updatedRobot = await robotApi.moveRobot(id)
    const index = robots.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      robots.value[index] = updatedRobot
    }
    return updatedRobot
  }

  return {
    robots,
    loading,
    idleRobots,
    workingRobots,
    lowBatteryRobots,
    fetchRobots,
    createRobot,
    updateRobot,
    deleteRobot,
    moveRobot,
  }
})
