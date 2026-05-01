<template>
  <div class="page-container">
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title mb-0">用户管理</h1>
      <button class="btn-primary" @click="handleAdd">
        <span class="i-carbon-add mr-2"></span>
        新建用户
      </button>
    </div>
    
    <div class="card">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3 px-4 font-medium text-gray-600">用户</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">邮箱</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">角色</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">状态</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">最后登录</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-b hover:bg-gray-50">
              <td class="py-3 px-4">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span class="i-carbon-user text-blue-600"></span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ user.name }}</p>
                    <p class="text-sm text-gray-500">{{ user.username }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ user.email }}</td>
              <td class="py-3 px-4">
                <span :class="['status-badge', getRoleClass(user.role)]">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span :class="['status-badge', getStatusClass(user.status)]">
                  {{ getStatusLabel(user.status) }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ user.lastLoginAt || '-' }}</td>
              <td class="py-3 px-4">
                <div class="flex space-x-2">
                  <button class="text-blue-600 hover:text-blue-800 text-sm" @click="handleEdit(user)">
                    编辑
                  </button>
                  <button 
                    class="text-red-600 hover:text-red-800 text-sm" 
                    @click="handleDelete(user)"
                    v-if="user.username !== 'admin'"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="6" class="py-8 text-center text-gray-500">
                暂无数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usersApi } from '@/api'

const users = ref([])

const fetchData = async () => {
  try {
    const response = await usersApi.getAll()
    users.value = response.data || []
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const handleAdd = () => {
  console.log('添加用户')
}

const handleEdit = (user) => {
  console.log('编辑用户:', user)
}

const handleDelete = (user) => {
  if (confirm(`确定要删除用户 "${user.name}" 吗？`)) {
    console.log('删除用户:', user)
  }
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
  fetchData()
})
</script>
