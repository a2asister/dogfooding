<template>
  <div class="page-container">
    <div class="page-header">
      <h2>能耗仪表盘</h2>
      <p>实时监控楼宇能耗数据和设备运行状态</p>
    </div>

    <div class="stats-grid" v-if="dashboardData">
      <div class="stat-card">
        <div class="stat-title">今日用电量</div>
        <div class="stat-value">{{ dashboardData.todayElectric }}</div>
        <div class="stat-unit">kWh</div>
        <div class="stat-change negative">↓ 较昨日减少 5.2%</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">今日用水量</div>
        <div class="stat-value">{{ dashboardData.todayWater }}</div>
        <div class="stat-unit">m³</div>
        <div class="stat-change negative">↓ 较昨日减少 3.8%</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">运行设备数</div>
        <div class="stat-value">{{ dashboardData.activeDevices }}</div>
        <div class="stat-unit">台</div>
        <div class="stat-change positive">正常运行</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">未处理告警</div>
        <div class="stat-value">{{ dashboardData.unresolvedAlerts }}</div>
        <div class="stat-unit">条</div>
        <div class="stat-change" :class="dashboardData.unresolvedAlerts > 0 ? 'positive' : 'negative'">
          {{ dashboardData.unresolvedAlerts > 0 ? '需要关注' : '全部处理完毕' }}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">能耗趋势图</h3>
      </div>
      <div class="chart-container">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem;">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">水电表状态</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>位置</th>
              <th>当前读数</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="meter in dashboardData?.meters || []" :key="meter.id">
              <td>{{ meter.name }}</td>
              <td>{{ meter.type === 'electric' ? '电表' : '水表' }}</td>
              <td>{{ meter.location }}</td>
              <td>{{ meter.currentReading }} {{ meter.type === 'electric' ? 'kWh' : 'm³' }}</td>
              <td>
                <span class="status-badge" :class="meter.status">{{ meter.status === 'online' ? '在线' : '离线' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">设备运行状态</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>设备名称</th>
              <th>类型</th>
              <th>位置</th>
              <th>状态</th>
              <th>功率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="device in dashboardData?.devices || []" :key="device.id">
              <td>{{ device.name }}</td>
              <td>{{ getDeviceTypeName(device.type) }}</td>
              <td>{{ device.location }}</td>
              <td>
                <span class="status-badge" :class="device.status">
                  {{ device.status === 'running' ? '运行中' : '已停止' }}
                </span>
              </td>
              <td>{{ device.power }}W</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">最近告警</h3>
      </div>
      <div v-if="dashboardData?.recentAlerts?.length > 0">
        <div
          v-for="alert in dashboardData.recentAlerts"
          :key="alert.id"
          class="alert-item"
          :class="[alert.type, alert.resolved ? 'resolved' : '']"
        >
          <div class="alert-header">
            <span class="alert-title">{{ alert.title }}</span>
            <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
          </div>
          <div class="alert-message">{{ alert.message }}</div>
        </div>
      </div>
      <div v-else class="empty">
        <div class="empty-icon">📋</div>
        <p>暂无告警记录</p>
      </div>
    </div>

    <div v-if="loading" class="loading">数据加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import axios from 'axios'
import moment from 'moment'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default {
  name: 'Dashboard',
  components: {
    Bar
  },
  setup() {
    const loading = ref(false)
    const error = ref(null)
    const dashboardData = ref(null)
    const chartData = ref({
      labels: [],
      datasets: []
    })

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }

    const getDeviceTypeName = (type) => {
      const types = {
        aircondition: '中央空调',
        lighting: '照明系统',
        elevator: '电梯'
      }
      return types[type] || type
    }

    const formatTime = (timestamp) => {
      return moment(timestamp).format('YYYY-MM-DD HH:mm')
    }

    const fetchData = async () => {
      loading.value = true
      error.value = null
      try {
        const [dashboardRes, energyRes] = await Promise.all([
          axios.get('/api/dashboard'),
          axios.get('/api/energy-data')
        ])
        dashboardData.value = dashboardRes.data

        const energyData = energyRes.data
        chartData.value = {
          labels: energyData.map(d => moment(d.timestamp).format('HH:mm')),
          datasets: [
            {
              label: '用电量 (kWh)',
              data: energyData.map(d => d.electricUsage),
              backgroundColor: 'rgba(102, 126, 234, 0.6)',
              borderColor: 'rgba(102, 126, 234, 1)',
              borderWidth: 1
            },
            {
              label: '用水量 (m³)',
              data: energyData.map(d => d.waterUsage),
              backgroundColor: 'rgba(79, 172, 254, 0.6)',
              borderColor: 'rgba(79, 172, 254, 1)',
              borderWidth: 1
            }
          ]
        }
      } catch (err) {
        error.value = '加载数据失败，请稍后重试'
        console.error('Error fetching data:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchData()
    })

    return {
      loading,
      error,
      dashboardData,
      chartData,
      chartOptions,
      getDeviceTypeName,
      formatTime
    }
  }
}
</script>
