<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="text-center">
      <div class="text-9xl font-bold text-gray-200">404</div>
      <h1 class="text-2xl font-semibold text-gray-900 mt-4">页面未找到</h1>
      <p class="text-gray-500 mt-2 max-w-md">
        抱歉，您访问的页面不存在或已被移除。请检查URL是否正确，或返回首页。
      </p>
      
      <div class="mt-8 flex justify-center space-x-4">
        <router-link to="/dashboard" class="btn-primary">
          <span class="i-carbon-home mr-2"></span>
          返回首页
        </router-link>
        <button @click="handleGoBack" class="btn-secondary">
          <span class="i-carbon-arrow-left mr-2"></span>
          返回上一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleGoBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/dashboard')
  }
}
</script>
