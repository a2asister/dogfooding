<template>
  <div class="services-container">
    <el-row :gutter="20">
      <el-col :span="6" v-for="service in services" :key="service.id">
        <el-card class="service-card" shadow="hover" @click="selectService(service)">
          <div class="service-icon">
            <el-icon :size="40" :color="getServiceColor(service.type)">
              <component :is="getServiceIcon(service.type)" />
            </el-icon>
          </div>
          <div class="service-info">
            <h3 class="service-name">{{ service.name }}</h3>
            <p class="service-type">{{ getServiceTypeName(service.type) }}</p>
          </div>
          <div class="service-stats">
            <el-row :gutter="10">
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value">{{ getLogCount(service.name) }}</div>
                  <div class="stat-label">日志数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value" :class="{ 'has-errors': getErrorCount(service.name) > 0 }">
                    {{ getErrorCount(service.name) }}
                  </div>
                  <div class="stat-label">错误数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value">{{ getErrorRate(service.name) }}%</div>
                  <div class="stat-label">错误率</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="service-card add-service" shadow="hover" @click="handleCreate">
          <div class="add-icon">
            <el-icon size="60" color="#409eff"><Plus /></el-icon>
          </div>
          <div class="add-text">添加服务</div>
        </el-card>
      </el-col>
    </el-row>

    <el-divider />

    <el-card v-if="selectedService" class="service-detail">
      <template #header>
        <div class="card-header">
          <span>
            <el-button type="primary" link @click="selectedService = null">
              <el-icon><ArrowLeft /></el-icon>
              返回列表
            </el-button>
            服务详情: {{ selectedService.name }}
          </span>
          <div>
            <el-button type="danger" size="small" @click="handleDelete(selectedService)">
              <el-icon><Delete /></el-icon>
              删除服务
            </el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="3" border style="margin-bottom: 20px">
        <el-descriptions-item label="服务名称">{{ selectedService.name }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag :type="getServiceTagType(selectedService.type)">
            {{ getServiceTypeName(selectedService.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatTime(selectedService.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="3">
          {{ selectedService.description || '暂无描述' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-tabs v-model="detailTab">
        <el-tab-pane label="日志趋势" name="trend">
          <div ref="trendChart" class="chart-container"></div>
        </el-tab-pane>
        <el-tab-pane label="级别分布" name="level">
          <div ref="levelChart" class="chart-container"></div>
        </el-tab-pane>
        <el-tab-pane label="日志列表" name="logs">
          <el-table :data="serviceLogs" v-loading="logsLoading" style="width: 100%">
            <el-table-column prop="timestamp" label="时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.timestamp) }}
              </template>
            </el-table-column>
            <el-table-column prop="level" label="级别" width="100">
              <template #default="{ row }">
                <el-tag :type="getLevelType(row.level)" size="small">
                  {{ row.level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="来源" width="100">
              <template #default="{ row }">
                {{ getTypeName(row.type) }}
              </template>
            </el-table-column>
            <el-table-column prop="message" label="消息" min-width="300" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑服务' : '新建服务'" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="serviceForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="服务名称" prop="name">
          <el-input v-model="serviceForm.name" placeholder="请输入服务名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="serviceForm.type" placeholder="请选择服务类型" style="width: 100%">
            <el-option label="Docker容器" value="docker" />
            <el-option label="K8s容器" value="k8s" />
            <el-option label="后端服务" value="backend" />
            <el-option label="前端应用" value="frontend" />
            <el-option label="小程序" value="miniprogram" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="serviceForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入服务描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { useLogsStore } from '@/stores/logs'
import { logsApi } from '@/api'

const logsStore = useLogsStore()
const services = computed(() => logsStore.services)
const logsByService = computed(() => logsStore.logsByService)

const selectedService = ref(null)
const detailTab = ref('trend')
const serviceLogs = ref([])
const logsLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const trendChart = ref(null)
const levelChart = ref(null)

let trendChartInstance = null
let levelChartInstance = null

const serviceForm = ref({
  name: '',
  type: 'backend',
  description: ''
})

const formRules = {
  name: [
    { required: true, message: '请输入服务名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择服务类型', trigger: 'change' }
  ]
}

function formatTime(timestamp) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

function getServiceIcon(type) {
  const icons = {
    docker: 'Promotion',
    k8s: 'Share',
    backend: 'Server',
    frontend: 'Monitor',
    miniprogram: 'Iphone'
  }
  return icons[type] || 'Service'
}

function getServiceColor(type) {
  const colors = {
    docker: '#0db7ed',
    k8s: '#326ce5',
    backend: '#67c23a',
    frontend: '#409eff',
    miniprogram: '#909399'
  }
  return colors[type] || '#409eff'
}

function getServiceTagType(type) {
  const types = {
    docker: 'primary',
    k8s: 'primary',
    backend: 'success',
    frontend: 'warning',
    miniprogram: 'info'
  }
  return types[type] || 'info'
}

function getServiceTypeName(type) {
  const names = {
    docker: 'Docker容器',
    k8s: 'K8s容器',
    backend: '后端服务',
    frontend: '前端应用',
    miniprogram: '小程序'
  }
  return names[type] || type
}

function getTypeName(type) {
  const names = {
    docker: 'Docker',
    k8s: 'K8s',
    backend: '后端',
    frontend: '前端',
    miniprogram: '小程序'
  }
  return names[type] || type
}

function getLevelType(level) {
  const types = {
    DEBUG: 'info',
    INFO: 'success',
    WARN: 'warning',
    ERROR: 'danger',
    FATAL: 'danger'
  }
  return types[level] || 'info'
}

function getLogCount(serviceName) {
  const logs = logsByService.value[serviceName] || []
  return logs.length
}

function getErrorCount(serviceName) {
  const logs = logsByService.value[serviceName] || []
  return logs.filter(l => l.level === 'ERROR' || l.level === 'FATAL').length
}

function getErrorRate(serviceName) {
  const total = getLogCount(serviceName)
  if (total === 0) return '0.00'
  const errors = getErrorCount(serviceName)
  return ((errors / total) * 100).toFixed(2)
}

function selectService(service) {
  selectedService.value = service
}

async function fetchServiceLogs() {
  if (!selectedService.value) return
  
  logsLoading.value = true
  try {
    const result = await logsApi.search({
      service: selectedService.value.name,
      limit: 50
    })
    serviceLogs.value = result.data || []
  } catch (error) {
    console.error('获取服务日志失败:', error)
  } finally {
    logsLoading.value = false
  }
}

function initTrendChart() {
  if (!trendChart.value || !selectedService.value) return
  
  trendChartInstance = echarts.init(trendChart.value)
  
  const hours = Array.from({ length: 24 }, (_, i) => `${i}时`)
  const data = hours.map(() => Math.floor(Math.random() * 100))
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: hours
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '日志数量',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(102, 126, 234, 0.8)' },
            { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
          ])
        },
        lineStyle: {
          color: '#667eea',
          width: 2
        },
        data: data
      }
    ]
  }
  
  trendChartInstance.setOption(option)
}

function initLevelChart() {
  if (!levelChart.value || !selectedService.value) return
  
  levelChartInstance = echarts.init(levelChart.value)
  
  const serviceLogsLocal = logsByService.value[selectedService.value.name] || []
  const levelData = {
    DEBUG: 0,
    INFO: 0,
    WARN: 0,
    ERROR: 0,
    FATAL: 0
  }
  
  serviceLogsLocal.forEach(log => {
    if (levelData[log.level] !== undefined) {
      levelData[log.level]++
    }
  })
  
  const seriesData = Object.entries(levelData)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center'
    },
    series: [
      {
        name: '日志级别',
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
        data: seriesData,
        color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#C03636']
      }
    ]
  }
  
  levelChartInstance.setOption(option)
}

function handleCreate() {
  serviceForm.value = {
    name: '',
    type: 'backend',
    description: ''
  }
  isEdit.value = false
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      await logsApi.createService(serviceForm.value)
      ElMessage.success('服务创建成功')
      dialogVisible.value = false
      await logsStore.fetchServices()
    } catch (error) {
      console.error('创建服务失败:', error)
      ElMessage.error('创建服务失败')
    }
  })
}

async function handleDelete(service) {
  try {
    await ElMessageBox.confirm(
      `确定要删除服务"${service.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('服务删除成功')
    selectedService.value = null
    await logsStore.fetchServices()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除服务失败:', error)
      ElMessage.error('删除服务失败')
    }
  }
}

watch(selectedService, (newService) => {
  if (newService) {
    fetchServiceLogs()
    nextTick(() => {
      initTrendChart()
      initLevelChart()
    })
  }
})

watch(detailTab, (tab) => {
  if (tab === 'trend') {
    nextTick(() => initTrendChart())
  } else if (tab === 'level') {
    nextTick(() => initLevelChart())
  }
})

onMounted(async () => {
  await logsStore.fetchServices()
  await logsStore.fetchLogs({ limit: 100 })
})
</script>

<style scoped>
.services-container {
  width: 100%;
}

.service-card {
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.service-card:hover {
  transform: translateY(-5px);
}

.service-icon {
  text-align: center;
  padding: 20px 0;
}

.service-info {
  text-align: center;
  margin-bottom: 15px;
}

.service-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.service-type {
  font-size: 12px;
  color: #909399;
}

.service-stats {
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.stat-value.has-errors {
  color: #f56c6c;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.add-service {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: #f5f7fa;
}

.add-icon {
  opacity: 0.6;
  transition: opacity 0.3s;
}

.add-service:hover .add-icon {
  opacity: 1;
}

.add-text {
  margin-top: 10px;
  color: #909399;
  font-size: 14px;
}

.service-detail {
  margin-top: 20px;
}

.chart-container {
  height: 350px;
  width: 100%;
}
</style>
