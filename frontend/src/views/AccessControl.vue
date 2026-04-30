<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">访问控制</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">访问规则</h2>
          <button @click="openAddRuleModal" class="btn btn-primary text-sm">添加规则</button>
        </div>
        <div class="space-y-3">
          <div 
            v-for="rule in accessRules" 
            :key="rule.id"
            class="p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium">{{ rule.name }}</p>
                <p class="text-sm text-gray-500">
                  设备: {{ rule.deviceName || '全部' }} | 
                  时间: {{ rule.schedule || '全天' }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  创建时间: {{ new Date(rule.createdAt).toLocaleString('zh-CN') }}
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input 
                    v-model="rule.enabled" 
                    type="checkbox" 
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <button @click="deleteRule(rule)" class="text-red-600 hover:text-red-900 text-sm">删除</button>
              </div>
            </div>
          </div>
          <div v-if="accessRules.length === 0" class="text-center text-gray-500 py-4">
            暂无访问规则
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">黑名单</h2>
            <button @click="openBlacklistModal" class="btn btn-primary text-sm">添加</button>
          </div>
          <div class="space-y-2">
            <div 
              v-for="item in blacklist" 
              :key="item.id"
              class="flex justify-between items-center p-2 bg-red-50 rounded"
            >
              <div>
                <p class="font-medium text-red-800">{{ item.value }}</p>
                <p class="text-xs text-red-600">{{ item.reason || '无理由' }}</p>
              </div>
              <button 
                @click="removeFromBlacklist(item)" 
                class="text-red-600 hover:text-red-900"
              >
                ×
              </button>
            </div>
            <div v-if="blacklist.length === 0" class="text-center text-gray-500 py-2">
              黑名单为空
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">白名单</h2>
            <button @click="openWhitelistModal" class="btn btn-primary text-sm">添加</button>
          </div>
          <div class="space-y-2">
            <div 
              v-for="item in whitelist" 
              :key="item.id"
              class="flex justify-between items-center p-2 bg-green-50 rounded"
            >
              <div>
                <p class="font-medium text-green-800">{{ item.value }}</p>
                <p class="text-xs text-green-600">{{ item.reason || '无理由' }}</p>
              </div>
              <button 
                @click="removeFromWhitelist(item)" 
                class="text-green-600 hover:text-green-900"
              >
                ×
              </button>
            </div>
            <div v-if="whitelist.length === 0" class="text-center text-gray-500 py-2">
              白名单为空
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showRuleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">添加访问规则</h2>
        <form @submit.prevent="saveRule">
          <div class="space-y-4">
            <div>
              <label class="label">规则名称</label>
              <input v-model="newRule.name" type="text" class="input" required />
            </div>
            <div>
              <label class="label">设备</label>
              <select v-model="newRule.deviceId" class="input">
                <option value="">全部设备</option>
                <option v-for="device in devices" :key="device.id" :value="device.id">
                  {{ device.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">规则类型</label>
              <select v-model="newRule.type" class="input">
                <option value="block">禁止访问</option>
                <option value="allow">允许访问</option>
                <option value="limit">限速</option>
              </select>
            </div>
            <div v-if="newRule.type === 'limit'" class="space-y-2">
              <div>
                <label class="label">上传限速 (MB/s)</label>
                <input v-model.number="newRule.uploadLimit" type="number" class="input" min="0" step="0.1" />
              </div>
              <div>
                <label class="label">下载限速 (MB/s)</label>
                <input v-model.number="newRule.downloadLimit" type="number" class="input" min="0" step="0.1" />
              </div>
            </div>
            <div>
              <label class="label">时间范围（可选）</label>
              <input v-model="newRule.schedule" type="text" class="input" placeholder="例如: 09:00-18:00" />
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="showRuleModal = false" class="btn btn-secondary">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showBlacklistModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">添加到黑名单</h2>
        <form @submit.prevent="addToBlacklist">
          <div class="space-y-4">
            <div>
              <label class="label">类型</label>
              <select v-model="newBlacklistItem.type" class="input">
                <option value="ip">IP地址</option>
                <option value="mac">MAC地址</option>
                <option value="device">设备</option>
              </select>
            </div>
            <div>
              <label class="label">值</label>
              <input v-model="newBlacklistItem.value" type="text" class="input" required placeholder="例如: 192.168.1.100" />
            </div>
            <div>
              <label class="label">理由（可选）</label>
              <input v-model="newBlacklistItem.reason" type="text" class="input" />
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="showBlacklistModal = false" class="btn btn-secondary">取消</button>
            <button type="submit" class="btn btn-primary">添加</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showWhitelistModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">添加到白名单</h2>
        <form @submit.prevent="addToWhitelist">
          <div class="space-y-4">
            <div>
              <label class="label">类型</label>
              <select v-model="newWhitelistItem.type" class="input">
                <option value="ip">IP地址</option>
                <option value="mac">MAC地址</option>
                <option value="device">设备</option>
              </select>
            </div>
            <div>
              <label class="label">值</label>
              <input v-model="newWhitelistItem.value" type="text" class="input" required placeholder="例如: 192.168.1.100" />
            </div>
            <div>
              <label class="label">理由（可选）</label>
              <input v-model="newWhitelistItem.reason" type="text" class="input" />
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="showWhitelistModal = false" class="btn btn-secondary">取消</button>
            <button type="submit" class="btn btn-primary">添加</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const accessRules = ref([])
const blacklist = ref([])
const whitelist = ref([])
const devices = ref([])

const showRuleModal = ref(false)
const showBlacklistModal = ref(false)
const showWhitelistModal = ref(false)

const newRule = ref({
  name: '',
  deviceId: '',
  type: 'block',
  uploadLimit: 1,
  downloadLimit: 5,
  schedule: ''
})

const newBlacklistItem = ref({
  type: 'ip',
  value: '',
  reason: ''
})

const newWhitelistItem = ref({
  type: 'ip',
  value: '',
  reason: ''
})

const fetchData = async () => {
  try {
    const [rulesRes, blacklistRes, whitelistRes, devicesRes] = await Promise.all([
      axios.get('/api/access-control/rules'),
      axios.get('/api/access-control/blacklist'),
      axios.get('/api/access-control/whitelist'),
      axios.get('/api/devices')
    ])

    if (rulesRes.data.success) {
      accessRules.value = rulesRes.data.data
    }
    if (blacklistRes.data.success) {
      blacklist.value = blacklistRes.data.data
    }
    if (whitelistRes.data.success) {
      whitelist.value = whitelistRes.data.data
    }
    if (devicesRes.data.success) {
      devices.value = devicesRes.data.data
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const openAddRuleModal = () => {
  newRule.value = {
    name: '',
    deviceId: '',
    type: 'block',
    uploadLimit: 1,
    downloadLimit: 5,
    schedule: ''
  }
  showRuleModal.value = true
}

const saveRule = async () => {
  try {
    const device = devices.value.find(d => d.id === newRule.value.deviceId)
    const ruleToSave = {
      ...newRule.value,
      deviceName: device?.name,
      enabled: true
    }
    await axios.post('/api/access-control/rules', ruleToSave)
    showRuleModal.value = false
    fetchData()
  } catch (error) {
    console.error('保存规则失败:', error)
  }
}

const deleteRule = async (rule) => {
  if (confirm(`确定要删除规则 "${rule.name}" 吗？`)) {
    try {
      await axios.delete(`/api/access-control/rules/${rule.id}`)
      fetchData()
    } catch (error) {
      console.error('删除规则失败:', error)
    }
  }
}

const openBlacklistModal = () => {
  newBlacklistItem.value = {
    type: 'ip',
    value: '',
    reason: ''
  }
  showBlacklistModal.value = true
}

const addToBlacklist = async () => {
  try {
    await axios.post('/api/access-control/blacklist', newBlacklistItem.value)
    showBlacklistModal.value = false
    fetchData()
  } catch (error) {
    console.error('添加黑名单失败:', error)
  }
}

const removeFromBlacklist = async (item) => {
  try {
    await axios.delete(`/api/access-control/blacklist/${item.id}`)
    fetchData()
  } catch (error) {
    console.error('移除黑名单失败:', error)
  }
}

const openWhitelistModal = () => {
  newWhitelistItem.value = {
    type: 'ip',
    value: '',
    reason: ''
  }
  showWhitelistModal.value = true
}

const addToWhitelist = async () => {
  try {
    await axios.post('/api/access-control/whitelist', newWhitelistItem.value)
    showWhitelistModal.value = false
    fetchData()
  } catch (error) {
    console.error('添加白名单失败:', error)
  }
}

const removeFromWhitelist = async (item) => {
  try {
    await axios.delete(`/api/access-control/whitelist/${item.id}`)
    fetchData()
  } catch (error) {
    console.error('移除白名单失败:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>
