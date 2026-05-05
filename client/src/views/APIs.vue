<template>
  <div>
    <div class="toolbar">
      <h2 style="margin: 0; font-size: 20px; font-weight: 600">接口自动化测试</h2>
      <div class="toolbar-right">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新建接口测试
        </el-button>
      </div>
    </div>

    <el-card class="page-card">
      <el-table :data="apis" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="接口名称" min-width="200">
          <template #default="{ row }">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px">
                <el-tag
                  :type="getMethodType(row.method)"
                  size="small"
                  effect="dark"
                >
                  {{ row.method }}
                </el-tag>
                <span style="font-weight: 500; color: #303133">{{ row.name }}</span>
              </div>
              <div style="font-size: 12px; color: #909399; font-family: monospace">
                {{ row.url }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.lastRunStatus" :type="getRunStatusType(row.lastRunStatus)" size="small">
              {{ row.lastRunStatus === 'success' ? '成功' : '失败' }}
            </el-tag>
            <span v-else style="color: #c0c4cc">-</span>
          </template>
        </el-table-column>
        <el-table-column label="上次执行" width="180">
          <template #default="{ row }">
            {{ formatTime(row.lastRunAt) }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editAPI(row)">
              编辑
            </el-button>
            <el-button type="success" link size="small" @click="runAPI(row)">
              执行
            </el-button>
            <el-button type="danger" link size="small" @click="deleteAPI(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingAPI ? '编辑接口测试' : '新建接口测试'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="接口名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入接口名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="请求方法" prop="method">
              <el-select v-model="formData.method" style="width: 100%">
                <el-option label="GET" value="GET" />
                <el-option label="POST" value="POST" />
                <el-option label="PUT" value="PUT" />
                <el-option label="DELETE" value="DELETE" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="请求 URL" prop="url">
          <el-input v-model="formData.url" placeholder="https://api.example.com/endpoint" />
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入接口描述"
            :rows="2"
          />
        </el-form-item>

        <el-divider content-position="left">请求配置</el-divider>
        
        <el-form-item label="请求头">
          <el-tag
            v-for="(header, index) in formData.headers"
            :key="index"
            closable
            @close="removeHeader(index)"
            style="margin-right: 8px; margin-bottom: 8px"
          >
            {{ header.key }}: {{ header.value }}
          </el-tag>
          <el-button type="primary" link size="small" @click="addHeader">
            + 添加请求头
          </el-button>
        </el-form-item>
        
        <el-form-item label="请求体">
          <div class="editor-container">
            <VueMonacoEditor
              v-model="formData.body"
              language="json"
              :theme="'vs'"
              :options="editorOptions"
              style="width: 100%; height: 100%"
            />
          </div>
        </el-form-item>

        <el-divider content-position="left">断言规则</el-divider>
        
        <el-form-item label="断言规则">
          <el-table
            :data="formData.assertions"
            size="small"
            style="width: 100%"
          >
            <el-table-column label="类型" width="120">
              <template #default="{ row }">
                <el-select v-model="row.type" size="small" style="width: 100%">
                  <el-option label="状态码" value="statusCode" />
                  <el-option label="响应时间" value="responseTime" />
                  <el-option label="响应内容" value="responseBody" />
                  <el-option label="响应头" value="responseHeader" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="条件" width="120">
              <template #default="{ row }">
                <el-select v-model="row.operator" size="small" style="width: 100%">
                  <el-option label="等于" value="eq" />
                  <el-option label="不等于" value="ne" />
                  <el-option label="大于" value="gt" />
                  <el-option label="小于" value="lt" />
                  <el-option label="包含" value="contains" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="目标值">
              <template #default="{ row }">
                <el-input v-model="row.expectedValue" size="small" placeholder="期望值" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row, $index }">
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="removeAssertion($index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" link size="small" @click="addAssertion" style="margin-top: 8px">
            + 添加断言
          </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="resultDialogVisible"
      title="执行结果"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border style="margin-bottom: 16px">
        <el-descriptions-item label="接口名称">{{ currentAPI?.name }}</el-descriptions-item>
        <el-descriptions-item label="请求方法">
          <el-tag :type="getMethodType(currentAPI?.method)" size="small">
            {{ currentAPI?.method }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态码">
          <span :style="{ color: testResult?.statusCode < 300 ? '#67c23a' : '#f56c6c' }">
            {{ testResult?.statusCode }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="响应时间">{{ testResult?.responseTime }}ms</el-descriptions-item>
      </el-descriptions>
      
      <div style="margin-bottom: 16px">
        <div style="font-weight: 600; margin-bottom: 8px">断言结果:</div>
        <el-table :data="testResult?.assertionResults || []" size="small">
          <el-table-column label="断言" min-width="200">
            <template #default="{ row }">
              {{ formatAssertion(row.assertion) }}
            </template>
          </el-table-column>
          <el-table-column label="结果" width="100">
            <template #default="{ row }">
              <el-tag :type="row.passed ? 'success' : 'danger'" size="small">
                {{ row.passed ? '通过' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="实际值">
            <template #default="{ row }">
              {{ JSON.stringify(row.actualValue) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div>
        <div style="font-weight: 600; margin-bottom: 8px">响应内容:</div>
        <div class="editor-container" style="height: 200px">
          <VueMonacoEditor
            :model-value="JSON.stringify(testResult?.responseBody, null, 2)"
            language="json"
            :theme="'vs'"
            :options="{ ...editorOptions, readOnly: true }"
            style="width: 100%; height: 100%"
          />
        </div>
      </div>
      
      <template #footer>
        <el-button @click="resultDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import dayjs from 'dayjs'
import { apisAPI } from '@/api'

const apis = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingAPI = ref(null)
const formRef = ref(null)

const formData = reactive({
  name: '',
  description: '',
  method: 'GET',
  url: '',
  headers: [],
  body: '{}',
  assertions: []
})

const rules = {
  name: [{ required: true, message: '请输入接口名称', trigger: 'blur' }],
  url: [{ required: true, message: '请输入请求 URL', trigger: 'blur' }]
}

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: 'on',
  automaticLayout: true,
  wordWrap: 'on'
}

const resultDialogVisible = ref(false)
const currentAPI = ref(null)
const testResult = ref(null)
const executing = ref(false)

const formatTime = (time) => {
  if (!time) return '-'
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

const getMethodType = (method) => {
  const typeMap = {
    'GET': 'success',
    'POST': 'primary',
    'PUT': 'warning',
    'DELETE': 'danger'
  }
  return typeMap[method] || 'info'
}

const getRunStatusType = (status) => {
  return status === 'success' ? 'success' : 'danger'
}

const formatAssertion = (assertion) => {
  const typeMap = {
    statusCode: '状态码',
    responseTime: '响应时间',
    responseBody: '响应内容',
    responseHeader: '响应头'
  }
  const operatorMap = {
    eq: '等于',
    ne: '不等于',
    gt: '大于',
    lt: '小于',
    contains: '包含'
  }
  return `${typeMap[assertion.type]} ${operatorMap[assertion.operator]} ${assertion.expectedValue}`
}

const loadAPIs = async () => {
  loading.value = true
  try {
    const res = await apisAPI.getAPIs()
    apis.value = res.data
  } catch (error) {
    ElMessage.error('加载接口列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingAPI.value = null
  Object.assign(formData, {
    name: '',
    description: '',
    method: 'GET',
    url: '',
    headers: [],
    body: '{}',
    assertions: []
  })
  dialogVisible.value = true
}

const editAPI = (api) => {
  editingAPI.value = api
  Object.assign(formData, {
    name: api.name,
    description: api.description,
    method: api.method,
    url: api.url,
    headers: [...(api.headers || [])],
    body: api.body || '{}',
    assertions: [...(api.assertions || [])]
  })
  dialogVisible.value = true
}

const deleteAPI = async (api) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除接口测试 "${api.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await apisAPI.deleteAPI(api.id)
    ElMessage.success('删除成功')
    loadAPIs()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

const runAPI = async (api) => {
  currentAPI.value = api
  testResult.value = null
  resultDialogVisible.value = true
  
  executing.value = true
  try {
    const res = await apisAPI.executeAPI(api.id)
    testResult.value = res.data
  } catch (error) {
    ElMessage.error('执行失败')
    console.error(error)
  } finally {
    executing.value = false
  }
}

const addHeader = () => {
  formData.headers.push({ key: '', value: '' })
}

const removeHeader = (index) => {
  formData.headers.splice(index, 1)
}

const addAssertion = () => {
  formData.assertions.push({
    type: 'statusCode',
    operator: 'eq',
    expectedValue: '200'
  })
}

const removeAssertion = (index) => {
  formData.assertions.splice(index, 1)
}

const submitForm = async () => {
  try {
    await formRef.value.validate()
    
    const data = { ...formData }
    try {
      data.body = JSON.parse(formData.body)
    } catch (e) {
      // 保持原样
    }
    
    if (editingAPI.value) {
      await apisAPI.updateAPI(editingAPI.value.id, data)
      ElMessage.success('更新成功')
    } else {
      await apisAPI.createAPI(data)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    loadAPIs()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(editingAPI.value ? '更新失败' : '创建失败')
      console.error(error)
    }
  }
}

onMounted(() => {
  loadAPIs()
})
</script>
