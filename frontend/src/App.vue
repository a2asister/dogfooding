<template>
  <div class="app-container">
    <header class="header">
      <div class="logo">
        <h1>组织人力效能分析系统</h1>
      </div>
      <nav class="nav">
        <router-link to="/" class="nav-link" exact-active-class="active">
          <span class="nav-icon">📊</span>
          <span>概览</span>
        </router-link>
        <router-link to="/attendance" class="nav-link" exact-active-class="active">
          <span class="nav-icon">📅</span>
          <span>考勤管理</span>
        </router-link>
        <router-link to="/tasks" class="nav-link" exact-active-class="active">
          <span class="nav-icon">📋</span>
          <span>任务产出</span>
        </router-link>
        <router-link to="/projects" class="nav-link" exact-active-class="active">
          <span class="nav-icon">🗂️</span>
          <span>项目工时</span>
        </router-link>
        <router-link to="/collaboration" class="nav-link" exact-active-class="active">
          <span class="nav-icon">🤝</span>
          <span>协作分析</span>
        </router-link>
        <router-link to="/efficiency" class="nav-link" exact-active-class="active">
          <span class="nav-icon">⚡</span>
          <span>效能告警</span>
        </router-link>
      </nav>
    </header>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.nav {
  display: flex;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.15);
}

.nav-link.active {
  color: #667eea;
  background: #f5f7fa;
  font-weight: 600;
}

.nav-icon {
  font-size: 18px;
}

.main-content {
  flex: 1;
  padding: 24px;
}
</style>
