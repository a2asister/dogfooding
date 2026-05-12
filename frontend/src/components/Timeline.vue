<script setup lang="ts">
import { computed } from 'vue'
import LogCard from './LogCard.vue'
import type { Log } from '../types'

interface Props {
  logs: Log[]
}

interface Emits {
  (e: 'delete', id: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const groupedLogs = computed(() => {
  const groups: { [key: string]: Log[] } = {}
  props.logs.forEach(log => {
    const date = new Date(log.createdAt).toLocaleDateString('zh-CN')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(log)
  })
  return groups
})
</script>

<template>
  <div class="timeline">
    <div v-for="(logs, date) in groupedLogs" :key="date" class="timeline-group">
      <div class="timeline-date">
        <span class="date-badge">{{ date }}</span>
        <div class="timeline-line"></div>
      </div>
      <div class="timeline-cards">
        <LogCard
          v-for="(log, index) in logs"
          :key="log.id"
          :log="log"
          :index="index"
          @delete="emit('delete', $event)"
        />
      </div>
    </div>
    <div v-if="logs.length === 0" class="empty-state">
      <p>暂无日志记录，开始记录你的第一条日志吧！</p>
    </div>
  </div>
</template>

<style scoped>
.timeline {
  position: relative;
}

.timeline-group {
  margin-bottom: 30px;
}

.timeline-date {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.date-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  z-index: 1;
}

.timeline-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, #667eea, transparent);
  margin-left: 15px;
}

.timeline-cards {
  padding-left: 10px;
  position: relative;
}

.timeline-cards::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #667eea, transparent);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}
</style>
