<template>
  <div class="main-layout">
    <aside class="layout-sidebar">
      <div class="sidebar-header">
        <h1>
          <el-icon><Cloudy /></el-icon>
          CloudSync
        </h1>
      </div>
      <nav class="sidebar-menu">
        <div
          v-for="item in menuItems"
          :key="item.path"
          :class="['menu-item', { active: isActive(item.path) }]"
          @click="navigateTo(item.path)"
        >
          <el-icon class="icon"><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ userStore.user?.username?.charAt(0).toUpperCase() }}</div>
          <div class="user-details">
            <div class="username">{{ userStore.user?.username }}</div>
            <div class="email">{{ userStore.user?.email }}</div>
          </div>
        </div>
      </div>
    </aside>
    <main class="layout-main">
      <header class="header">
        <div class="header-left">
          <span class="header-title">{{ currentPageTitle }}</span>
        </div>
        <div class="header-right">
          <div class="sync-status" :class="{ syncing: syncing }">
            <el-icon v-if="syncing"><Loading /></el-icon>
            <el-icon v-else><CircleCheck /></el-icon>
            <span>{{ syncing ? '同步中...' : '已同步' }}</span>
          </div>
          <el-dropdown @command="handleCommand">
            <el-button type="text" style="padding: 8px;">
              <el-icon :size="22"><Setting /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <el-dropdown-item divided command="logout" style="color: #dc2626;">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  Cloudy,
  HomeFilled,
  FolderOpened,
  Share,
  Refresh,
  Setting,
  CircleCheck,
  Loading,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const syncing = ref(false)

const menuItems = [
  { path: '/', label: '仪表盘', icon: HomeFilled },
  { path: '/files', label: '文件管理', icon: FolderOpened },
  { path: '/share', label: '文件分享', icon: Share },
  { path: '/sync', label: '同步状态', icon: Refresh },
  { path: '/settings', label: '设置', icon: Setting },
]

const currentPageTitle = computed(() => {
  const item = menuItems.find((i) => isActive(i.path))
  return item?.label || '仪表盘'
})

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const navigateTo = (path: string) => {
  router.push(path)
}

const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        await userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/login')
      })
      .catch(() => {})
  } else if (command === 'settings') {
    router.push('/settings')
  }
}

onMounted(() => {})
</script>
