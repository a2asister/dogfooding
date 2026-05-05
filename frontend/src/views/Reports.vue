<template>
  <div class="page-container">
    <div class="page-header">
      <h2>能耗报表</h2>
      <p>查看和分析楼宇能耗的详细数据报告</p>
    </div>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="stats-grid" v-if="reportData">
      <div class="stat-card">
        <div class="stat-title">总用电量</div>
        <div class="stat-value">{{ reportData.totalElectric }}</div>
        <div class="stat-unit">kWh</div>
        <div class="stat-change" :class="reportData.compareYesterday < 0 ? 'negative' : 'positive'">
          {{ reportData.compareYesterday < 0 ? '↓' : '↑' }} 较上期 {{ Math.abs(reportData.compareYesterday) }}%
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-title">总用水量</div>
        <div class="stat-value">{{ reportData.totalWater }}</div>
        <div class="stat-unit">m³</div>
        <div class="stat-change negative">
          ↓ 较上期 3.8%
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-title">峰值时段</div>
        <div class="stat-value">{{ reportData.peakHour || reportData.peakDay }}</div>
        <div class="stat-unit">{{ getPeriodUnit() }}</div>
        <div class="stat-change positive">
          需关注能耗控制
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-title">节能趋势</div>
        <div class="stat-value">{{ getTrendText() }}</div>
        <div class="stat-unit">{{ getPeriodLabel() }}</div>
        <div class="stat-change negative">
          {{ getTrendDirection() }}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">能耗趋势图</h3>
      </div>
      <div class="chart-container">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem;">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">能耗分布</h3>
        </div>
        <div class="chart-container" style="height: 300px;">
          <Doughnut :data="pieChartData" :options="pieChartOptions" />
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">设备能耗排行</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>设备名称</th>
              <th>能耗 (kWh)</th>
              <th>占比</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(device, index) in deviceRanking" :key="device.name">
              <td>
                <span
                  :style="{
                    display: 'inline-flex',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: index < 3 ? ['#f44336', '#ff9800', '#ffc107'][index] : '#e0e0e0',
                    color: index < 3 ? 'white' : '#666',
                    fontWeight: '600',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem'
                  }"
                >
                  {{ index + 1 }}
                </span>
              </td>
              <td>{{ device.name }}</td>
              <td>{{ device.usage }}</td>
              <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="flex: 1; height: 8px; background: #eee; border-radius: 4px; overflow: hidden;">
                    <div
                      :style="{
                        height: '100%',
                        background: index < 3 ? ['#f44336', '#ff9800', '#ffc107'][index] : '#4caf50',
                        width: device.percentage + '%'
                      }"
                    ></div>
                  </div>
                  <span style="font-size: 0.9rem; color: #666;">{{ device.percentage }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">节能建议摘要</h3>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
        <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 1.5rem; border-radius: 12px;">
          <h4 style="color: #2e7d32; margin-bottom: 0.8rem;">✅ 节能亮点</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 0.5rem; color: #388e3c;">• 本月用电量较上月下降 2.5%</li>
            <li style="margin-bottom: 0.5rem; color: #388e3c;">• 照明系统节能优化效果显著</li>
            <li style="color: #388e3c;">• 非高峰时段能耗控制良好</li>
          </ul>
        </div>
        <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); padding: 1.5rem; border-radius: 12px;">
          <h4 style="color: #e65100; margin-bottom: 0.8rem;">⚠️ 改进空间</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 0.5rem; color: #ef6c00;">• 中央空调在高峰时段能耗偏高</li>
            <li style="margin-bottom: 0.5rem; color: #ef6c00;">• 部分区域存在待机能耗浪费</li>
            <li style="color: #ef6c00;">• 建议优化周末设备运行策略</li>
          </ul>
        </div>
        <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 1.5rem; border-radius: 12px;">
          <h4 style="color: #1565c0; margin-bottom: 0.8rem;">💡 优化建议</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 0.5rem; color: #1976d2;">• 实施 AI 智能温度调节策略</li>
            <li style="margin-bottom: 0.5rem; color: #1976d2;">• 增加定时开关机设置</li>
            <li style="color: #1976d2;">• 优化电梯运行调度算法</li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">数据加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import axios from 'axios'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default {
  name: 'Reports',
  components: {
    Line,
    Doughnut
  },
  setup() {
    const loading = ref(false)
    const error = ref(null)
    const activeTab = ref('monthly')
    const reportData = ref(null)
    const energyData = ref([])

    const tabs = [
      { label: '日报', value: 'daily' },
      { label: '周报', value: 'weekly' },
      { label: '月报', value: 'monthly' }
    ]

    const deviceRanking = [
      { name: '中央空调1号', usage: 4580, percentage: 45 },
      { name: '照明系统1区', usage: 2340, percentage: 23 },
      { name: '电梯1号', usage: 1850, percentage: 18 },
      { name: '通风系统', usage: 1420, percentage: 14 }
    ]

    const chartData = computed(() => {
      const labels = getLabels()
      return {
        labels,
        datasets: [
          {
            label: '用电量 (kWh)',
            data: energyData.value.map((_, i) => 100 + Math.random() * 80),
            borderColor: 'rgba(102, 126, 234, 1)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: '用水量 (m³)',
            data: energyData.value.map((_, i) => 20 + Math.random() * 30),
            borderColor: 'rgba(79, 172, 254, 1)',
            backgroundColor: 'rgba(79, 172, 254, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      }
    })

    const pieChartData = {
      labels: ['中央空调', '照明系统', '电梯', '通风系统', '其他设备'],
      datasets: [
        {
          data: [45, 23, 18, 10, 4],
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(245, 87, 108, 0.8)',
            'rgba(79, 172, 254, 0.8)',
            'rgba(67, 233, 123, 0.8)',
            'rgba(156, 39, 176, 0.8)'
          ],
          borderColor: [
            'rgba(102, 126, 234, 1)',
            'rgba(245, 87, 108, 1)',
            'rgba(79, 172, 254, 1)',
            'rgba(67, 233, 123, 1)',
            'rgba(156, 39, 176, 1)'
          ],
          borderWidth: 2
        }
      ]
    }

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

    const pieChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }

    const getLabels = () => {
      switch (activeTab.value) {
        case 'daily':
          return Array.from({ length: 24 }, (_, i) => `${i}:00`)
        case 'weekly':
          return ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        case 'monthly':
          return Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
        default:
          return []
      }
    }

    const getPeriodUnit = () => {
      switch (activeTab.value) {
        case 'daily':
          return '时段'
        case 'weekly':
          return '日期'
        case 'monthly':
          return '趋势'
        default:
          return ''
      }
    }

    const getPeriodLabel = () => {
      switch (activeTab.value) {
        case 'daily':
          return '今日'
        case 'weekly':
          return '本周'
        case 'monthly':
          return '本月'
        default:
          return ''
      }
    }

    const getTrendText = () => {
      return reportData.value?.trend === 'downward' ? '下降' : '上升'
    }

    const getTrendDirection = () => {
      return reportData.value?.trend === 'downward' ? '节能效果良好' : '需要关注'
    }

    const fetchReport = async () => {
      loading.value = true
      error.value = null
      try {
        const response = await axios.get(`/api/reports?type=${activeTab.value}`)
        reportData.value = response.data
        energyData.value = new Array(activeTab.value === 'daily' ? 24 : activeTab.value === 'weekly' ? 7 : 30).fill(0)
      } catch (err) {
        error.value = '加载报表数据失败，请稍后重试'
        console.error('Error fetching report:', err)
      } finally {
        loading.value = false
      }
    }

    watch(activeTab, () => {
      fetchReport()
    })

    onMounted(() => {
      fetchReport()
    })

    return {
      loading,
      error,
      activeTab,
      tabs,
      reportData,
      deviceRanking,
      chartData,
      pieChartData,
      chartOptions,
      pieChartOptions,
      getPeriodUnit,
      getPeriodLabel,
      getTrendText,
      getTrendDirection
    }
  }
}
</script>
