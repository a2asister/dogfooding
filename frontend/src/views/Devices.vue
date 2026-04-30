<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">设备管理</h1>
      <button @click="scanDevices" class="btn btn-primary">
        扫描网络
      </button>
    </div>

    <div class="flex items-center space-x-4">
      <div class="flex-1">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索设备名称或IP..." 
          class="input"
        />
      </div>
      <select v-model="filterStatus" class="input w-40">
        <option value="">全部状态</option>
        <option value="online">在线</option>
        <option value="offline">离线</option>
      </select>
    </div>

    <div class="card">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP地址</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MAC地址</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="device in filteredDevices" :key="device.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {{ getDeviceIcon(device.type) }}
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ device.name }}</div>
                  <div class="text-sm text-gray-500">{{ device.note || '无备注' }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ device.ip }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ device.mac }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ device.type || '未知' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="device.online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ device.online ? '在线' : '离线' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <button @click="editDevice(device)" class="text-blue-600 hover:text-blue-900">编辑</button>
              <button @click="deleteDevice(device)" class="text-red-600 hover:text-red-900">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredDevices.length === 0" class="text-center py-8 text-gray-500">
        暂无设备数据
      </div>
    </div>

    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">{{ editingDevice.id ? '编辑设备' : '添加设备' }}</h2>
        <form @submit.prevent="saveDevice">
          <div class="space-y-4">
            <div>
              <label class="label">设备名称</label>
              <input v-model="editingDevice.name" type="text" class="input" required />
            </div>
            <div>
              <label class="label">备注</label>
              <input v-model="editingDevice.note" type="text" class="input" />
            </div>
            <div>
              <label class="label">IP地址</label>
              <input v-model="editingDevice.ip" type="text" class="input" required />
            </div>
            <div>
              <label class="label">MAC地址</label>
              <input v-model="editingDevice.mac" type="text" class="input" required />
            </div>
            <div>
              <label class="label">设备类型</label>
              <select v-model="editingDevice.type" class="input">
                <option value="手机">手机</option>
                <option value="电脑">电脑</option>
                <option value="电视">电视</option>
                <option value="平板">平板</option>
                <option value="路由器">路由器</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="showEditModal = false" class="btn btn-secondary">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const devices = ref([])
const searchQuery = ref('')
const filterStatus = ref('')
const showEditModal = ref(false)
const editingDevice = ref({})

const filteredDevices = computed(() => {
  return devices.value.filter(device => {
    const matchesSearch = !searchQuery.value || 
      device.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      device.ip?.includes(searchQuery.value)
    const matchesStatus = !filterStatus.value || 
      (filterStatus.value === 'online' && device.online) ||
      (filterStatus.value === 'offline' && !device.online)
    return matchesSearch && matchesStatus
  })
})

const getDeviceIcon = (type) => {
  const icons = {
    '手机': '📱',
    '电脑': '💻',
    '电视': '📺',
    '平板': '📱',
    '路由器': '🌐',
    '其他': '📦'
  }
  return icons[type] || '📦'
}

const fetchDevices = async () => {
  try {
    const response = await axios.get('/api/devices')
    if (response.data.success) {
      devices.value = response.data.data
    }
  } catch (error) {
    console.error('获取设备列表失败:', error)
  }
}

const scanDevices = async () => {
  try {
    const response = await axios.get('/api/devices/scan')
    if (response.data.success) {
      devices.value = response.data.data
    }
  } catch (error) {
    console.error('扫描设备失败:', error)
  }
}

const editDevice = (device) => {
  editingDevice.value = { ...device }
  showEditModal.value = true
}

const saveDevice = async () => {
  try {
    if (editingDevice.value.id) {
      await axios.put(`/api/devices/${editingDevice.value.id}`, editingDevice.value)
    } else {
      await axios.post('/api/devices', editingDevice.value)
    }
    showEditModal.value = false
    fetchDevices()
  } catch (error) {
    console.error('保存设备失败:', error)
  }
}

const deleteDevice = async (device) => {
  if (confirm(`确定要删除设备 "${device.name}" 吗？`)) {
    try {
      await axios.delete(`/api/devices/${device.id}`)
      fetchDevices()
    } catch (error) {
      console.error('删除设备失败:', error)
    }
  }
}

onMounted(() => {
  fetchDevices()
})
</script>
