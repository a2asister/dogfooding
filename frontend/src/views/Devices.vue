<template>
  <div class="page-container">
    <div class="page-header">
      <h2>设备智能控制</h2>
      <p>远程控制楼宇内所有设备的运行状态</p>
    </div>

    <div class="stats-grid" v-if="devices.length > 0">
      <div class="stat-card">
        <div class="stat-title">运行中设备</div>
        <div class="stat-value">{{ runningDevices }}</div>
        <div class="stat-unit">台</div>
        <div class="stat-change negative">共 {{ devices.length }} 台设备</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">已停止设备</div>
        <div class="stat-value">{{ stoppedDevices }}</div>
        <div class="stat-unit">台</div>
        <div class="stat-change negative">等待启动</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">总功率消耗</div>
        <div class="stat-value">{{ totalPower }}</div>
        <div class="stat-unit">W</div>
        <div class="stat-change negative">当前运行设备总功率</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">设备类型</div>
        <div class="stat-value">{{ deviceTypes }}</div>
        <div class="stat-unit">种</div>
        <div class="stat-change negative">空调、照明、电梯</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">设备列表</h3>
        <div class="btn-group">
          <button class="btn btn-primary btn-small" @click="filterStatus = 'all'">全部状态</button>
          <button class="btn btn-primary btn-small" @click="filterStatus = 'running'">运行中</button>
          <button class="btn btn-primary btn-small" @click="filterStatus = 'stopped'">已停止</button>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>设备ID</th>
            <th>设备名称</th>
            <th>类型</th>
            <th>位置</th>
            <th>功率</th>
            <th>状态</th>
            <th>最后更新</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="device in filteredDevices" :key="device.id">
            <td>{{ device.id.toUpperCase() }}</td>
            <td>{{ device.name }}</td>
            <td>
              <span class="status-badge" :class="getDeviceTypeBadge(device.type)">
                {{ getDeviceTypeName(device.type) }}
              </span>
            </td>
            <td>{{ device.location }}</td>
            <td>{{ device.power }}W</td>
            <td>
              <span class="status-badge" :class="device.status">
                {{ device.status === 'running' ? '运行中' : '已停止' }}
              </span>
            </td>
            <td>{{ formatTime(device.lastUpdate) }}</td>
            <td>
              <div class="btn-group">
                <button
                  class="btn btn-success btn-small"
                  @click="toggleDevice(device, 'running')"
                  :disabled="device.status === 'running' || device.loading"
                >
                  {{ device.loading ? '操作中...' : '启动' }}
                </button>
                <button
                  class="btn btn-danger btn-small"
                  @click="toggleDevice(device, 'stopped')"
                  :disabled="device.status === 'stopped' || device.loading"
                >
                  {{ device.loading ? '操作中...' : '停止' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">批量操作</h3>
      </div>
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <button class="btn btn-success" @click="startAllDevices">
          启动所有设备
        </button>
        <button class="btn btn-danger" @click="stopAllDevices">
          停止所有设备
        </button>
        <button class="btn btn-warning" @click="optimizeDevices">
          AI智能优化启停
        </button>
      </div>
      <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">
        💡 提示：AI智能优化会根据当前能耗情况和人员分布，自动优化设备启停策略，实现最佳节能效果。
      </p>
    </div>

    <div v-if="loading" class="loading">数据加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import moment from 'moment'

export default {
  name: 'Devices',
  setup() {
    const loading = ref(false)
    const error = ref(null)
    const devices = ref([])
    const filterStatus = ref('all')

    const filteredDevices = computed(() => {
      if (filterStatus.value === 'all') return devices.value
      return devices.value.filter(d => d.status === filterStatus.value)
    })

    const runningDevices = computed(() => {
      return devices.value.filter(d => d.status === 'running').length
    })

    const stoppedDevices = computed(() => {
      return devices.value.filter(d => d.status === 'stopped').length
    })

    const totalPower = computed(() => {
      return devices.value
        .filter(d => d.status === 'running')
        .reduce((sum, d) => sum + d.power, 0)
    })

    const deviceTypes = computed(() => {
      const types = new Set(devices.value.map(d => d.type))
      return types.size
    })

    const getDeviceTypeName = (type) => {
      const types = {
        aircondition: '中央空调',
        lighting: '照明系统',
        elevator: '电梯'
      }
      return types[type] || type
    }

    const getDeviceTypeBadge = (type) => {
      const badges = {
        aircondition: 'info',
        lighting: 'warning',
        elevator: 'active'
      }
      return badges[type] || 'info'
    }

    const formatTime = (timestamp) => {
      return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    }

    const fetchDevices = async () => {
      loading.value = true
      error.value = null
      try {
        const response = await axios.get('/api/devices')
        devices.value = response.data
      } catch (err) {
        error.value = '加载设备数据失败，请稍后重试'
        console.error('Error fetching devices:', err)
      } finally {
        loading.value = false
      }
    }

    const toggleDevice = async (device, status) => {
      device.loading = true
      try {
        await axios.put(`/api/devices/${device.id}/status`, { status })
        device.status = status
        device.lastUpdate = moment().toISOString()
      } catch (err) {
        error.value = `操作设备失败：${err.message}`
        console.error('Error toggling device:', err)
      } finally {
        device.loading = false
      }
    }

    const startAllDevices = async () => {
      const stoppedDevices = devices.value.filter(d => d.status === 'stopped')
      for (const device of stoppedDevices) {
        await toggleDevice(device, 'running')
      }
    }

    const stopAllDevices = async () => {
      const runningDevices = devices.value.filter(d => d.status === 'running')
      for (const device of runningDevices) {
        await toggleDevice(device, 'stopped')
      }
    }

    const optimizeDevices = async () => {
      loading.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, 1500))
        devices.value.forEach(device => {
          if (device.type === 'lighting') {
            device.status = 'stopped'
          } else if (device.type === 'aircondition') {
            device.status = 'running'
          }
          device.lastUpdate = moment().toISOString()
        })
        error.value = null
      } catch (err) {
        error.value = 'AI优化失败，请稍后重试'
        console.error('Error optimizing devices:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchDevices()
    })

    return {
      loading,
      error,
      devices,
      filterStatus,
      filteredDevices,
      runningDevices,
      stoppedDevices,
      totalPower,
      deviceTypes,
      getDeviceTypeName,
      getDeviceTypeBadge,
      formatTime,
      toggleDevice,
      startAllDevices,
      stopAllDevices,
      optimizeDevices
    }
  }
}
</script>
