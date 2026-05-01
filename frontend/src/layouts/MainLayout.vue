<template>
  <div class="flex h-screen bg-gray-100">
    <aside class="w-64 bg-white shadow-lg flex flex-col">
      <div class="p-6 border-b">
        <h1 class="text-xl font-bold text-blue-600">RMS 管理系统</h1>
        <p class="text-sm text-gray-500">研发资产管理平台</p>
      </div>
      
      <nav class="flex-1 p-4 overflow-y-auto">
        <ul class="space-y-1">
          <li>
            <router-link
              to="/dashboard"
              class="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              :class="{ 'bg-blue-50 text-blue-600': isActive('/dashboard') }"
            >
              <span class="i-carbon-dashboard mr-3 text-xl"></span>
              仪表盘
            </router-link>
          </li>
          
          <li class="pt-4">
            <p class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">资产管理</p>
          </li>
          
          <li v-if="hasPermission('code_repos:view')">
            <router-link
              to="/code-repos"
              class="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              :class="{ 'bg-blue-50 text-blue-600': isActive('/code-repos') }"
            >
              <span class="i-carbon-code mr-3 text-xl"></span>
              代码仓库
            </router-link>
          </li>
          
          <li v-if="hasPermission('api_docs:view')">
            <router-link
              to="/api-docs"
              class="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              :class="{ 'bg-blue-50 text-blue-600': isActive('/api-docs') }"
            >
              <span class="i-carbon-documentation mr-3 text-xl"></span>
              接口文档
            </router-link>
          </li>
          
          <li v-if="hasPermission('design_resources:view')">
            <router-link
              to="/design-resources"
              class="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              :class="{ 'bg-blue-50 text-blue-600': isActive('/design-resources') }"
            >
              <span class="i-carbon-image-mountain mr-3 text-xl"></span>
              设计资源
            </router-link>
          </li>
          
          <li v-if="hasPermission('test_cases:view')">
            <router-link
              to="/test-cases"
              class="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              :class="{ 'bg-blue-50 text-blue-600': isActive('/test-cases') }"
            >
              <span class="i-carbon-checklist mr-3 text-xl"></span>
              测试用例
            </router-link>
          </li>
          
          <li v-if="hasPermission('deployments:view')">
            <router-link
              to="/deployments"
              class="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              :class="{ 'bg-blue-50 text-blue-600': isActive('/deployments') }"
            >
              <span class="i-carbon-deployment-inventory mr-3 text-xl"></span>
              部署记录
            </router-link>
          </li>
          
          <li class="pt-4">
            <p class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">集成服务</p>
          </li>
          
          <li v-if="hasPermission('git_integrations:view')">
            <router-link
              to="/git-integrations"
              class="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              :class="{ 'bg-blue-50 text-blue-600': isActive('/git-integrations') }"
            >
              <span class="i-carbon-git-merge mr-3 text-xl"></span>
              Git集成
            </router-link>
          </li>
          
          <li v-if="hasPermission('cicd_pipelines:view')">
            <router-link
              to="/cicd-pipelines"
              class="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              :class="{ 'bg-blue-50 text-blue-600': isActive('/cicd-pipelines') }"
            >
              <span class="i-carbon-flow mr-3 text-xl"></span>
              CI/CD流水线
            </router-link>
          </li>
          
          <li v-if="hasPermission('cloud_services:view')">
            <router-link
              to="/cloud-services"
              class="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              :class="{ 'bg-blue-50 text-blue-600': isActive('/cloud-services') }"
            >
              <span class="i-carbon-cloud-app mr-3 text-xl"></span>
              云服务
            </router-link>
          </li>
          
          <li class="pt-4">
            <p class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">系统管理</p>
          </li>
          
          <li v-if="hasPermission('asset_ledger:view')">
            <router-link
              to="/asset-ledger"
              class="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              :class="{ 'bg-blue-50 text-blue-600': isActive('/asset-ledger') }"
            >
              <span class="i-carbon-ledger mr-3 text-xl"></span>
              资产台账
            </router-link>
          </li>
          
          <li v-if="hasPermission('users:view')">
            <router-link
              to="/users"
              class="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              :class="{ 'bg-blue-50 text-blue-600': isActive('/users') }"
            >
              <span class="i-carbon-user-multiple mr-3 text-xl"></span>
              用户管理
            </router-link>
          </li>
          
          <li v-if="hasPermission('permissions:view')">
            <router-link
              to="/permissions"
              class="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              :class="{ 'bg-blue-50 text-blue-600': isActive('/permissions') }"
            >
              <span class="i-carbon-shield mr-3 text-xl"></span>
              权限管理
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>
    
    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="bg-white shadow-sm h-16 flex items-center justify-between px-6">
        <div class="flex items-center">
          <h2 class="text-lg font-semibold text-gray-800">{{ currentPageTitle }}</h2>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <span class="i-carbon-user text-blue-600"></span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700">{{ userStore.user?.name || '用户' }}</p>
              <p class="text-xs text-gray-500">{{ getRoleLabel(userStore.user?.role) }}</p>
            </div>
          </div>
          
          <button
            @click="handleLogout"
            class="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <span class="i-carbon-logout mr-1"></span>
            退出
          </button>
        </div>
      </header>
      
      <main class="flex-1 overflow-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const currentPageTitle = computed(() => {
  return route.meta.title || '页面'
})

const isActive = (path) => {
  return route.path === path
}

const hasPermission = (permission) => {
  return userStore.hasPermission(permission)
}

const getRoleLabel = (role) => {
  const roleLabels = {
    admin: '系统管理员',
    manager: '项目负责人',
    developer: '开发人员',
    tester: '测试人员',
    viewer: '只读用户'
  }
  return roleLabels[role] || role
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>
