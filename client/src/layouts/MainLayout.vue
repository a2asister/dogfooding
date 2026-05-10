<template>
  <el-container class="h-full">
    <el-aside width="220px" class="bg-white border-r">
      <div class="p-4 border-b">
        <h1 class="text-xl font-bold text-blue-600">智能表单引擎</h1>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="border-0"
        router
      >
        <el-menu-item index="/">
          <el-icon><Odometer /></el-icon>
          <span>仪表板</span>
        </el-menu-item>
        <el-menu-item index="/forms">
          <el-icon><Document /></el-icon>
          <span>表单管理</span>
        </el-menu-item>
        <el-menu-item index="/submissions">
          <el-icon><DataAnalysis /></el-icon>
          <span>提交记录</span>
        </el-menu-item>
        <el-menu-item index="/pending">
          <el-icon><Bell /></el-icon>
          <span>待审批</span>
          <el-badge :value="pendingCount" class="ml-2" v-if="pendingCount > 0" />
        </el-menu-item>
        <el-menu-item index="/templates">
          <el-icon><Collection /></el-icon>
          <span>表单模板</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="bg-white border-b flex justify-between items-center px-6">
        <div>
          <h2 class="text-lg font-medium">{{ pageTitle }}</h2>
        </div>
        <div class="flex items-center gap-4">
          <el-dropdown @command="handleCommand">
            <span class="flex items-center cursor-pointer">
              <el-avatar :size="32" class="mr-2">
                {{ authStore.user?.name?.charAt(0) || authStore.user?.username?.charAt(0) || 'U' }}
              </el-avatar>
              <span>{{ authStore.user?.name || authStore.user?.username }}</span>
              <el-icon class="ml-2"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="bg-gray-50 overflow-auto">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Odometer, Document, DataAnalysis, Bell, Collection, ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const pendingCount = ref(0)

const pageTitle = computed(() => {
  const titles = {
    '/': '仪表板',
    '/forms': '表单管理',
    '/forms/new': '新建表单',
    '/forms/edit': '编辑表单',
    '/forms/preview': '表单预览',
    '/submissions': '提交记录',
    '/pending': '待审批',
    '/templates': '表单模板'
  }
  return titles[route.path] || '智能表单引擎'
})

const activeMenu = computed(() => {
  if (route.path.startsWith('/forms')) return '/forms'
  if (route.path.startsWith('/submissions')) return '/submissions'
  if (route.path.startsWith('/pending')) return '/pending'
  if (route.path.startsWith('/templates')) return '/templates'
  return route.path
})

const handleCommand = (command) => {
  if (command === 'logout') {
    authStore.logout()
    router.push('/login')
  }
}

onMounted(async () => {
  if (!authStore.user && localStorage.getItem('token')) {
    await authStore.refreshTokenAction()
  }
})
</script>

<style scoped>
.h-full {
  height: 100%;
}

:deep(.el-aside) {
  background-color: white !important;
}
</style>
