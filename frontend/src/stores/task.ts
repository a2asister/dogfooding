import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskApi, type Task } from '@/api/task'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)

  const pendingTasks = computed(() =>
    tasks.value.filter((t) => t.status === 'pending'),
  )

  const inProgressTasks = computed(() =>
    tasks.value.filter((t) => t.status === 'in_progress' || t.status === 'assigned'),
  )

  const completedTasks = computed(() =>
    tasks.value.filter((t) => t.status === 'completed'),
  )

  const highPriorityTasks = computed(() =>
    tasks.value.filter((t) => t.priority === 'high' && t.status !== 'completed' && t.status !== 'cancelled'),
  )

  async function fetchTasks() {
    loading.value = true
    try {
      tasks.value = await taskApi.getTasks()
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      loading.value = false
    }
  }

  async function createTask(data: Parameters<typeof taskApi.createTask>[0]) {
    const newTask = await taskApi.createTask(data)
    tasks.value.push(newTask)
    return newTask
  }

  async function updateTask(id: string, data: Partial<Task>) {
    const updatedTask = await taskApi.updateTask(id, data)
    const index = tasks.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      tasks.value[index] = updatedTask
    }
    return updatedTask
  }

  async function deleteTask(id: string) {
    await taskApi.deleteTask(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  async function assignTask(id: string) {
    const updatedTask = await taskApi.assignTask(id)
    const index = tasks.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      tasks.value[index] = updatedTask
    }
    return updatedTask
  }

  async function startTask(id: string) {
    const updatedTask = await taskApi.startTask(id)
    const index = tasks.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      tasks.value[index] = updatedTask
    }
    return updatedTask
  }

  async function completeTask(id: string) {
    const updatedTask = await taskApi.completeTask(id)
    const index = tasks.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      tasks.value[index] = updatedTask
    }
    return updatedTask
  }

  async function cancelTask(id: string) {
    const updatedTask = await taskApi.cancelTask(id)
    const index = tasks.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      tasks.value[index] = updatedTask
    }
    return updatedTask
  }

  return {
    tasks,
    loading,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    highPriorityTasks,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    startTask,
    completeTask,
    cancelTask,
  }
})
