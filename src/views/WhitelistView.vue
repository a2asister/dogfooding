<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">跨企业协作白名单</h1>
        <p class="text-gray-500 mt-1">管理外部企业协作权限，安全可控</p>
      </div>
      <button @click="showCreateModal = true" class="btn-primary flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        添加白名单
      </button>
    </div>

    <div class="card">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3 px-4 font-medium text-gray-700">外部企业</th>
              <th class="text-left py-3 px-4 font-medium text-gray-700">协作权限</th>
              <th class="text-left py-3 px-4 font-medium text-gray-700">状态</th>
              <th class="text-left py-3 px-4 font-medium text-gray-700">创建时间</th>
              <th class="text-right py-3 px-4 font-medium text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in whitelist" :key="item.id" class="border-b hover:bg-gray-50">
              <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ item.externalOrgName }}</p>
                    <p class="text-sm text-gray-500">ID: {{ item.externalOrgId }}</p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-4">
                <div class="flex flex-wrap gap-1">
                  <span v-for="perm in item.permissions" :key="perm" 
                    class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                    {{ formatPermission(perm) }}
                  </span>
                </div>
              </td>
              <td class="py-4 px-4">
                <span class="px-3 py-1 text-sm rounded-full"
                  :class="item.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  {{ item.active ? '正常' : '已撤销' }}
                </span>
              </td>
              <td class="py-4 px-4 text-sm text-gray-500">
                {{ formatDate(item.createdAt) }}
              </td>
              <td class="py-4 px-4 text-right">
                <div class="flex justify-end gap-2">
                  <button v-if="item.active" @click="revokeItem(item.id, item.externalOrgName)" 
                    class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    撤销
                  </button>
                  <button @click="verifyItem(item)" 
                    class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    验证
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="whitelist.length === 0">
              <td colspan="5" class="py-8 text-center text-gray-500">
                暂无白名单条目
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="card w-full max-w-lg mx-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">添加白名单</h2>
          <button @click="showCreateModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="createWhitelist">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">外部企业ID</label>
              <input v-model="whitelistForm.externalOrgId" type="text" required class="input" placeholder="请输入外部企业ID">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">外部企业名称</label>
              <input v-model="whitelistForm.externalOrgName" type="text" required class="input" placeholder="请输入外部企业名称">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">协作权限</label>
              <div class="space-y-2">
                <label v-for="perm in availablePermissions" :key="perm.value" class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="whitelistForm.permissions" :value="perm.value" 
                    class="w-4 h-4 text-blue-600 rounded">
                  <span class="text-sm text-gray-700">{{ perm.label }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="showCreateModal = false" class="btn-secondary">取消</button>
            <button type="submit" class="btn-primary">添加</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showVerifyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showVerifyModal = false">
      <div class="card w-full max-w-md mx-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">权限验证结果</h2>
          <button @click="showVerifyModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="verifyResult" class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full flex items-center justify-center"
              :class="verifyResult.isValid ? 'bg-green-100' : 'bg-red-100'">
              <svg v-if="verifyResult.isValid" class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">
                {{ verifyResult.isValid ? '权限有效' : '权限无效' }}
              </p>
              <p class="text-sm text-gray-500">白名单 ID: {{ verifyResult.id }}</p>
            </div>
          </div>

          <div v-if="verifyResult.isValid" class="p-4 bg-blue-50 rounded-lg">
            <p class="text-sm font-medium text-blue-900 mb-2">有效权限：</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="perm in verifyResult.permissions" :key="perm"
                class="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                {{ formatPermission(perm) }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button @click="showVerifyModal = false" class="btn-primary">确定</button>
        </div>
      </div>
    </div>

    <div v-if="showRevokeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showRevokeModal = false">
      <div class="card w-full max-w-md mx-4">
        <div class="text-center">
          <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">确认撤销</h3>
          <p class="text-gray-500 mb-6">确定要撤销 "{{ revokeTargetName }}" 的协作权限吗？</p>
          <div class="flex justify-center gap-3">
            <button type="button" @click="showRevokeModal = false" class="btn-secondary">取消</button>
            <button type="button" @click="confirmRevoke" class="btn bg-orange-500 text-white hover:bg-orange-600">确认撤销</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '../stores'
import { storeToRefs } from 'pinia'

const store = useAppStore()
const { whitelist, currentUser } = storeToRefs(store)

const showCreateModal = ref(false)
const showVerifyModal = ref(false)
const showRevokeModal = ref(false)
const verifyResult = ref(null)
const revokeTargetId = ref(null)
const revokeTargetName = ref('')

const availablePermissions = [
  { label: '查看议题', value: 'view_topics' },
  { label: '评论讨论', value: 'comment' },
  { label: '创建任务', value: 'create_tasks' },
  { label: '查看任务', value: 'view_tasks' }
]

const whitelistForm = ref({
  externalOrgId: '',
  externalOrgName: '',
  permissions: ['view_topics', 'comment']
})

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

function formatPermission(perm) {
  const mapping = {
    'view_topics': '查看议题',
    'comment': '评论讨论',
    'create_tasks': '创建任务',
    'view_tasks': '查看任务'
  }
  return mapping[perm] || perm
}

async function createWhitelist() {
  try {
    await fetch('/api/whitelist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...whitelistForm.value,
        organizationId: currentUser.value.organizationId
      })
    })
    showCreateModal.value = false
    whitelistForm.value = {
      externalOrgId: '',
      externalOrgName: '',
      permissions: ['view_topics', 'comment']
    }
    store.fetchWhitelist()
  } catch (error) {
    console.error('创建白名单失败:', error)
  }
}

function revokeItem(id, name) {
  revokeTargetId.value = id
  revokeTargetName.value = name
  showRevokeModal.value = true
}

async function confirmRevoke() {
  try {
    await fetch(`/api/whitelist/${revokeTargetId.value}/revoke`, { method: 'POST' })
    showRevokeModal.value = false
    store.fetchWhitelist()
  } catch (error) {
    console.error('撤销白名单失败:', error)
  }
}

async function verifyItem(item) {
  try {
    const response = await fetch(`/api/whitelist/${item.id}/verify`, { method: 'POST' })
    verifyResult.value = await response.json()
    showVerifyModal.value = true
  } catch (error) {
    console.error('验证白名单失败:', error)
  }
}

onMounted(() => {
  store.fetchWhitelist()
})
</script>
