<template>
  <div class="page-container">
    <h1 class="page-title">个人信息</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="card lg:col-span-1">
        <div class="text-center">
          <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="i-carbon-user text-blue-600 text-4xl"></span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900">{{ user?.name || '用户' }}</h3>
          <p class="text-gray-500">{{ user?.username || '-' }}</p>
          <span :class="['status-badge mt-3', getRoleClass(user?.role)]">
            {{ getRoleLabel(user?.role) }}
          </span>
        </div>
        
        <div class="mt-6 pt-6 border-t">
          <h4 class="font-medium text-gray-900 mb-3">联系信息</h4>
          <div class="space-y-2 text-sm">
            <div class="flex items-center text-gray-600">
              <span class="i-carbon-email mr-2"></span>
              {{ user?.email || '-' }}
            </div>
            <div class="flex items-center text-gray-600">
              <span class="i-carbon-phone mr-2"></span>
              {{ user?.phone || '-' }}
            </div>
          </div>
        </div>
        
        <div class="mt-6 pt-6 border-t">
          <h4 class="font-medium text-gray-900 mb-3">账号信息</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">创建时间</span>
              <span class="text-gray-900">{{ user?.createdAt || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">最后登录</span>
              <span class="text-gray-900">{{ user?.lastLoginAt || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">状态</span>
              <span :class="['status-badge', getStatusClass(user?.status)]">
                {{ getStatusLabel(user?.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card lg:col-span-2">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">编辑资料</h3>
        
        <form @submit.prevent="handleSave">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="label">姓名</label>
              <input
                v-model="form.name"
                type="text"
                class="input"
                placeholder="请输入姓名"
              />
            </div>
            
            <div>
              <label class="label">用户名</label>
              <input
                v-model="form.username"
                type="text"
                class="input"
                placeholder="请输入用户名"
                disabled
              />
            </div>
            
            <div>
              <label class="label">邮箱</label>
              <input
                v-model="form.email"
                type="email"
                class="input"
                placeholder="请输入邮箱"
              />
            </div>
            
            <div>
              <label class="label">电话</label>
              <input
                v-model="form.phone"
                type="text"
                class="input"
                placeholder="请输入电话"
              />
            </div>
          </div>
          
          <div class="mt-6 pt-6 border-t">
            <h4 class="font-medium text-gray-900 mb-4">修改密码</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="label">当前密码</label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="input"
                  placeholder="请输入当前密码"
                />
              </div>
              <div>
                <label class="label">新密码</label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="input"
                  placeholder="请输入新密码"
                />
              </div>
              <div class="md:col-span-2">
                <label class="label">确认新密码</label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="input"
                  placeholder="请再次输入新密码"
                />
              </div>
            </div>
          </div>
          
          <div class="flex justify-end mt-6 pt-6 border-t space-x-3">
            <button type="button" class="btn-secondary">
              取消
            </button>
            <button type="submit" class="btn-primary">
              保存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const user = computed(() => userStore.user)

const form = reactive({
  name: '',
  username: '',
  email: '',
  phone: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleSave = () => {
  console.log('保存用户信息:', form)
  console.log('修改密码:', passwordForm)
}

const getRoleClass = (role) => {
  const classes = {
    admin: 'status-danger',
    manager: 'status-warning',
    developer: 'status-info',
    tester: 'status-success',
    viewer: 'status-secondary'
  }
  return classes[role] || 'status-secondary'
}

const getRoleLabel = (role) => {
  const labels = {
    admin: '系统管理员',
    manager: '项目负责人',
    developer: '开发人员',
    tester: '测试人员',
    viewer: '只读用户'
  }
  return labels[role] || role
}

const getStatusClass = (status) => {
  const classes = {
    active: 'status-success',
    inactive: 'status-secondary'
  }
  return classes[status] || 'status-secondary'
}

const getStatusLabel = (status) => {
  const labels = {
    active: '活跃',
    inactive: '禁用'
  }
  return labels[status] || status
}

onMounted(() => {
  if (user.value) {
    form.name = user.value.name || ''
    form.username = user.value.username || ''
    form.email = user.value.email || ''
    form.phone = user.value.phone || ''
  }
})
</script>
