import { defineStore } from 'pinia'
import { ref } from 'vue'
import { obstacleApi, type Obstacle } from '@/api/obstacle'

export const useObstacleStore = defineStore('obstacle', () => {
  const obstacles = ref<Obstacle[]>([])
  const loading = ref(false)

  async function fetchObstacles() {
    loading.value = true
    try {
      obstacles.value = await obstacleApi.getObstacles()
    } catch (error) {
      console.error('Failed to fetch obstacles:', error)
    } finally {
      loading.value = false
    }
  }

  async function addObstacle(data: Parameters<typeof obstacleApi.addObstacle>[0]) {
    const newObstacle = await obstacleApi.addObstacle(data)
    obstacles.value.push(newObstacle)
    return newObstacle
  }

  async function removeObstacle(id: string) {
    await obstacleApi.removeObstacle(id)
    obstacles.value = obstacles.value.filter((o) => o.id !== id)
  }

  async function updateDynamicObstacles() {
    await obstacleApi.updateDynamicObstacles()
    await fetchObstacles()
  }

  return {
    obstacles,
    loading,
    fetchObstacles,
    addObstacle,
    removeObstacle,
    updateDynamicObstacles,
  }
})
