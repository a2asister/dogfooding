<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import LogForm from './components/LogForm.vue'
import Timeline from './components/Timeline.vue'
import type { Log, CreateLogInput } from './types'

const GET_LOGS = gql`
  query GetLogs {
    logs {
      id
      title
      content
      category
      createdAt
    }
  }
`

const CREATE_LOG = gql`
  mutation CreateLog($createLogInput: CreateLogInput!) {
    createLog(createLogInput: $createLogInput) {
      id
      title
      content
      category
      createdAt
    }
  }
`

const DELETE_LOG = gql`
  mutation DeleteLog($id: ID!) {
    removeLog(id: $id) {
      id
    }
  }
`

const { result, loading } = useQuery(GET_LOGS)

const { mutate: createLog } = useMutation(CREATE_LOG, {
  update(cache, { data: { createLog } }) {
    const existing = cache.readQuery<{ logs: Log[] }>({ query: GET_LOGS })
    if (existing) {
      cache.writeQuery({
        query: GET_LOGS,
        data: { logs: [createLog, ...existing.logs] }
      })
    }
  }
})

const { mutate: deleteLog } = useMutation(DELETE_LOG, {
  update(cache, { data: { removeLog } }) {
    const existing = cache.readQuery<{ logs: Log[] }>({ query: GET_LOGS })
    if (existing) {
      cache.writeQuery({
        query: GET_LOGS,
        data: { logs: existing.logs.filter(log => log.id !== removeLog.id) }
      })
    }
  }
})

const logs = ref<Log[]>([])

watch(result, (newResult) => {
  if (newResult?.logs) {
    logs.value = newResult.logs
  }
}, { immediate: true })

const handleCreateLog = async (input: CreateLogInput) => {
  try {
    await createLog({ createLogInput: input })
  } catch (error) {
    console.error('创建日志失败:', error)
  }
}

const handleDeleteLog = async (id: number) => {
  try {
    await deleteLog({ id })
  } catch (error) {
    console.error('删除日志失败:', error)
  }
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>📝 极简动态日志</h1>
      <p class="subtitle">记录生活的每一个精彩瞬间</p>
    </header>
    <main class="main-content">
      <LogForm @submit="handleCreateLog" />
      <div v-if="loading" class="loading">加载中...</div>
      <Timeline v-else :logs="logs" @delete="handleDeleteLog" />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px 0;
}

.header h1 {
  color: #333;
  font-size: 28px;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

.main-content {
  position: relative;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

.card-stack {
  position: relative;
  perspective: 1000px;
}

.card-stack::before,
.card-stack::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  opacity: 0.3;
  z-index: -1;
}

.card-stack::before {
  transform: translateY(10px) scale(0.98);
}

.card-stack::after {
  transform: translateY(20px) scale(0.96);
}
</style>
