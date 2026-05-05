<template>
  <div style="height: 100%; display: flex; flex-direction: column">
    <div style="padding: 16px 20px; border-bottom: 1px solid #ebeef5; background: #fff; display: flex; justify-content: space-between; align-items: center">
      <div style="display: flex; align-items: center; gap: 16px">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <div>
          <h2 style="margin: 0; font-size: 18px; font-weight: 600">{{ workflow?.name || '流程编辑器' }}</h2>
          <p style="margin: 4px 0 0; font-size: 12px; color: #909399">{{ workflow?.description || '拖拽左侧节点到画布进行编排' }}</p>
        </div>
      </div>
      <div style="display: flex; gap: 12px">
        <el-button @click="saveWorkflow">
          <el-icon><Document /></el-icon>
          保存
        </el-button>
        <el-button type="primary" @click="openRunDialog">
          <el-icon><VideoPlay /></el-icon>
          运行
        </el-button>
      </div>
    </div>

    <div style="flex: 1; display: flex; overflow: hidden">
      <div class="node-panel">
        <div class="node-panel-title">流程控制</div>
        <div
          v-for="node in nodeCategories.flow"
          :key="node.type"
          class="node-panel-item"
          draggable="true"
          @dragstart="onDragStart($event, node.type)"
        >
          <div class="node-icon" :style="{ background: node.color }">{{ node.icon }}</div>
          <span class="node-label">{{ node.name }}</span>
        </div>

        <div class="node-panel-title" style="margin-top: 20px">网页操作</div>
        <div
          v-for="node in nodeCategories.web"
          :key="node.type"
          class="node-panel-item"
          draggable="true"
          @dragstart="onDragStart($event, node.type)"
        >
          <div class="node-icon" :style="{ background: node.color }">{{ node.icon }}</div>
          <span class="node-label">{{ node.name }}</span>
        </div>

        <div class="node-panel-title" style="margin-top: 20px">桌面操作</div>
        <div
          v-for="node in nodeCategories.desktop"
          :key="node.type"
          class="node-panel-item"
          draggable="true"
          @dragstart="onDragStart($event, node.type)"
        >
          <div class="node-icon" :style="{ background: node.color }">{{ node.icon }}</div>
          <span class="node-label">{{ node.name }}</span>
        </div>

        <div class="node-panel-title" style="margin-top: 20px">其他操作</div>
        <div
          v-for="node in nodeCategories.other"
          :key="node.type"
          class="node-panel-item"
          draggable="true"
          @dragstart="onDragStart($event, node.type)"
        >
          <div class="node-icon" :style="{ background: node.color }">{{ node.icon }}</div>
          <span class="node-label">{{ node.name }}</span>
        </div>
      </div>

      <div class="flow-canvas" style="position: relative">
        <VueFlow
          :nodes="nodes"
          :edges="edges"
          :node-types="nodeTypes"
          :fit-view="true"
          :connect-on-click="true"
          :snap-to-grid="true"
          :snap-grid="[20, 20]"
          @connect="onConnect"
          @node-click="onNodeClick"
          @edge-click="onEdgeClick"
          @nodes-change="onNodesChange"
          @edges-change="onEdgesChange"
          @drop="onDrop"
          @dragover="onDragOver"
        >
          <Controls />
          <MiniMap />
          <Background :gap="20" />
        </VueFlow>
      </div>

      <div class="properties-panel">
        <div class="properties-panel-title">
          {{ selectedNode ? '节点属性' : '流程属性' }}
        </div>
        
        <div v-if="!selectedNode">
          <el-form label-width="80px" size="small">
            <el-form-item label="流程名称">
              <el-input v-model="formData.name" placeholder="请输入流程名称" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="2"
                placeholder="请输入描述"
              />
            </el-form-item>
            <el-form-item label="类型">
              <el-select v-model="formData.type" style="width: 100%">
                <el-option label="网页自动化" value="web" />
                <el-option label="桌面自动化" value="desktop" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="formData.status" style="width: 100%">
                <el-option label="草稿" value="draft" />
                <el-option label="激活" value="active" />
              </el-select>
            </el-form-item>
            
            <div style="padding: 12px 0; border-top: 1px solid #ebeef5; margin-top: 16px">
              <div style="font-weight: 600; color: #606266; margin-bottom: 12px">重试配置</div>
              <el-form-item label="启用重试">
                <el-switch v-model="formData.retryConfig.enabled" />
              </el-form-item>
              <el-form-item label="最大重试" v-if="formData.retryConfig.enabled">
                <el-input-number v-model="formData.retryConfig.maxRetries" :min="1" :max="10" />
              </el-form-item>
              <el-form-item label="重试间隔" v-if="formData.retryConfig.enabled">
                <el-input-number v-model="formData.retryConfig.retryDelay" :min="0" :max="60000" />
                <span style="font-size: 12px; color: #909399">ms</span>
              </el-form-item>
            </div>

            <div style="padding: 12px 0; border-top: 1px solid #ebeef5; margin-top: 16px">
              <div style="font-weight: 600; color: #606266; margin-bottom: 12px">流程变量</div>
              <div
                v-for="(value, key) in formData.variables"
                :key="key"
                style="display: flex; gap: 8px; margin-bottom: 8px"
              >
                <el-input :value="key" placeholder="变量名" size="small" style="flex: 1" disabled />
                <el-input v-model="formData.variables[key]" placeholder="变量值" size="small" style="flex: 1" />
                <el-button type="danger" text size="small" @click="deleteVariable(key)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button type="primary" text size="small" @click="addVariable">
                <el-icon><Plus /></el-icon>
                添加变量
              </el-button>
            </div>
          </el-form>
        </div>

        <div v-else>
          <div style="padding: 8px 12px; background: #f5f7fa; border-radius: 4px; margin-bottom: 16px">
            <div style="display: flex; align-items: center; gap: 8px">
              <span style="font-size: 18px">{{ getNodeInfo(selectedNode.type).icon }}</span>
              <span style="font-weight: 600">{{ getNodeInfo(selectedNode.type).name }}</span>
            </div>
          </div>
          
          <el-form label-width="80px" size="small">
            <el-form-item label="节点名称">
              <el-input v-model="selectedNodeData.label" placeholder="请输入节点名称" />
            </el-form-item>
            
            <template v-if="getNodeInfo(selectedNode.type).config">
              <div v-for="(config, key) in getNodeInfo(selectedNode.type).config" :key="key">
                <el-form-item :label="config.label">
                  <template v-if="config.type === 'text'">
                    <el-input
                      v-model="selectedNodeData.config[key]"
                      :placeholder="`请输入${config.label}`"
                    />
                  </template>
                  <template v-else-if="config.type === 'number'">
                    <el-input-number
                      v-model="selectedNodeData.config[key]"
                      :min="0"
                      :max="config.max || 999999"
                    />
                  </template>
                  <template v-else-if="config.type === 'select'">
                    <el-select v-model="selectedNodeData.config[key]" style="width: 100%">
                      <el-option
                        v-for="opt in config.options"
                        :key="opt"
                        :label="opt"
                        :value="opt"
                      />
                    </el-select>
                  </template>
                  <template v-else-if="config.type === 'boolean'">
                    <el-switch v-model="selectedNodeData.config[key]" />
                  </template>
                  <template v-else-if="config.type === 'object'">
                    <el-input
                      v-model="selectedNodeData.config[key]"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入 JSON 格式"
                    />
                  </template>
                </el-form-item>
              </div>
            </template>
          </el-form>

          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #ebeef5">
            <el-button type="danger" @click="deleteSelectedNode" style="width: 100%">
              删除节点
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="runDialogVisible"
      title="运行流程"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="runFormData" label-width="80px">
        <el-form-item label="选择机器人">
          <el-select v-model="runFormData.robotId" placeholder="请选择执行机器人" style="width: 100%">
            <el-option
              v-for="robot in availableRobots"
              :key="robot.id"
              :label="robot.name"
              :value="robot.id"
              :disabled="robot.status !== 'online'"
            >
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%">
                <span>{{ robot.name }}</span>
                <span class="status-tag">
                  <span class="status-dot" :class="robot.status"></span>
                  <span :style="{ color: robot.status === 'online' ? '#67c23a' : '#909399' }">
                    {{ robot.status === 'online' ? '在线' : '离线' }}
                  </span>
                </span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="runDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRun">开始执行</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, markRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { VueFlow, addEdge, MarkerType, applyNodeChanges, applyEdgeChanges } from '@vue-flow/core'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { Background } from '@vue-flow/background'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { ArrowLeft, Document, VideoPlay, Delete, Plus } from '@element-plus/icons-vue'
import CustomNode from '@/components/CustomNode.vue'
import { workflowsAPI, robotsAPI } from '@/api'

const route = useRoute()
const router = useRouter()

const workflow = ref(null)
const nodes = ref([])
const edges = ref([])
const selectedNode = ref(null)
const selectedNodeData = ref({ config: {} })

const runDialogVisible = ref(false)
const availableRobots = ref([])
const runFormData = reactive({
  robotId: ''
})

const formData = reactive({
  name: '',
  description: '',
  type: 'web',
  status: 'draft',
  variables: {},
  retryConfig: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 2000
  }
})

const nodeCategories = {
  flow: [
    { type: 'start', name: '开始节点', icon: '▶️', color: '#10b981' },
    { type: 'end', name: '结束节点', icon: '⏹️', color: '#ef4444' },
    { type: 'condition', name: '条件判断', icon: '🔀', color: '#f59e0b' },
    { type: 'loop', name: '循环', icon: '🔁', color: '#f59e0b' },
    { type: 'delay', name: '延迟', icon: '⏱️', color: '#6b7280' }
  ],
  web: [
    { type: 'openBrowser', name: '打开浏览器', icon: '🌐', color: '#3b82f6' },
    { type: 'navigate', name: '导航', icon: '🔗', color: '#3b82f6' },
    { type: 'click', name: '点击', icon: '👆', color: '#3b82f6' },
    { type: 'type', name: '输入', icon: '⌨️', color: '#3b82f6' },
    { type: 'wait', name: '等待', icon: '⏳', color: '#f59e0b' },
    { type: 'screenshot', name: '截图', icon: '📸', color: '#8b5cf6' },
    { type: 'select', name: '选择', icon: '☑️', color: '#3b82f6' },
    { type: 'scroll', name: '滚动', icon: '📜', color: '#3b82f6' }
  ],
  desktop: [
    { type: 'openApplication', name: '打开应用', icon: '🖥️', color: '#06b6d4' }
  ],
  other: [
    { type: 'runScript', name: '运行脚本', icon: '📜', color: '#ec4899' },
    { type: 'setVariable', name: '设置变量', icon: '📝', color: '#8b5cf6' },
    { type: 'httpRequest', name: 'HTTP请求', icon: '🌐', color: '#0ea5e9' }
  ]
}

const nodeTypesConfig = {
  start: {
    name: '开始节点',
    icon: '▶️',
    color: '#10b981',
    config: null
  },
  end: {
    name: '结束节点',
    icon: '⏹️',
    color: '#ef4444',
    config: null
  },
  openBrowser: {
    name: '打开浏览器',
    icon: '🌐',
    color: '#3b82f6',
    config: {
      browser: {
        type: 'select',
        options: ['chrome', 'firefox', 'edge', 'safari'],
        default: 'chrome',
        label: '浏览器类型'
      },
      headless: {
        type: 'boolean',
        default: false,
        label: '无头模式'
      }
    }
  },
  navigate: {
    name: '导航',
    icon: '🔗',
    color: '#3b82f6',
    config: {
      url: {
        type: 'text',
        default: 'https://',
        label: '目标 URL'
      }
    }
  },
  click: {
    name: '点击',
    icon: '👆',
    color: '#3b82f6',
    config: {
      selector: {
        type: 'text',
        default: '',
        label: 'CSS 选择器'
      },
      waitFor: {
        type: 'number',
        default: 0,
        label: '等待时间'
      }
    }
  },
  type: {
    name: '输入',
    icon: '⌨️',
    color: '#3b82f6',
    config: {
      selector: {
        type: 'text',
        default: '',
        label: 'CSS 选择器'
      },
      value: {
        type: 'text',
        default: '',
        label: '输入值'
      }
    }
  },
  wait: {
    name: '等待',
    icon: '⏳',
    color: '#f59e0b',
    config: {
      selector: {
        type: 'text',
        default: '',
        label: 'CSS 选择器'
      },
      timeout: {
        type: 'number',
        default: 10000,
        label: '超时时间'
      }
    }
  },
  condition: {
    name: '条件判断',
    icon: '🔀',
    color: '#f59e0b',
    config: {
      expression: {
        type: 'text',
        default: '',
        label: '条件表达式'
      }
    }
  },
  loop: {
    name: '循环',
    icon: '🔁',
    color: '#f59e0b',
    config: {
      type: {
        type: 'select',
        options: ['count', 'while', 'foreach'],
        default: 'count',
        label: '循环类型'
      },
      count: {
        type: 'number',
        default: 10,
        label: '循环次数'
      }
    }
  },
  delay: {
    name: '延迟',
    icon: '⏱️',
    color: '#6b7280',
    config: {
      milliseconds: {
        type: 'number',
        default: 1000,
        label: '延迟时间'
      }
    }
  },
  screenshot: {
    name: '截图',
    icon: '📸',
    color: '#8b5cf6',
    config: {
      selector: {
        type: 'text',
        default: '',
        label: 'CSS 选择器'
      },
      fullPage: {
        type: 'boolean',
        default: false,
        label: '全页面截图'
      }
    }
  },
  select: {
    name: '选择',
    icon: '☑️',
    color: '#3b82f6',
    config: {
      selector: {
        type: 'text',
        default: '',
        label: 'CSS 选择器'
      },
      value: {
        type: 'text',
        default: '',
        label: '选择值'
      }
    }
  },
  scroll: {
    name: '滚动',
    icon: '📜',
    color: '#3b82f6',
    config: {
      x: {
        type: 'number',
        default: 0,
        label: 'X 轴偏移'
      },
      y: {
        type: 'number',
        default: 500,
        label: 'Y 轴偏移'
      }
    }
  },
  openApplication: {
    name: '打开应用',
    icon: '🖥️',
    color: '#06b6d4',
    config: {
      appPath: {
        type: 'text',
        default: '',
        label: '应用路径'
      }
    }
  },
  runScript: {
    name: '运行脚本',
    icon: '📜',
    color: '#ec4899',
    config: {
      scriptId: {
        type: 'text',
        default: '',
        label: '脚本 ID'
      }
    }
  },
  setVariable: {
    name: '设置变量',
    icon: '📝',
    color: '#8b5cf6',
    config: {
      name: {
        type: 'text',
        default: '',
        label: '变量名'
      },
      value: {
        type: 'text',
        default: '',
        label: '变量值'
      }
    }
  },
  httpRequest: {
    name: 'HTTP请求',
    icon: '🌐',
    color: '#0ea5e9',
    config: {
      method: {
        type: 'select',
        options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        default: 'GET',
        label: '请求方法'
      },
      url: {
        type: 'text',
        default: '',
        label: '请求 URL'
      }
    }
  }
}

const getNodeInfo = (type) => {
  return nodeTypesConfig[type] || { name: type, icon: '⚪', color: '#909399', config: null }
}

const nodeTypes = {
  custom: markRaw(CustomNode)
}

const convertToFlowNodes = (workflowNodes) => {
  if (!workflowNodes || !workflowNodes.length) return []
  
  return workflowNodes.map(node => {
    const nodeInfo = getNodeInfo(node.type)
    return {
      id: node.id,
      type: 'custom',
      position: { x: node.x || 0, y: node.y || 0 },
      data: {
        label: node.label || nodeInfo.name,
        icon: nodeInfo.icon,
        color: nodeInfo.color,
        config: { ...node.config }
      },
      sourcePosition: 'right',
      targetPosition: 'left'
    }
  })
}

const convertToFlowEdges = (workflowEdges) => {
  if (!workflowEdges || !workflowEdges.length) return []
  
  return workflowEdges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: true,
    style: { stroke: '#409eff', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#409eff' }
  }))
}

const loadWorkflow = async () => {
  const id = route.params.id
  if (!id) return
  
  try {
    const res = await workflowsAPI.getWorkflow(id)
    workflow.value = res.data
    
    Object.assign(formData, {
      name: res.data.name,
      description: res.data.description,
      type: res.data.type,
      status: res.data.status,
      variables: res.data.variables || {},
      retryConfig: res.data.retryConfig || {
        enabled: true,
        maxRetries: 3,
        retryDelay: 2000
      }
    })
    
    nodes.value = convertToFlowNodes(res.data.nodes)
    edges.value = convertToFlowEdges(res.data.edges)
    
  } catch (error) {
    ElMessage.error('加载流程失败')
    console.error(error)
  }
}

const loadRobots = async () => {
  try {
    const res = await robotsAPI.getRobots()
    availableRobots.value = res.data
    runFormData.robotId = res.data.find(r => r.status === 'online')?.id || ''
  } catch (error) {
    console.error(error)
  }
}

const saveWorkflow = async () => {
  if (!formData.name) {
    ElMessage.warning('请输入流程名称')
    return
  }
  
  const workflowNodes = nodes.value.map(node => ({
    id: node.id,
    type: getNodeTypeFromData(node.data),
    x: node.position.x,
    y: node.position.y,
    label: node.data.label,
    config: node.data.config
  }))
  
  const workflowEdges = edges.value.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target
  }))
  
  const data = {
    name: formData.name,
    description: formData.description,
    type: formData.type,
    status: formData.status,
    nodes: workflowNodes,
    edges: workflowEdges,
    variables: formData.variables,
    retryConfig: formData.retryConfig
  }
  
  try {
    if (workflow.value) {
      await workflowsAPI.updateWorkflow(workflow.value.id, data)
    } else {
      const res = await workflowsAPI.createWorkflow(data)
      workflow.value = res.data
    }
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
    console.error(error)
  }
}

const getNodeTypeFromData = (data) => {
  for (const [type, config] of Object.entries(nodeTypesConfig)) {
    if (config.icon === data.icon) {
      return type
    }
  }
  return 'action'
}

const onConnect = (params) => {
  const newEdge = {
    id: `e${params.source}-${params.target}`,
    source: params.source,
    target: params.target,
    animated: true,
    style: { stroke: '#409eff', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#409eff' }
  }
  edges.value = addEdge(newEdge, edges.value)
}

const onNodeClick = (event, node) => {
  selectedNode.value = node
  selectedNodeData.value = {
    ...node.data,
    config: { ...node.data.config }
  }
}

const onEdgeClick = (event, edge) => {
  selectedNode.value = null
}

const onNodesChange = (changes) => {
  nodes.value = applyNodeChanges(changes, nodes.value)
}

const onEdgesChange = (changes) => {
  edges.value = applyEdgeChanges(changes, edges.value)
}

let draggedType = null

const onDragStart = (event, nodeType) => {
  draggedType = nodeType
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('application/vueflow', nodeType)
}

const onDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

const onDrop = (event) => {
  event.preventDefault()
  
  const type = draggedType || event.dataTransfer.getData('application/vueflow')
  if (!type) return
  
  const nodeInfo = getNodeInfo(type)
  const newNodeId = `node-${Date.now()}`
  
  const newNode = {
    id: newNodeId,
    type: 'custom',
    position: { x: 200, y: 200 },
    data: {
      label: nodeInfo.name,
      icon: nodeInfo.icon,
      color: nodeInfo.color,
      config: nodeInfo.config ? Object.entries(nodeInfo.config).reduce((acc, [key, val]) => {
        acc[key] = val.default
        return acc
      }, {}) : {}
    },
    sourcePosition: 'right',
    targetPosition: 'left'
  }
  
  nodes.value = [...nodes.value, newNode]
  draggedType = null
}

const deleteSelectedNode = () => {
  if (!selectedNode.value) return
  
  nodes.value = nodes.value.filter(n => n.id !== selectedNode.value.id)
  edges.value = edges.value.filter(
    e => e.source !== selectedNode.value.id && e.target !== selectedNode.value.id
  )
  selectedNode.value = null
}

const addVariable = () => {
  const key = `var${Object.keys(formData.variables).length + 1}`
  formData.variables[key] = ''
}

const deleteVariable = (key) => {
  const { [key]: _, ...rest } = formData.variables
  formData.variables = rest
}

const openRunDialog = () => {
  runDialogVisible.value = true
}

const confirmRun = async () => {
  if (!runFormData.robotId) {
    ElMessage.warning('请选择执行机器人')
    return
  }
  
  try {
    await workflowsAPI.runWorkflow(workflow.value.id, {
      robotId: runFormData.robotId
    })
    ElMessage.success('流程已开始执行')
    runDialogVisible.value = false
    router.push('/executions')
  } catch (error) {
    ElMessage.error('执行流程失败')
    console.error(error)
  }
}

onMounted(() => {
  loadWorkflow()
  loadRobots()
})
</script>

<style scoped>
.node-panel {
  width: 220px;
  background: #fff;
  border-right: 1px solid #ebeef5;
  padding: 16px;
  overflow-y: auto;
}

.node-panel-title {
  font-size: 13px;
  font-weight: 600;
  color: #909399;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.node-panel-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.node-panel-item:hover {
  background: #f5f7fa;
}

.node-panel-item:active {
  cursor: grabbing;
}

.node-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.node-label {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.flow-canvas {
  flex: 1;
  background: #fafbfc;
}

.properties-panel {
  width: 300px;
  background: #fff;
  border-left: 1px solid #ebeef5;
  padding: 16px;
  overflow-y: auto;
}

.properties-panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}
</style>
