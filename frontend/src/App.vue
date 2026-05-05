<template>
  <el-container class="app-container">
    <el-aside width="220px" class="app-aside">
      <div class="logo">
        <el-icon size="32" color="#409EFF"><Monitor /></el-icon>
        <span class="logo-text">日志审计系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><DataAnalysis /></el-icon>
          <span>监控看板</span>
        </el-menu-item>
        <el-menu-item index="/logs">
          <el-icon><Document /></el-icon>
          <span>日志查询</span>
        </el-menu-item>
        <el-menu-item index="/traces">
          <el-icon><Share /></el-icon>
          <span>链路追踪</span>
        </el-menu-item>
        <el-menu-item index="/replay">
          <el-icon><VideoPlay /></el-icon>
          <span>日志回放</span>
        </el-menu-item>
        <el-menu-item index="/alerts">
          <el-icon><Warning /></el-icon>
          <span>告警中心</span>
        </el-menu-item>
        <el-menu-item index="/alert-rules">
          <el-icon><Setting /></el-icon>
          <span>告警规则</span>
        </el-menu-item>
        <el-menu-item index="/services">
          <el-icon><OfficeBuilding /></el-icon>
          <span>服务管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="app-header">
        <div class="header-left">
          <h2>{{ currentPageTitle }}</h2>
        </div>
        <div class="header-right">
          <el-button type="primary" size="small" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-divider direction="vertical" />
          <el-avatar icon="UserFilled" :size="32" />
        </div>
      </el-header>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeMenu = computed(() => route.path)

const currentPageTitle = computed(() => {
  const titles = {
    '/': '监控看板',
    '/logs': '日志查询',
    '/traces': '链路追踪',
    '/replay': '日志回放',
    '/alerts': '告警中心',
    '/alert-rules': '告警规则',
    '/services': '服务管理'
  }
  return titles[route.path] || '日志审计系统'
})

const refreshData = () => {
  window.location.reload()
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
}

.app-container {
  height: 100%;
}

.app-aside {
  background-color: #304156;
  color: #fff;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #3a4a5c;
}

.logo-text {
  margin-left: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.app-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left h2 {
  color: #303133;
  font-size: 18px;
}

.header-right {
  display: flex;
  align-items: center;
}

.app-main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

.el-menu {
  border-right: none;
}

.card-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-card-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-card-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card-danger {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
}

.stat-card .stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #fff;
  margin: 10px 0;
}

.stat-card .stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.table-container {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}

.search-form {
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
