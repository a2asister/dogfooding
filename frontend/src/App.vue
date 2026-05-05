<template>
  <div class="app-container">
    <header class="app-header">
      <div class="logo">
        <h1>智慧楼宇能耗智能调度系统</h1>
      </div>
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div 
          :style="{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: isConnected ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
            borderRadius: '20px',
            fontSize: '0.9rem'
          }"
        >
          <span 
            :style="{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: isConnected ? '#4caf50' : '#f44354',
              animation: isConnected ? 'pulse 2s infinite' : 'none'
            }"
          ></span>
          <span>{{ isConnected ? '实时连接' : '连接断开' }}</span>
        </div>
        <router-link to="/alerts" class="nav-item" style="position: relative;">
          <span>异常告警</span>
          <span 
            v-if="unresolvedAlertsCount > 0"
            :style="{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: '#f44354',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600'
            }"
          >{{ unresolvedAlertsCount > 99 ? '99+' : unresolvedAlertsCount }}</span>
        </router-link>
      </div>
      <nav class="nav-menu">
        <router-link to="/" class="nav-item" active-class="active">
          <span>仪表盘</span>
        </router-link>
        <router-link to="/meters" class="nav-item" active-class="active">
          <span>水电表管理</span>
        </router-link>
        <router-link to="/devices" class="nav-item" active-class="active">
          <span>设备控制</span>
        </router-link>
        <router-link to="/ai-suggestions" class="nav-item" active-class="active">
          <span>AI节能建议</span>
        </router-link>
        <router-link to="/reports" class="nav-item" active-class="active">
          <span>能耗报表</span>
        </router-link>
      </nav>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSocket } from './composables/useSocket'

export default {
  name: 'App',
  setup() {
    const { isConnected, alerts, initSocket, disconnectSocket } = useSocket()
    
    const unresolvedAlertsCount = computed(() => {
      return alerts.value.filter(a => !a.resolved).length
    })

    onMounted(() => {
      initSocket()
    })

    onUnmounted(() => {
      disconnectSocket()
    })

    return {
      isConnected,
      unresolvedAlertsCount
    }
  }
}
</script>
