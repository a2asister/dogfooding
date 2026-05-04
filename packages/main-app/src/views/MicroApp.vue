<template>
  <div class="micro-app-container">
    <div id="micro-app-container" class="app-wrapper"></div>
    <div v-if="loading" class="loading-wrapper">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const loading = ref(true)

const handleMount = () => {
  loading.value = false
}

const handleUnmount = () => {
  loading.value = true
}

onMounted(() => {
  window.addEventListener('qiankun:mount', handleMount)
  window.addEventListener('qiankun:unmount', handleUnmount)
  
  setTimeout(() => {
    loading.value = false
  }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('qiankun:mount', handleMount)
  window.removeEventListener('qiankun:unmount', handleUnmount)
})
</script>

<style scoped>
.micro-app-container {
  position: relative;
  width: 100%;
  min-height: 100%;
}

.app-wrapper {
  width: 100%;
  min-height: 100%;
}

.loading-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color);
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
  color: var(--text-secondary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
