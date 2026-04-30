<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">访客网络</h1>
      <button @click="openCreateModal" class="btn btn-primary">创建访客网络</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div 
        v-for="network in guestNetworks" 
        :key="network.id"
        class="card"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="flex items-center">
              <h3 class="text-lg font-semibold">{{ network.name }}</h3>
              <span 
                class="ml-2 px-2 py-0.5 text-xs rounded-full"
                :class="network.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ network.active ? '活跃' : '已过期' }}
              </span>
            </div>
            <p class="text-sm text-gray-500 mt-1">
              SSID: {{ network.ssid }}
            </p>
            <p class="text-sm text-gray-500">
              密码: {{ network.password }}
            </p>
            <p class="text-sm text-gray-500">
              创建时间: {{ new Date(network.createdAt).toLocaleString('zh-CN') }}
            </p>
            <p class="text-sm text-gray-500">
              过期时间: {{ new Date(network.expiresAt).toLocaleString('zh-CN') }}
            </p>
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button 
            v-if="network.active"
            @click="extendNetwork(network)" 
            class="btn btn-secondary text-sm"
          >
            延长时效
          </button>
          <button 
            @click="editNetwork(network)" 
            class="btn btn-secondary text-sm"
          >
            编辑
          </button>
          <button 
            @click="deleteNetwork(network)" 
            class="btn btn-danger text-sm"
          >
            删除
          </button>
        </div>
      </div>

      <div v-if="guestNetworks.length === 0" class="card col-span-2">
        <div class="text-center py-8 text-gray-500">
          暂无访客网络，点击上方按钮创建一个新的访客网络
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">
          {{ editingNetwork.id ? '编辑访客网络' : '创建访客网络' }}
        </h2>
        <form @submit.prevent="saveNetwork">
          <div class="space-y-4">
            <div>
              <label class="label">网络名称</label>
              <input v-model="editingNetwork.name" type="text" class="input" required placeholder="例如: 访客WiFi" />
            </div>
            <div>
              <label class="label">SSID</label>
              <input v-model="editingNetwork.ssid" type="text" class="input" required placeholder="例如: Guest_WiFi" />
            </div>
            <div>
              <label class="label">密码</label>
              <input v-model="editingNetwork.password" type="text" class="input" required placeholder="设置访客密码" />
            </div>
            <div>
              <label class="label">有效时长 (小时)</label>
              <input 
                v-model.number="editingNetwork.duration" 
                type="number" 
                class="input" 
                min="1"
                max="720"
              />
              <p class="text-xs text-gray-500 mt-1">默认24小时，最大30天</p>
            </div>
            <div>
              <label class="label">最大带宽限制 (可选)</label>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs text-gray-500">上传 (MB/s)</label>
                  <input v-model.number="editingNetwork.uploadLimit" type="number" class="input" min="0" step="0.1" />
                </div>
                <div>
                  <label class="text-xs text-gray-500">下载 (MB/s)</label>
                  <input v-model.number="editingNetwork.downloadLimit" type="number" class="input" min="0" step="0.1" />
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="showCreateModal = false" class="btn btn-secondary">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showExtendModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">延长访客网络时效</h2>
        <p class="text-gray-600 mb-4">
          为网络 "{{ extendingNetwork?.name }}" 延长有效时间
        </p>
        <div class="space-y-4">
          <div>
            <label class="label">延长时长 (小时)</label>
            <select v-model="extendHours" class="input">
              <option :value="1">1小时</option>
              <option :value="6">6小时</option>
              <option :value="12">12小时</option>
              <option :value="24">24小时</option>
              <option :value="48">48小时</option>
              <option :value="168">7天</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button type="button" @click="showExtendModal = false" class="btn btn-secondary">取消</button>
          <button @click="confirmExtend" class="btn btn-primary">确认延长</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const guestNetworks = ref([])
const showCreateModal = ref(false)
const showExtendModal = ref(false)
const extendingNetwork = ref(null)
const extendHours = ref(24)

const editingNetwork = ref({
  name: '',
  ssid: '',
  password: '',
  duration: 24,
  uploadLimit: 2,
  downloadLimit: 10
})

const fetchGuestNetworks = async () => {
  try {
    const response = await axios.get('/api/guest-network')
    if (response.data.success) {
      guestNetworks.value = response.data.data
    }
  } catch (error) {
    console.error('获取访客网络失败:', error)
  }
}

const openCreateModal = () => {
  editingNetwork.value = {
    name: '',
    ssid: 'Guest_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    password: generatePassword(),
    duration: 24,
    uploadLimit: 2,
    downloadLimit: 10
  }
  showCreateModal.value = true
}

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

const editNetwork = (network) => {
  editingNetwork.value = { ...network }
  showCreateModal.value = true
}

const saveNetwork = async () => {
  try {
    if (editingNetwork.value.id) {
      await axios.put(`/api/guest-network/${editingNetwork.value.id}`, editingNetwork.value)
    } else {
      await axios.post('/api/guest-network', editingNetwork.value)
    }
    showCreateModal.value = false
    fetchGuestNetworks()
  } catch (error) {
    console.error('保存访客网络失败:', error)
  }
}

const deleteNetwork = async (network) => {
  if (confirm(`确定要删除访客网络 "${network.name}" 吗？`)) {
    try {
      await axios.delete(`/api/guest-network/${network.id}`)
      fetchGuestNetworks()
    } catch (error) {
      console.error('删除访客网络失败:', error)
    }
  }
}

const extendNetwork = (network) => {
  extendingNetwork.value = network
  extendHours.value = 24
  showExtendModal.value = true
}

const confirmExtend = async () => {
  try {
    await axios.post(`/api/guest-network/${extendingNetwork.value.id}/extend`, {
      hours: extendHours.value
    })
    showExtendModal.value = false
    fetchGuestNetworks()
  } catch (error) {
    console.error('延长访客网络时效失败:', error)
  }
}

onMounted(() => {
  fetchGuestNetworks()
})
</script>
