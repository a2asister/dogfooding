<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">组织架构</h1>
      <button @click="showCreateModal = true" class="btn-primary flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        创建组织
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="org in organizations" :key="org.id" class="card hover:shadow-lg transition-shadow">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ org.name }}</h3>
              <p class="text-sm text-gray-500">{{ org.members?.length || 0 }} 位成员</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="editOrganization(org)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click="deleteOrganization(org.id, org.name)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="org.members?.length > 0" class="mt-4 pt-4 border-t">
          <p class="text-sm font-medium text-gray-700 mb-2">成员列表</p>
          <div class="flex flex-wrap gap-2">
            <div v-for="member in org.members" :key="member.userId" 
              class="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm">
              <span class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                {{ member.userId?.charAt(0) || 'U' }}
              </span>
              <span class="text-gray-700">{{ member.userId }}</span>
              <span class="text-gray-400">({{ member.role }})</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="organizations.length === 0" class="col-span-full card text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <p class="text-gray-500">暂无组织架构</p>
        <button @click="showCreateModal = true" class="btn-primary mt-4">创建第一个组织</button>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="card w-full max-w-lg mx-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">{{ editingOrg ? '编辑组织' : '创建组织' }}</h2>
          <button @click="showCreateModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="submitOrganization">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">组织名称</label>
              <input v-model="orgForm.name" type="text" required class="input" placeholder="请输入组织名称">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">父级组织（可选）</label>
              <select v-model="orgForm.parentId" class="input">
                <option value="">无父级组织</option>
                <option v-for="org in organizations.filter(o => o.id !== editingOrg?.id)" :key="org.id" :value="org.id">
                  {{ org.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="showCreateModal = false" class="btn-secondary">取消</button>
            <button type="submit" class="btn-primary">{{ editingOrg ? '保存' : '创建' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showDeleteModal = false">
      <div class="card w-full max-w-md mx-4">
        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">确认删除</h3>
          <p class="text-gray-500 mb-6">确定要删除组织 "{{ deleteTargetName }}" 吗？此操作不可撤销。</p>
          <div class="flex justify-center gap-3">
            <button type="button" @click="showDeleteModal = false" class="btn-secondary">取消</button>
            <button type="button" @click="confirmDelete" class="btn bg-red-500 text-white hover:bg-red-600">确认删除</button>
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
const { organizations } = storeToRefs(store)

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingOrg = ref(null)
const deleteTargetId = ref(null)
const deleteTargetName = ref('')
const orgForm = ref({
  name: '',
  parentId: ''
})

function editOrganization(org) {
  editingOrg.value = org
  orgForm.value = {
    name: org.name,
    parentId: org.parentId || ''
  }
  showCreateModal.value = true
}

async function submitOrganization() {
  try {
    if (editingOrg.value) {
      await fetch(`/api/organizations/${editingOrg.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgForm.value)
      })
    } else {
      await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgForm.value)
      })
    }
    showCreateModal.value = false
    resetForm()
    store.fetchOrganizations()
  } catch (error) {
    console.error('提交组织失败:', error)
  }
}

function deleteOrganization(id, name) {
  deleteTargetId.value = id
  deleteTargetName.value = name
  showDeleteModal.value = true
}

async function confirmDelete() {
  try {
    await fetch(`/api/organizations/${deleteTargetId.value}`, { method: 'DELETE' })
    showDeleteModal.value = false
    store.fetchOrganizations()
  } catch (error) {
    console.error('删除组织失败:', error)
  }
}

function resetForm() {
  editingOrg.value = null
  orgForm.value = { name: '', parentId: '' }
}

onMounted(() => {
  store.fetchOrganizations()
})
</script>
