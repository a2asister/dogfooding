import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const topics = ref([])
  const tasks = ref([])
  const users = ref([])
  const organizations = ref([])
  const whitelist = ref([])
  const currentUser = ref({
    id: 'demo-user-1',
    name: '演示用户',
    email: 'demo@example.com',
    role: 'manager',
    organizationId: 'demo-org-1',
    permissions: {
      canCreateTopic: true,
      canComment: true,
      canResolve: true,
      canManageOrg: true
    }
  })

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/topics')
      topics.value = await response.json()
    } catch (error) {
      console.error('获取议题失败:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      tasks.value = await response.json()
    } catch (error) {
      console.error('获取任务失败:', error)
    }
  }

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations')
      organizations.value = await response.json()
    } catch (error) {
      console.error('获取组织架构失败:', error)
    }
  }

  const fetchWhitelist = async () => {
    try {
      const response = await fetch('/api/whitelist')
      whitelist.value = await response.json()
    } catch (error) {
      console.error('获取白名单失败:', error)
    }
  }

  const createTopic = async (topicData) => {
    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...topicData,
          creatorId: currentUser.value.id
        })
      })
      const newTopic = await response.json()
      topics.value.unshift(newTopic)
      return newTopic
    } catch (error) {
      console.error('创建议题失败:', error)
      throw error
    }
  }

  const createTask = async (taskData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })
      const newTask = await response.json()
      tasks.value.unshift(newTask)
      return newTask
    } catch (error) {
      console.error('创建任务失败:', error)
      throw error
    }
  }

  const stats = computed(() => ({
    totalTopics: topics.value.length,
    openTopics: topics.value.filter(t => t.status === 'open').length,
    resolvedTopics: topics.value.filter(t => t.status === 'resolved').length,
    totalTasks: tasks.value.length,
    pendingTasks: tasks.value.filter(t => t.status === 'pending').length,
    inProgressTasks: tasks.value.filter(t => t.status === 'in_progress').length,
    completedTasks: tasks.value.filter(t => t.status === 'completed').length
  }))

  return {
    topics,
    tasks,
    users,
    organizations,
    whitelist,
    currentUser,
    fetchTopics,
    fetchTasks,
    fetchOrganizations,
    fetchWhitelist,
    createTopic,
    createTask,
    stats
  }
})
