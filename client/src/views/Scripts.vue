<template>
  <div>
    <div class="toolbar">
      <h2 style="margin: 0; font-size: 20px; font-weight: 600">自定义脚本</h2>
      <div class="toolbar-right">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新建脚本
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="8" v-for="script in scripts" :key="script.id">
        <el-card class="page-card" shadow="hover" style="margin-bottom: 20px">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <div style="display: flex; align-items: center; gap: 10px">
                <div
                  :style="{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: script.language === 'javascript' 
                      ? 'linear-gradient(135deg, #f7df1e 0%, #f0db4f 100%)'
                      : 'linear-gradient(135deg, #306998 0%, #ffd43b 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18
                  }"
                >
                  {{ script.language === 'javascript' ? 'JS' : 'Py' }}
                </div>
                <div>
                  <div style="font-weight: 600; color: #303133">{{ script.name }}</div>
                  <div style="font-size: 12px; color: #909399">{{ script.description || '暂无描述' }}</div>
                </div>
              </div>
            </div>
          </template>
          
          <div style="display: flex; gap: 8px; margin-bottom: 12px">
            <el-tag :type="script.language === 'javascript' ? 'warning' : 'info'" size="small">
              {{ script.language === 'javascript' ? 'JavaScript' : 'Python' }}
            </el-tag>
            <el-tag size="small">{{ script.usedBy?.length || 0 }} 处使用</el-tag>
          </div>
          
          <el-input
            type="textarea"
            :rows="4"
            :model-value="script.code"
            readonly
            style="font-family: 'Fira Code', monospace; font-size: 12px; background: #f5f7fa"
          />
          
          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px">
            <el-button type="primary" link size="small" @click="editScript(script)">
              编辑
            </el-button>
            <el-button type="success" link size="small" @click="executeScript(script)">
              执行
            </el-button>
            <el-button type="danger" link size="small" @click="deleteScript(script)">
              删除
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="dialogVisible"
      :title="editingScript ? '编辑脚本' : '新建脚本'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="脚本名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入脚本名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入脚本描述"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="语言">
          <el-radio-group v-model="formData.language">
            <el-radio value="javascript">JavaScript</el-radio>
            <el-radio value="python">Python</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="脚本代码">
          <div class="editor-container">
            <VueMonacoEditor
              v-model="formData.code"
              :language="formData.language === 'javascript' ? 'javascript' : 'python'"
              :theme="'vs'"
              :options="editorOptions"
              style="width: 100%; height: 100%"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="executeDialogVisible"
      title="执行脚本"
      width="600px"
      :close-on-click-modal="false"
    >
      <div style="margin-bottom: 16px">
        <div style="font-weight: 600; margin-bottom: 8px">脚本: {{ currentScript?.name }}</div>
        <div style="color: #909399; font-size: 13px">{{ currentScript?.description }}</div>
      </div>
      
      <div v-if="executeResult" style="margin-bottom: 16px">
        <div style="font-weight: 600; margin-bottom: 8px">执行结果:</div>
        <el-input
          type="textarea"
          :rows="8"
          :model-value="JSON.stringify(executeResult, null, 2)"
          readonly
          style="font-family: 'Fira Code', monospace; font-size: 12px; background: #f5f7fa"
        />
      </div>
      
      <template #footer>
        <el-button @click="executeDialogVisible = false">关闭</el-button>
        <el-button type="primary" :loading="executing" @click="confirmExecute">执行</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import { scriptsAPI } from '@/api'

const scripts = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingScript = ref(null)
const formRef = ref(null)

const formData = reactive({
  name: '',
  description: '',
  language: 'javascript',
  code: `function main(params) {
  console.log('Hello RPA!');
  return { success: true };
}`
})

const rules = {
  name: [{ required: true, message: '请输入脚本名称', trigger: 'blur' }]
}

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: 'on',
  automaticLayout: true,
  wordWrap: 'on'
}

const executeDialogVisible = ref(false)
const currentScript = ref(null)
const executing = ref(false)
const executeResult = ref(null)

const loadScripts = async () => {
  loading.value = true
  try {
    const res = await scriptsAPI.getScripts()
    scripts.value = res.data
  } catch (error) {
    ElMessage.error('加载脚本列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingScript.value = null
  Object.assign(formData, {
    name: '',
    description: '',
    language: 'javascript',
    code: `function main(params) {
  console.log('Hello RPA!');
  return { success: true };
}`
  })
  dialogVisible.value = true
}

const editScript = (script) => {
  editingScript.value = script
  Object.assign(formData, {
    name: script.name,
    description: script.description,
    language: script.language,
    code: script.code
  })
  dialogVisible.value = true
}

const deleteScript = async (script) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除脚本 "${script.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await scriptsAPI.deleteScript(script.id)
    ElMessage.success('删除成功')
    loadScripts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

const executeScript = (script) => {
  currentScript.value = script
  executeResult.value = null
  executeDialogVisible.value = true
}

const confirmExecute = async () => {
  if (!currentScript.value) return
  
  executing.value = true
  try {
    const res = await scriptsAPI.executeScript(currentScript.value.id, {})
    executeResult.value = res.data
    ElMessage.success('执行成功')
  } catch (error) {
    ElMessage.error('执行失败')
    console.error(error)
  } finally {
    executing.value = false
  }
}

const submitForm = async () => {
  try {
    await formRef.value.validate()
    
    if (editingScript.value) {
      await scriptsAPI.updateScript(editingScript.value.id, formData)
      ElMessage.success('更新成功')
    } else {
      await scriptsAPI.createScript(formData)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    loadScripts()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(editingScript.value ? '更新失败' : '创建失败')
      console.error(error)
    }
  }
}

onMounted(() => {
  loadScripts()
})
</script>
