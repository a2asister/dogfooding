<template>
  <div class="page-container">
    <div class="page-header">
      <h2>水电表管理</h2>
      <p>查看和管理所有智能水电表的实时数据</p>
    </div>

    <div class="stats-grid" v-if="meters.length > 0">
      <div class="stat-card">
        <div class="stat-title">在线电表数</div>
        <div class="stat-value">{{ electricMetersOnline }}</div>
        <div class="stat-unit">台</div>
        <div class="stat-change negative">共 {{ electricMetersTotal }} 台电表</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">在线水表数</div>
        <div class="stat-value">{{ waterMetersOnline }}</div>
        <div class="stat-unit">台</div>
        <div class="stat-change negative">共 {{ waterMetersTotal }} 台水表</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">总用电量</div>
        <div class="stat-value">{{ totalElectricReading.toFixed(1) }}</div>
        <div class="stat-unit">kWh</div>
        <div class="stat-change negative">较昨日减少 4.2%</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">总用水量</div>
        <div class="stat-value">{{ totalWaterReading.toFixed(1) }}</div>
        <div class="stat-unit">m³</div>
        <div class="stat-change negative">较昨日减少 3.1%</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">水电表列表</h3>
        <div class="btn-group">
          <button class="btn btn-primary btn-small" @click="filterType = 'all'">全部</button>
          <button class="btn btn-primary btn-small" @click="filterType = 'electric'">仅电表</button>
          <button class="btn btn-primary btn-small" @click="filterType = 'water'">仅水表</button>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>设备ID</th>
            <th>名称</th>
            <th>类型</th>
            <th>位置</th>
            <th>当前读数</th>
            <th>状态</th>
            <th>最后更新时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="meter in filteredMeters" :key="meter.id">
            <td>{{ meter.id.toUpperCase() }}</td>
            <td>{{ meter.name }}</td>
            <td>
              <span class="status-badge" :class="meter.type === 'electric' ? 'info' : 'warning'">
                {{ meter.type === 'electric' ? '电表' : '水表' }}
              </span>
            </td>
            <td>{{ meter.location }}</td>
            <td>
              <strong>{{ meter.currentReading }}</strong>
              <span style="color: #888; margin-left: 4px;">{{ meter.type === 'electric' ? 'kWh' : 'm³' }}</span>
            </td>
            <td>
              <span class="status-badge" :class="meter.status">
                {{ meter.status === 'online' ? '在线' : '离线' }}
              </span>
            </td>
            <td>{{ formatTime(meter.lastUpdate) }}</td>
          </tr>
        </tbody>
      </table>
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
  name: 'Meters',
  setup() {
    const loading = ref(false)
    const error = ref(null)
    const meters = ref([])
    const filterType = ref('all')

    const filteredMeters = computed(() => {
      if (filterType.value === 'all') return meters.value
      return meters.value.filter(m => m.type === filterType.value)
    })

    const electricMetersTotal = computed(() => {
      return meters.value.filter(m => m.type === 'electric').length
    })

    const electricMetersOnline = computed(() => {
      return meters.value.filter(m => m.type === 'electric' && m.status === 'online').length
    })

    const waterMetersTotal = computed(() => {
      return meters.value.filter(m => m.type === 'water').length
    })

    const waterMetersOnline = computed(() => {
      return meters.value.filter(m => m.type === 'water' && m.status === 'online').length
    })

    const totalElectricReading = computed(() => {
      return meters.value
        .filter(m => m.type === 'electric')
        .reduce((sum, m) => sum + m.currentReading, 0)
    })

    const totalWaterReading = computed(() => {
      return meters.value
        .filter(m => m.type === 'water')
        .reduce((sum, m) => sum + m.currentReading, 0)
    })

    const formatTime = (timestamp) => {
      return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    }

    const fetchMeters = async () => {
      loading.value = true
      error.value = null
      try {
        const response = await axios.get('/api/meters')
        meters.value = response.data
      } catch (err) {
        error.value = '加载水电表数据失败，请稍后重试'
        console.error('Error fetching meters:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchMeters()
    })

    return {
      loading,
      error,
      meters,
      filterType,
      filteredMeters,
      electricMetersTotal,
      electricMetersOnline,
      waterMetersTotal,
      waterMetersOnline,
      totalElectricReading,
      totalWaterReading,
      formatTime
    }
  }
}
</script>
