<template>
  <div>
    <div class="toolbar">
      <h2 style="margin: 0; font-size: 20px; font-weight: 600">可视化录制</h2>
      <div class="toolbar-right">
        <el-select v-model="selectedRobotId" placeholder="选择录制机器人" style="width: 200px; margin-right: 12px">
          <el-option
            v-for="robot in onlineRobots"
            :key="robot.id"
            :label="robot.name"
            :value="robot.id"
          />
        </el-select>
        <el-button
          v-if="!isRecording"
          type="primary"
          :disabled="!selectedRobotId"
          @click="startRecording"
        >
          <el-icon><VideoCamera /></el-icon>
          开始录制
        </el-button>
        <el-button
          v-else
          type="danger"
          @click="stopRecording"
        >
          <el-icon><VideoCameraFilled /></el-icon>
          停止录制
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="page-card">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>录制预览</span>
              <el-tag v-if="isRecording" type="danger" effect="dark">
                <span class="recording-dot"></span>
                录制中 {{ recordingTime }}
              </el-tag>
            </div>
          </template>
          
          <div class="recording-preview">
            <el-empty
              v-if="!isRecording"
              description="选择机器人并开始录制"
              :image-size="100"
            >
              <template #image>
                <el-icon :size="80" color="#c0c4cc"><VideoCamera /></el-icon>
              </template>
            </el-empty>
            
            <div v-else class="recording-active">
              <div class="recording-content">
                <el-icon :size="60"><Monitor /></el-icon>
                <div style="margin-top: 16px; font-size: 16px; color: #303133">正在录制屏幕操作...</div>
                <div style="margin-top: 8px; color: #909399; font-size: 13px">
                  已录制 {{ steps.length }} 个操作步骤
                </div>
              </div>
            </div>
          </div>
        </el-card>
        
        <el-card class="page-card" style="margin-top: 20px">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>录制步骤</span>
              <span v-if="steps.length > 0" style="color: #909399; font-size: 13px">
                共 {{ steps.length }} 步
              </span>
            </div>
          </template>
          
          <el-timeline v-if="steps.length > 0">
            <el-timeline-item
              v-for="(step, index) in steps"
              :key="index"
              :type="getStepType(step.type)"
              :timestamp="formatTime(step.timestamp)"
              placement="top"
            >
              <el-card shadow="hover" class="step-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start">
                  <div style="display: flex; gap: 12px">
                    <div
                      class="step-icon"
                      :class="`step-icon-${step.type}`"
                    >
                      <el-icon>{{ getStepIcon(step.type) }}</el-icon>
                    </div>
                    <div>
                      <div style="font-weight: 600; color: #303133; margin-bottom: 4px">
                        {{ getStepLabel(step.type) }}
                      </div>
                      <div style="font-size: 13px; color: #606266; line-height: 1.5">
                        <template v-if="step.type === 'navigate'">
                          导航到: <code style="background: #f5f7fa; padding: 2px 6px; border-radius: 4px">{{ step.url }}</code>
                        </template>
                        <template v-else-if="step.type === 'click'">
                          点击元素: <code style="background: #f5f7fa; padding: 2px 6px; border-radius: 4px">{{ step.selector }}</code>
                        </template>
                        <template v-else-if="step.type === 'input'">
                          输入: <code style="background: #f5f7fa; padding: 2px 6px; border-radius: 4px">{{ step.value }}</code>
                        </template>
                        <template v-else-if="step.type === 'wait'">
                          等待 {{ step.duration }} 毫秒
                        </template>
                        <template v-else-if="step.type === 'screenshot'">
                          截图已保存
                        </template>
                        <template v-else>
                          {{ step.description || '未知操作' }}
                        </template>
                      </div>
                      <div v-if="step.x !== undefined && step.y !== undefined" style="font-size: 12px; color: #c0c4cc; margin-top: 4px">
                        坐标: ({{ step.x }}, {{ step.y }})
                      </div>
                    </div>
                  </div>
                  <el-button-group v-if="!isRecording">
                    <el-button type="primary" link size="small" @click="editStep(step, index)">
                      编辑
                    </el-button>
                    <el-button type="danger" link size="small" @click="deleteStep(index)">
                      删除
                    </el-button>
                  </el-button-group>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          
          <el-empty v-else description="暂无录制步骤" :image-size="80">
            <template #image>
              <el-icon :size="60" color="#c0c4cc"><List /></el-icon>
            </template>
          </el-empty>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="page-card">
          <template #header>
            <span>录制控制</span>
          </template>
          
          <el-form label-position="top">
            <el-form-item label="录制名称">
              <el-input
                v-model="recordingName"
                placeholder="请输入录制名称"
                :disabled="isRecording"
              />
            </el-form-item>
            
            <el-form-item label="录制类型">
              <el-radio-group v-model="recordingType" :disabled="isRecording">
                <el-radio value="web">网页操作</el-radio>
                <el-radio value="desktop">桌面操作</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-divider />
            
            <div style="margin-bottom: 16px">
              <div style="font-weight: 500; margin-bottom: 8px; color: #303133">录制选项</div>
              <el-checkbox v-model="recordOptions.captureScreenshots" :disabled="isRecording">
                操作时截图
              </el-checkbox>
              <el-checkbox v-model="recordOptions.captureCoordinates" :disabled="isRecording">
                记录鼠标坐标
              </el-checkbox>
              <el-checkbox v-model="recordOptions.captureSelector" :disabled="isRecording">
                记录 CSS 选择器
              </el-checkbox>
            </div>
            
            <el-divider />
            
            <div>
              <div style="font-weight: 500; margin-bottom: 8px; color: #303133">快捷操作</div>
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-button
                    :disabled="!isRecording"
                    style="width: 100%"
                    @click="addWaitStep"
                  >
                    <el-icon><Timer /></el-icon>
                    等待
                  </el-button>
                </el-col>
                <el-col :span="12">
                  <el-button
                    :disabled="!isRecording"
                    style="width: 100%"
                    @click="addScreenshotStep"
                  >
                    <el-icon><Camera /></el-icon>
                    截图
                  </el-button>
                </el-col>
              </el-row>
            </div>
          </el-form>
        </el-card>
        
        <el-card class="page-card" style="margin-top: 20px">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>操作</span>
            </div>
          </template>
          
          <div style="display: flex; flex-direction: column; gap: 12px">
            <el-button type="primary" @click="convertToWorkflow" :disabled="steps.length === 0">
              <el-icon><Promotion /></el-icon>
              转换为流程
            </el-button>
            <el-button @click="loadRecordings">
              <el-icon><List /></el-icon>
              查看历史录制
            </el-button>
            <el-button type="danger" @click="clearSteps" :disabled="steps.length === 0 || isRecording">
              <el-icon><Delete /></el-icon>
              清空步骤
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="historyDialogVisible"
      title="历史录制"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-table :data="recordings" v-loading="historyLoading">
        <el-table-column label="名称" min-width="200">
          <template #default="{ row }">
            <div>
              <div style="font-weight: 500; color: #303133">{{ row.name }}</div>
              <div style="font-size: 12px; color: #909399">{{ row.steps?.length || 0 }} 个步骤</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">
              {{ row.type === 'web' ? '网页' : '桌面' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : 'warning'" size="small">
              {{ row.status === 'completed' ? '已完成' : '录制中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="loadRecording(row)">
              加载
            </el-button>
            <el-button type="danger" link size="small" @click="deleteRecording(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="historyDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="stepDialogVisible"
      title="编辑步骤"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="editingStep" label-width="100px">
        <el-form-item label="操作类型">
          <el-select v-model="editingStep.type" style="width: 100%">
            <el-option label="导航" value="navigate" />
            <el-option label="点击" value="click" />
            <el-option label="输入" value="input" />
            <el-option label="等待" value="wait" />
            <el-option label="截图" value="screenshot" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="editingStep.type === 'navigate'" label="URL">
          <el-input v-model="editingStep.url" placeholder="https://example.com" />
        </el-form-item>
        <el-form-item v-else-if="editingStep.type === 'click'" label="选择器">
          <el-input v-model="editingStep.selector" placeholder="CSS 选择器" />
        </el-form-item>
        <el-form-item v-else-if="editingStep.type === 'input'" label="输入值">
          <el-input v-model="editingStep.value" placeholder="输入内容" />
        </el-form-item>
        <el-form-item v-else-if="editingStep.type === 'wait'" label="等待时间">
          <el-input-number v-model="editingStep.duration" :min="100" :max="60000" />
          <span style="margin-left: 8px; color: #909399">毫秒</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stepDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveStep">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="convertDialogVisible"
      title="转换为流程"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="convertForm" label-width="100px">
        <el-form-item label="流程名称" prop="name">
          <el-input v-model="convertForm.name" placeholder="请输入流程名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="convertForm.description"
            type="textarea"
            placeholder="请输入流程描述"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="流程类型">
          <el-radio-group v-model="convertForm.type">
            <el-radio value="automation">自动化</el-radio>
            <el-radio value="test">测试</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="convertDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmConvert" :loading="converting">转换</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  VideoCamera,
  VideoCameraFilled,
  Monitor,
  List,
  Timer,
  Camera,
  Promotion,
  Delete,
  Mouse,
  Edit,
  View,
  Document
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { recordingsAPI, workflowsAPI, robotsAPI } from '@/api'

const selectedRobotId = ref('')
const onlineRobots = ref([])
const isRecording = ref(false)
const recordingTime = ref('00:00')
const recordingTimer = ref(null)
const startTime = ref(0)

const recordingName = ref('')
const recordingType = ref('web')
const steps = ref([])

const recordOptions = reactive({
  captureScreenshots: true,
  captureCoordinates: true,
  captureSelector: true
})

const historyDialogVisible = ref(false)
const historyLoading = ref(false)
const recordings = ref([])

const stepDialogVisible = ref(false)
const editingStep = ref({})
const editingIndex = ref(-1)

const convertDialogVisible = ref(false)
const converting = ref(false)
const currentRecordingId = ref('')
const convertForm = reactive({
  name: '',
  description: '',
  type: 'automation'
})

const formatTime = (time) => {
  if (!time) return '-'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

const getStepType = (type) => {
  const map = {
    navigate: 'primary',
    click: 'warning',
    input: 'success',
    wait: 'info',
    screenshot: 'danger',
    keypress: 'info'
  }
  return map[type] || 'info'
}

const getStepIcon = (type) => {
  const map = {
    navigate: View,
    click: Mouse,
    input: Edit,
    wait: Timer,
    screenshot: Camera,
    keypress: Document
  }
  return map[type] || Document
}

const getStepLabel = (type) => {
  const map = {
    navigate: '页面导航',
    click: '元素点击',
    input: '文本输入',
    wait: '等待延迟',
    screenshot: '页面截图',
    keypress: '键盘操作'
  }
  return map[type] || '未知操作'
}

const loadOnlineRobots = async () => {
  try {
    const res = await robotsAPI.getRobots()
    onlineRobots.value = res.data.filter(r => r.status === 'online')
  } catch (error) {
    console.error(error)
  }
}

const startRecording = () => {
  if (!selectedRobotId.value) {
    ElMessage.warning('请先选择录制机器人')
    return
  }
  
  isRecording.value = true
  startTime.value = Date.now()
  recordingTime.value = '00:00'
  
  recordingTimer.value = setInterval(() => {
    const diff = Math.floor((Date.now() - startTime.value) / 1000)
    const minutes = Math.floor(diff / 60)
    const seconds = diff % 60
    recordingTime.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, 1000)
  
  ElMessage.success('开始录制')
}

const stopRecording = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要停止录制吗？',
      '停止录制',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    isRecording.value = false
    if (recordingTimer.value) {
      clearInterval(recordingTimer.value)
      recordingTimer.value = null
    }
    
    if (steps.value.length > 0) {
      try {
        await recordingsAPI.createRecording({
          name: recordingName.value || `录制_${dayjs().format('YYYYMMDD_HHmmss')}`,
          type: recordingType.value,
          steps: steps.value,
          robotId: selectedRobotId.value
        })
        ElMessage.success('录制已保存')
      } catch (error) {
        console.error('保存录制失败:', error)
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const addWaitStep = () => {
  steps.value.push({
    type: 'wait',
    duration: 3000,
    timestamp: Date.now()
  })
  ElMessage.success('已添加等待步骤')
}

const addScreenshotStep = () => {
  steps.value.push({
    type: 'screenshot',
    timestamp: Date.now()
  })
  ElMessage.success('已添加截图步骤')
}

const editStep = (step, index) => {
  editingStep.value = { ...step }
  editingIndex.value = index
  stepDialogVisible.value = true
}

const saveStep = () => {
  if (editingIndex.value >= 0) {
    steps.value[editingIndex.value] = { ...editingStep.value }
    ElMessage.success('已更新')
  }
  stepDialogVisible.value = false
}

const deleteStep = (index) => {
  steps.value.splice(index, 1)
  ElMessage.success('已删除')
}

const clearSteps = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有步骤吗？',
      '清空确认',
      { type: 'warning' }
    )
    steps.value = []
    ElMessage.success('已清空')
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const loadRecordings = async () => {
  historyDialogVisible.value = true
  historyLoading.value = true
  
  try {
    const res = await recordingsAPI.getRecordings()
    recordings.value = res.data
  } catch (error) {
    ElMessage.error('加载历史录制失败')
    console.error(error)
  } finally {
    historyLoading.value = false
  }
}

const loadRecording = (recording) => {
  currentRecordingId.value = recording.id
  recordingName.value = recording.name
  recordingType.value = recording.type
  steps.value = [...(recording.steps || [])]
  historyDialogVisible.value = false
  ElMessage.success('已加载录制')
}

const deleteRecording = async (recording) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除录制 "${recording.name}" 吗？`,
      '删除确认',
      { type: 'warning' }
    )
    await recordingsAPI.deleteRecording(recording.id)
    ElMessage.success('已删除')
    loadRecordings()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const convertToWorkflow = () => {
  convertForm.name = recordingName.value || '新建流程'
  convertForm.description = `从录制转换，共 ${steps.value.length} 个步骤`
  convertDialogVisible.value = true
}

const confirmConvert = async () => {
  if (!convertForm.name) {
    ElMessage.warning('请输入流程名称')
    return
  }
  
  converting.value = true
  try {
    if (currentRecordingId.value) {
      await recordingsAPI.convertToWorkflow(currentRecordingId.value, {
        name: convertForm.name,
        description: convertForm.description,
        type: convertForm.type
      })
    } else {
      const workflowData = {
        name: convertForm.name,
        description: convertForm.description,
        type: recordingType.value,
        status: 'draft',
        nodes: steps.value.map((step, index) => {
          const nodeInfo = mapStepToNode(step)
          return {
            id: `node-${index}`,
            type: nodeInfo.type,
            x: 100 + index * 180,
            y: 200,
            label: nodeInfo.label,
            config: nodeInfo.config
          }
        }),
        edges: []
      }
      
      for (let i = 0; i < workflowData.nodes.length - 1; i++) {
        workflowData.edges.push({
          id: `edge-${i}`,
          source: workflowData.nodes[i].id,
          target: workflowData.nodes[i + 1].id
        })
      }
      
      await workflowsAPI.createWorkflow(workflowData)
    }
    
    ElMessage.success('转换成功')
    convertDialogVisible.value = false
  } catch (error) {
    ElMessage.error('转换失败')
    console.error(error)
  } finally {
    converting.value = false
  }
}

const mapStepToNode = (step) => {
  const typeMap = {
    navigate: 'navigate',
    click: 'click',
    input: 'type',
    wait: 'wait',
    screenshot: 'screenshot'
  }
  
  const labelMap = {
    navigate: '导航',
    click: '点击',
    input: '输入',
    wait: '等待',
    screenshot: '截图'
  }
  
  const config = {}
  switch (step.type) {
    case 'navigate':
      config.url = step.url || ''
      break
    case 'click':
      config.selector = step.selector || ''
      config.waitFor = 0
      break
    case 'input':
      config.selector = step.selector || ''
      config.value = step.value || ''
      break
    case 'wait':
      config.selector = ''
      config.timeout = step.duration || 1000
      break
    case 'screenshot':
      config.selector = ''
      config.fullPage = false
      break
  }
  
  return {
    type: typeMap[step.type] || 'delay',
    label: labelMap[step.type] || '操作',
    config
  }
}

onMounted(() => {
  loadOnlineRobots()
})

onUnmounted(() => {
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value)
  }
})
</script>

<style scoped>
.recording-preview {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  border-radius: 8px;
  border: 2px dashed #dcdfe6;
}

.recording-active {
  width: 100%;
  height: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
  border-radius: 8px;
  position: relative;
}

.recording-active::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  bottom: 4px;
  border: 2px solid #409eff;
  border-radius: 6px;
  animation: pulse-border 1.5s ease-in-out infinite;
}

@keyframes pulse-border {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.recording-content {
  text-align: center;
  color: #fff;
  z-index: 1;
}

.recording-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #f56c6c;
  border-radius: 50%;
  margin-right: 6px;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.step-card {
  transition: all 0.3s;
}

.step-card:hover {
  transform: translateX(4px);
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.step-icon-navigate {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.step-icon-click {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.step-icon-input {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
}

.step-icon-wait {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
}

.step-icon-screenshot {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
}

.step-icon-keypress {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #666;
}
</style>
