<template>
  <div class="data-dashboard">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>数据看板</span>
          <el-button-group>
            <el-button @click="refreshData" :icon="Refresh">刷新数据</el-button>
            <el-button @click="exportData" :icon="Download">导出</el-button>
          </el-button-group>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: #409EFF;">
                <el-icon :size="24"><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalUsers }}</div>
                <div class="stat-label">总用户数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: #67C23A;">
                <el-icon :size="24"><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalArticles }}</div>
                <div class="stat-label">文章总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: #E6A23C;">
                <el-icon :size="24"><View /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalViews }}</div>
                <div class="stat-label">总浏览量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: #F56C6C;">
                <el-icon :size="24"><TrendCharts /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.activeRate }}%</div>
                <div class="stat-label">活跃率</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>访问趋势</span>
            </template>
            <div ref="lineChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>用户分布</span>
            </template>
            <div ref="pieChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download, User, Document, View, TrendCharts } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const lineChartRef = ref(null)
const pieChartRef = ref(null)
let lineChart = null
let pieChart = null

const stats = ref({
  totalUsers: 1256,
  totalArticles: 3489,
  totalViews: 125680,
  activeRate: 78.5
})

const refreshData = () => {
  stats.value = {
    totalUsers: Math.floor(Math.random() * 1000) + 1000,
    totalArticles: Math.floor(Math.random() * 2000) + 3000,
    totalViews: Math.floor(Math.random() * 50000) + 100000,
    activeRate: parseFloat((Math.random() * 20 + 70).toFixed(1))
  }
  
  initCharts()
  ElMessage.success('数据已刷新')
}

const exportData = () => {
  ElMessage.success('导出功能正在处理...')
}

const initCharts = () => {
  if (lineChartRef.value) {
    if (lineChart) {
      lineChart.dispose()
    }
    lineChart = echarts.init(lineChartRef.value)
    
    const lineOption = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['访问量', '用户数']
      },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '访问量',
          type: 'line',
          data: [1200, 1500, 1800, 1400, 2000, 2500, 2200],
          smooth: true,
          areaStyle: {
            color: 'rgba(64, 158, 255, 0.3)'
          }
        },
        {
          name: '用户数',
          type: 'line',
          data: [800, 950, 1200, 1000, 1500, 1800, 1600],
          smooth: true,
          areaStyle: {
            color: 'rgba(103, 194, 58, 0.3)'
          }
        }
      ]
    }
    
    lineChart.setOption(lineOption)
  }
  
  if (pieChartRef.value) {
    if (pieChart) {
      pieChart.dispose()
    }
    pieChart = echarts.init(pieChartRef.value)
    
    const pieOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '5%',
        left: 'center'
      },
      series: [
        {
          name: '用户分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 1048, name: '管理员' },
            { value: 735, name: '数据分析师' },
            { value: 580, name: '内容编辑' },
            { value: 484, name: '普通用户' }
          ]
        }
      ]
    }
    
    pieChart.setOption(pieOption)
  }
}

const handleResize = () => {
  lineChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  lineChart?.dispose()
  pieChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.data-dashboard {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card {
  cursor: pointer;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  margin-left: 16px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.chart-container {
  height: 350px;
}
</style>
