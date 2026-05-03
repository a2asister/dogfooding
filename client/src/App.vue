<template>
  <div class="app">
    <nav class="nav">
      <router-link to="/" class="nav-item" active-class="active">
        <span>⚙️ 弹幕配置</span>
      </router-link>
      <router-link to="/demo" class="nav-item" active-class="active">
        <span>🎬 弹幕演示</span>
      </router-link>
      <router-link to="/sync" class="nav-item" active-class="active">
        <span>☁️ 云同步</span>
      </router-link>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { healthCheck } from '@/api'

onMounted(async () => {
  try {
    await healthCheck()
    console.log('后端服务连接成功')
  } catch (error) {
    console.error('后端服务连接失败，请确保服务已启动:', error)
  }
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-content {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
}
</style>
