<template>
  <div class="page-container">
    <h1 class="page-title">权限管理</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">角色管理</h3>
        
        <div class="space-y-3">
          <div v-for="role in roles" :key="role.name" class="p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium text-gray-900">{{ role.label }}</h4>
                <p class="text-sm text-gray-500 mt-1">{{ role.description }}</p>
                <p class="text-xs text-gray-400 mt-2">
                  包含 {{ role.permissions?.length || 0 }} 个权限
                </p>
              </div>
              <button class="text-blue-600 hover:text-blue-800 text-sm">
                编辑权限
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">权限模块</h3>
        
        <div class="space-y-3">
          <div v-for="module in modules" :key="module.name" class="p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium text-gray-900">{{ module.label }}</h4>
                <p class="text-sm text-gray-500 mt-1">
                  包含 {{ module.permissions?.length || 0 }} 个权限项
                </p>
              </div>
              <button class="text-blue-600 hover:text-blue-800 text-sm">
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card mt-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">权限说明</h3>
      
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start">
          <span class="i-carbon-information text-blue-600 text-xl mr-3 mt-0.5"></span>
          <div>
            <h4 class="font-medium text-blue-900">权限分级说明</h4>
            <ul class="mt-2 text-sm text-blue-800 space-y-1">
              <li>• <strong>view</strong>: 查看权限 - 可以查看数据</li>
              <li>• <strong>create</strong>: 创建权限 - 可以新增数据</li>
              <li>• <strong>edit</strong>: 编辑权限 - 可以修改数据</li>
              <li>• <strong>delete</strong>: 删除权限 - 可以删除数据</li>
              <li>• <strong>admin</strong>: 管理权限 - 可以分配权限和管理用户</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { permissionsApi } from '@/api'

const roles = ref([])
const modules = ref([])

const fetchData = async () => {
  try {
    const response = await permissionsApi.getAll()
    const data = response.data || {}
    roles.value = data.roles || []
    modules.value = data.modules || []
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>
