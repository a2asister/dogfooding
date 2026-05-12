<script setup lang="ts">
import { ref } from 'vue'
import type { Log } from '../types'

interface Props {
  log: Log
  index: number
}

interface Emits {
  (e: 'delete', id: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isDeleting = ref(false)

const handleDelete = (id: number) => {
  isDeleting.value = true
  setTimeout(() => {
    emit('delete', id)
  }, 500)
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div
    class="log-card"
    :class="{ 'deleting': isDeleting }"
    :style="{ animationDelay: `${index * 0.05}s` }"
  >
    <div class="card-content">
      <div class="card-header">
        <h3 class="title">{{ log.title }}</h3>
        <span class="category">{{ log.category }}</span>
      </div>
      <p class="content">{{ log.content }}</p>
      <div class="card-footer">
        <span class="date">{{ formatDate(log.createdAt) }}</span>
        <button class="delete-btn" @click="handleDelete(log.id)">删除</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.log-card {
  animation: slideIn 0.5s ease-out forwards;
  opacity: 0;
  transform: translateX(100px);
}

.log-card.deleting {
  animation: fadeOut 0.5s ease-out forwards;
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeOut {
  to {
    opacity: 0;
    transform: translateX(-100px) scale(0.8);
  }
}

.card-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  margin: 10px 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.card-content:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title {
  color: white;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.category {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  color: white;
  font-size: 12px;
}

.content {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 0 0 15px 0;
  font-size: 14px;
  max-height: 100px;
  overflow-y: auto;
  animation: highlightScroll 2s ease-in-out;
}

@keyframes highlightScroll {
  0%, 100% {
    background-position: 0 0;
  }
  50% {
    background-position: 100% 0;
  }
}

.content::-webkit-scrollbar {
  width: 4px;
}

.content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.date {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.delete-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 12px;
}

.delete-btn:hover {
  background: rgba(255, 100, 100, 0.5);
}
</style>
