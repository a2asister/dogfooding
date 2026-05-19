<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">🎮</div>
        <h2>管理后台</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <span class="user-name">{{ adminStore.adminInfo?.username }}</span>
          <span class="user-role">{{ adminStore.adminInfo?.role }}</span>
        </div>
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-header">
        <h1>{{ currentPageTitle }}</h1>
        <router-link to="/" target="_blank" class="view-site-btn">查看网站</router-link>
      </header>
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAdminStore } from '../../store/useAdminStore'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const menuItems = [
  { path: '/admin/dashboard', label: '数据概览', icon: '📊' },
  { path: '/admin/statistics', label: '数据统计', icon: '📈' },
  { path: '/admin/news', label: '资讯管理', icon: '📰' },
  { path: '/admin/events', label: '活动管理', icon: '🎪' },
  { path: '/admin/home', label: '首页配置', icon: '🏠' },
  { path: '/admin/tickets', label: '工单管理', icon: '📩' },
  { path: '/admin/reservations', label: '预约管理', icon: '📝' },
  { path: '/admin/compliance', label: '合规管理', icon: '📜' },
  { path: '/admin/logs', label: '日志管理', icon: '📋' },
  { path: '/admin/settings', label: '系统设置', icon: '⚙️' }
]

const currentPageTitle = computed(() => {
  const current = menuItems.find(item => item.path === route.path)
  return current?.label || '管理后台'
})

const handleLogout = (): void => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    adminStore.logout()
    ElMessage.success('已退出登录')
    router.push('/admin/login')
  }).catch(() => {})
}

onMounted(() => {
  adminStore.initFromStorage()
  if (!adminStore.isLoggedIn) {
    router.push('/admin/login')
  }
})
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;

  .sidebar-header {
    padding: 24px 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 12px;

    .logo {
      font-size: 32px;
    }

    h2 {
      font-size: 18px;
      color: var(--text-primary);
      margin: 0;
    }
  }

  .sidebar-nav {
    flex: 1;
    padding: 16px 12px;
    overflow-y: auto;

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      color: var(--text-secondary);
      transition: all 0.3s ease;
      margin-bottom: 4px;

      .nav-icon {
        font-size: 20px;
      }

      .nav-label {
        font-size: 14px;
      }

      &:hover {
        background: var(--bg-dark);
        color: var(--text-primary);
      }

      &.router-link-active {
        background: linear-gradient(135deg, var(--secondary-color), var(--accent-purple));
        color: white;
      }
    }
  }

  .sidebar-footer {
    padding: 20px;
    border-top: 1px solid var(--border-color);

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 16px;

      .user-name {
        color: var(--text-primary);
        font-size: 14px;
        font-weight: 500;
      }

      .user-role {
        color: var(--text-secondary);
        font-size: 12px;
      }
    }

    .logout-btn {
      width: 100%;
      padding: 10px;
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #ef4444;
        color: #ef4444;
      }
    }
  }
}

.main-content {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;

  .top-header {
    padding: 20px 32px;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h1 {
      font-size: 24px;
      color: var(--text-primary);
      margin: 0;
    }

    .view-site-btn {
      padding: 8px 20px;
      background: transparent;
      border: 1px solid var(--secondary-color);
      color: var(--secondary-color);
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s ease;

      &:hover {
        background: var(--secondary-color);
        color: var(--bg-dark);
      }
    }
  }

  .content-wrapper {
    flex: 1;
    padding: 32px;
    overflow-y: auto;
  }
}
</style>
