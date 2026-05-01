<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="i-carbon-code text-white text-3xl"></span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">RMS 管理系统</h1>
          <p class="text-gray-500 mt-2">分布式研发资产管理平台</p>
        </div>
        
        <form @submit.prevent="handleLogin">
          <div class="space-y-4">
            <div>
              <label class="label">用户名</label>
              <input
                v-model="form.username"
                type="text"
                class="input"
                placeholder="请输入用户名"
                required
              />
            </div>
            
            <div>
              <label class="label">密码</label>
              <input
                v-model="form.password"
                type="password"
                class="input"
                placeholder="请输入密码"
                required
              />
            </div>
            
            <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-600">{{ errorMessage }}</p>
            </div>
            
            <button
              type="submit"
              class="w-full btn-primary"
              :disabled="loading"
            >
              <span v-if="loading" class="inline-block animate-spin mr-2">
                <span class="i-carbon-loading"></span>
              </span>
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </div>
        </form>
        
        <div class="mt-6 pt-6 border-t">
          <p class="text-sm text-gray-500 text-center mb-4">测试账号</p>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="p-2 bg-gray-50 rounded">
              <p class="font-medium text-gray-700">管理员</p>
              <p class="text-gray-500">admin / admin123</p>
            </div>
            <div class="p-2 bg-gray-50 rounded">
              <p class="font-medium text-gray-700">开发人员</p>
              <p class="text-gray-500">developer / admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''
  
  try {
    const response = await authApi.login(form.value)
    
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token)
      
      await userStore.fetchCurrentUser()
      
      const redirect = route.query.redirect || '/dashboard'
      router.push(redirect)
    } else {
      errorMessage.value = '登录失败，请检查用户名和密码'
    }
  } catch (error) {
    errorMessage.value = error.message || '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>
