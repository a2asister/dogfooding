<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-xl font-bold text-blue-600 flex items-center gap-2">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              异步协作中台
            </router-link>
          </div>
          <div class="flex items-center gap-4">
            <router-link v-for="item in navItems" :key="item.path" :to="item.path"
              class="text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-blue-600 bg-blue-50': $route.path === item.path }">
              {{ item.label }}
            </router-link>
          </div>
        </div>
      </div>
    </nav>
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
    
    <footer class="bg-white border-t mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p class="text-center text-gray-500 text-sm">
          跨团队异步协作中台 - 替代低效会议，提升协作效率
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
const navItems = [
  { path: '/', label: '首页' },
  { path: '/topics', label: '议题管理' },
  { path: '/tasks', label: '任务管理' },
  { path: '/organizations', label: '组织架构' },
  { path: '/whitelist', label: '协作白名单' }
]
</script>
