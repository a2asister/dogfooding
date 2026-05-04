<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="logo">银行核心系统</h1>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" exact-active-class="active">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">首页</span>
        </router-link>
        <router-link to="/customer" class="nav-item" active-class="active">
          <span class="nav-icon">👥</span>
          <span class="nav-text">客户管理</span>
        </router-link>
        <router-link to="/account" class="nav-item" active-class="active">
          <span class="nav-icon">💳</span>
          <span class="nav-text">账户管理</span>
        </router-link>
        <router-link to="/transaction" class="nav-item" active-class="active">
          <span class="nav-icon">📊</span>
          <span class="nav-text">交易管理</span>
        </router-link>
        <router-link to="/wealth" class="nav-item" active-class="active">
          <span class="nav-icon">💰</span>
          <span class="nav-text">理财管理</span>
        </router-link>
        <router-link to="/loan" class="nav-item" active-class="active">
          <span class="nav-icon">🏦</span>
          <span class="nav-text">贷款管理</span>
        </router-link>
        <router-link to="/credit-card" class="nav-item" active-class="active">
          <span class="nav-icon">💎</span>
          <span class="nav-text">信用卡管理</span>
        </router-link>
        <router-link to="/risk" class="nav-item" active-class="active">
          <span class="nav-icon">🛡️</span>
          <span class="nav-text">风控管理</span>
        </router-link>
        <router-link to="/report" class="nav-item" active-class="active">
          <span class="nav-icon">📈</span>
          <span class="nav-text">报表管理</span>
        </router-link>
      </nav>
    </aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <span class="breadcrumb">{{ currentRouteName }}</span>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="user-avatar">管理员</span>
            <span class="user-name">admin</span>
          </div>
        </div>
      </header>
      <div class="content-area">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const currentRouteName = computed(() => {
  const names = {
    '/': '首页',
    '/customer': '客户管理',
    '/account': '账户管理',
    '/transaction': '交易管理',
    '/wealth': '理财管理',
    '/loan': '贷款管理',
    '/credit-card': '信用卡管理',
    '/risk': '风控管理',
    '/report': '报表管理'
  }
  for (const [path, name] of Object.entries(names)) {
    if (route.path.startsWith(path)) {
      return name
    }
  }
  return '首页'
})
</script>

<style scoped>
.app-layout {
  display: flex;
  width: 100%;
  height: 100vh;
}

.sidebar {
  width: var(--sidebar-width);
  background-color: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.sidebar-nav {
  padding: 16px 0;
  flex: 1;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: var(--sidebar-text);
  text-decoration: none;
  transition: all var(--transition);
  cursor: pointer;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.nav-item.active {
  background-color: var(--sidebar-active);
  color: #fff;
}

.nav-icon {
  font-size: 18px;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-size: 14px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header {
  height: var(--header-height);
  background-color: var(--bg-color-white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-color-light);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.breadcrumb {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
}

.user-name {
  font-size: 14px;
  color: var(--text-primary);
}

.content-area {
  flex: 1;
  padding: 24px;
  background-color: var(--bg-color);
  overflow-y: auto;
}
</style>
