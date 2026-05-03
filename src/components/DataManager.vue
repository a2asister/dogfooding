<template>
  <div class="data-manager">
    <div class="manager-header" v-if="currentDb && currentStore">
      <div class="path-info">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">
            <el-icon><Database /></el-icon>
            数据库
          </el-breadcrumb-item>
          <el-breadcrumb-item>{{ currentDb }}</el-breadcrumb-item>
          <el-breadcrumb-item>
            <el-icon><Document /></el-icon>
            {{ currentStore }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="actions">
        <el-button-group>
          <el-button type="primary" size="small" @click="handleAddData">
            <el-icon><Plus /></el-icon>
            新增数据
          </el-button>
          <el-button type="success" size="small" @click="handleImport">
            <el-icon><Upload /></el-icon>
            导入
          </el-button>
          <el-button type="warning" size="small" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button type="info" size="small" @click="handleManageIndexes">
            <el-icon><Collection /></el-icon>
            索引管理
          </el-button>
          <el-button type="danger" size="small" @click="handleDeleteStore">
            <el-icon><Delete /></el-icon>
            删除表
          </el-button>
        </el-button-group>
      </div>
    </div>

    <div class="create-store-section" v-if="currentDb && !currentStore">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>创建新表</span>
          </div>
        </template>
        <el-form :model="createStoreForm" label-width="120px">
          <el-form-item label="表名" required>
            <el-input v-model="createStoreForm.name" placeholder="请输入表名" />
          </el-form-item>
          <el-form-item label="主键路径">
            <el-input v-model="createStoreForm.keyPath" placeholder="例如: id 或留空使用自增" />
          </el-form-item>
          <el-form-item label="自增主键">
            <el-switch v-model="createStoreForm.autoIncrement" />
          </el-form-item>
          <el-form-item label="索引">
            <div class="indexes-list">
              <div
                v-for="(index, idx) in createStoreForm.indexes"
                :key="idx"
                class="index-item"
              >
                <el-input
                  v-model="index.name"
                  placeholder="索引名"
                  style="width: 150px"
                  size="small"
                />
                <el-input
                  v-model="index.keyPath"
                  placeholder="字段路径"
                  style="width: 150px"
                  size="small"
                />
                <el-checkbox v-model="index.unique" size="small">唯一</el-checkbox>
                <el-checkbox v-model="index.multiEntry" size="small">多值</el-checkbox>
                <el-button type="danger" text size="small" @click="removeIndex(idx)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button type="primary" text @click="addIndex">
                <el-icon><Plus /></el-icon>
                添加索引
              </el-button>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="confirmCreateStore">创建表</el-button>
            <el-button @click="createStoreForm = defaultCreateStoreForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="manager-content" v-else-if="currentDb && currentStore">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="数据浏览" name="data">
          <div class="data-section">
            <div class="data-actions">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索数据..."
                style="width: 300px"
                clearable
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              >
                <template #append>
                  <el-button @click="handleSearch">
                    <el-icon><Search /></el-icon>
                  </el-button>
                </template>
              </el-input>
              <el-button @click="refreshData">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
              <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
                <el-icon><Delete /></el-icon>
                批量删除 ({{ selectedRows.length }})
              </el-button>
            </div>
            
            <el-table
              :data="tableData"
              style="width: 100%"
              border
              @selection-change="handleSelectionChange"
              v-loading="loading"
              max-height="calc(100vh - 280px)"
            >
              <el-table-column type="selection" width="50" />
              <el-table-column
                v-for="column in columns"
                :key="column"
                :prop="column"
                :label="column"
                min-width="150"
                show-overflow-tooltip
              >
                <template #default="{ row }">
                  <div class="cell-content">
                    {{ formatCellValue(row[column]) }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row, $index }">
                  <el-button type="primary" text size="small" @click="handleEditData(row, $index)">
                    编辑
                  </el-button>
                  <el-button type="danger" text size="small" @click="handleDeleteData(row, $index)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              style="margin-top: 16px; justify-content: flex-end"
            />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="表结构" name="structure">
          <div class="structure-section">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>表信息</span>
                </div>
              </template>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="表名">{{ currentStore }}</el-descriptions-item>
                <el-descriptions-item label="主键路径">{{ (storeInfo && storeInfo.keyPath) || '无' }}</el-descriptions-item>
                <el-descriptions-item label="自增主键">{{ (storeInfo && storeInfo.autoIncrement) ? '是' : '否' }}</el-descriptions-item>
                <el-descriptions-item label="数据条数">{{ pagination.total }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
            
            <el-card style="margin-top: 20px">
              <template #header>
                <div class="card-header">
                  <span>索引列表</span>
                  <el-button type="primary" size="small" @click="handleManageIndexes">
                    <el-icon><Plus /></el-icon>
                    管理索引
                  </el-button>
                </div>
              </template>
              <el-table :data="(storeInfo && storeInfo.indexes) || []" style="width: 100%" border>
                <el-table-column prop="name" label="索引名" />
                <el-table-column prop="keyPath" label="字段路径">
                  <template #default="{ row }">
                    {{ Array.isArray(row.keyPath) ? row.keyPath.join(', ') : row.keyPath }}
                  </template>
                </el-table-column>
                <el-table-column prop="unique" label="唯一约束" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.unique ? 'success' : 'info'">
                      {{ row.unique ? '是' : '否' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="multiEntry" label="多值索引" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.multiEntry ? 'success' : 'info'">
                      {{ row.multiEntry ? '是' : '否' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="welcome-section" v-else>
      <el-empty description="请从左侧选择一个数据库表" :image-size="120">
        <template #image>
          <el-icon size="120" color="#909399"><DocumentAdd /></el-icon>
        </template>
      </el-empty>
    </div>

    <el-dialog
      v-model="dataDialogVisible"
      :title="isEditMode ? '编辑数据' : '新增数据'"
      width="600px"
    >
      <el-form
        ref="dataFormRef"
        :model="dataForm"
        label-width="100px"
        v-loading="dataFormLoading"
      >
        <template v-if="isEditMode">
          <el-descriptions :column="1" border v-if="originalData">
            <el-descriptions-item
              v-for="(value, key) in originalData"
              :key="key"
              :label="key"
            >
              <div class="edit-field">
                <el-input
                  v-if="typeof value === 'string'"
                  v-model="dataForm[key]"
                  :placeholder="`请输入 ${key}`"
                />
                <el-input-number
                  v-else-if="typeof value === 'number'"
                  v-model="dataForm[key]"
                  :placeholder="`请输入 ${key}`"
                  style="width: 100%"
                />
                <el-switch
                  v-else-if="typeof value === 'boolean'"
                  v-model="dataForm[key]"
                />
                <el-input
                  v-else
                  v-model="dataForm[key]"
                  type="textarea"
                  :rows="3"
                  placeholder="JSON 格式"
                />
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </template>
        <template v-else>
          <el-alert
            title="请输入 JSON 格式的数据"
            type="info"
            :closable="false"
            style="margin-bottom: 16px"
          />
          <el-form-item label="数据内容" required>
            <el-input
              v-model="newDataJson"
              type="textarea"
              :rows="10"
              placeholder='例如:
{
  "id": 1,
  "name": "测试数据",
  "age": 25
}'
            />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="dataDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDataSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="indexDialogVisible"
      title="索引管理"
      width="600px"
    >
      <div class="index-management">
        <h4>当前索引</h4>
        <el-table :data="(storeInfo && storeInfo.indexes) || []" style="width: 100%" border size="small">
          <el-table-column prop="name" label="索引名" />
          <el-table-column prop="keyPath" label="字段路径">
            <template #default="{ row }">
              {{ Array.isArray(row.keyPath) ? row.keyPath.join(', ') : row.keyPath }}
            </template>
          </el-table-column>
          <el-table-column prop="unique" label="唯一" width="80">
            <template #default="{ row }">
              {{ row.unique ? '是' : '否' }}
            </template>
          </el-table-column>
          <el-table-column prop="multiEntry" label="多值" width="80">
            <template #default="{ row }">
              {{ row.multiEntry ? '是' : '否' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button
                type="danger"
                text
                size="small"
                @click="handleDeleteIndex(row.name)"
                :disabled="storeInfo && row.name === storeInfo.keyPath"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <h4 style="margin-top: 20px">添加新索引</h4>
        <el-form :model="newIndexForm" label-width="100px">
          <el-form-item label="索引名" required>
            <el-input v-model="newIndexForm.name" placeholder="请输入索引名" />
          </el-form-item>
          <el-form-item label="字段路径" required>
            <el-input v-model="newIndexForm.keyPath" placeholder="例如: name 或 user.name" />
          </el-form-item>
          <el-form-item label="唯一约束">
            <el-switch v-model="newIndexForm.unique" />
          </el-form-item>
          <el-form-item label="多值索引">
            <el-switch v-model="newIndexForm.multiEntry" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleAddIndex">添加索引</el-button>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="indexDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type UploadFile } from 'element-plus'
import indexedDB, { type StoreInfo, type IndexInfo } from '../utils/indexedDB'

const props = defineProps<{
  currentDb: string
  currentStore: string
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'deleteStore'): void
}>()

const activeTab = ref('data')
const loading = ref(false)
const tableData = ref<any[]>([])
const columns = ref<string[]>([])
const selectedRows = ref<any[]>([])
const searchKeyword = ref('')
const storeInfo = ref<StoreInfo | null>(null)

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const dataDialogVisible = ref(false)
const isEditMode = ref(false)
const dataFormRef = ref<FormInstance>()
const dataForm = ref<any>({})
const originalData = ref<any>(null)
const editIndex = ref(-1)
const newDataJson = ref('')
const dataFormLoading = ref(false)

const indexDialogVisible = ref(false)
const newIndexForm = reactive({
  name: '',
  keyPath: '',
  unique: false,
  multiEntry: false
})

const createStoreForm = reactive({
  name: '',
  keyPath: '',
  autoIncrement: true,
  indexes: [] as IndexForm[]
})

interface IndexForm {
  name: string
  keyPath: string
  unique: boolean
  multiEntry: boolean
}

const defaultCreateStoreForm = {
  name: '',
  keyPath: '',
  autoIncrement: true,
  indexes: [] as IndexForm[]
}

const loadStoreData = async () => {
  if (!props.currentDb || !props.currentStore) return
  
  loading.value = true
  try {
    await indexedDB.connect(props.currentDb)
    
    const total = await indexedDB.count(props.currentStore)
    pagination.total = total
    
    const options = {
      limit: pagination.pageSize,
      offset: (pagination.currentPage - 1) * pagination.pageSize
    }
    
    const data = await indexedDB.getAll(props.currentStore, options)
    tableData.value = data
    
    if (data.length > 0) {
      const allKeys = new Set<string>()
      data.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key))
      })
      columns.value = Array.from(allKeys)
    } else {
      columns.value = []
    }
    
    const dbList = await indexedDB.getDatabaseList()
    const currentDbInfo = dbList.find(db => db.name === props.currentDb)
    storeInfo.value = currentDbInfo?.stores.find(s => s.name === props.currentStore) || null
    
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadStoreData()
}

const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  loadStoreData()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  loadStoreData()
}

const handleSearch = () => {
  if (!searchKeyword.value) {
    loadStoreData()
    return
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  const filtered = tableData.value.filter(item => {
    return Object.values(item).some(val => {
      return String(val).toLowerCase().includes(keyword)
    })
  })
  tableData.value = filtered
}

const handleAddData = () => {
  isEditMode.value = false
  newDataJson.value = ''
  dataDialogVisible.value = true
}

const handleEditData = (row: any, index: number) => {
  isEditMode.value = true
  originalData.value = JSON.parse(JSON.stringify(row))
  dataForm.value = JSON.parse(JSON.stringify(row))
  editIndex.value = index
  dataDialogVisible.value = true
}

const confirmDataSave = async () => {
  try {
    if (isEditMode.value) {
      await indexedDB.update(props.currentStore, dataForm.value)
      ElMessage.success('更新成功')
    } else {
      let data: any
      try {
        data = JSON.parse(newDataJson.value)
      } catch {
        ElMessage.error('JSON 格式错误')
        return
      }
      
      if (Array.isArray(data)) {
        await indexedDB.addMany(props.currentStore, data)
        ElMessage.success(`批量添加 ${data.length} 条数据成功`)
      } else {
        await indexedDB.add(props.currentStore, data)
        ElMessage.success('添加成功')
      }
    }
    
    dataDialogVisible.value = false
    loadStoreData()
  } catch (error) {
    console.error('保存数据失败:', error)
    ElMessage.error('保存数据失败')
  }
}

const handleDeleteData = async (row: any, index: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条数据吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    let key: IDBValidKey
    if (storeInfo.value?.keyPath) {
      const keyPath = storeInfo.value.keyPath
      if (Array.isArray(keyPath)) {
        key = keyPath.map(kp => row[kp])
      } else {
        key = row[keyPath]
      }
    } else {
      key = index
    }
    
    await indexedDB.delete(props.currentStore, key)
    ElMessage.success('删除成功')
    loadStoreData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除数据失败:', error)
      ElMessage.error('删除数据失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的数据')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条数据吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    for (const row of selectedRows.value) {
      let key: IDBValidKey
      if (storeInfo.value?.keyPath) {
        const keyPath = storeInfo.value.keyPath
        if (Array.isArray(keyPath)) {
          key = keyPath.map(kp => row[kp])
        } else {
          key = row[keyPath]
        }
      } else {
        const index = tableData.value.indexOf(row)
        key = index
      }
      
      await indexedDB.delete(props.currentStore, key)
    }
    
    ElMessage.success('批量删除成功')
    loadStoreData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

const handleDeleteStore = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除表 "${props.currentStore}" 吗？所有数据将被删除！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await indexedDB.deleteStore(props.currentStore)
    ElMessage.success('表删除成功')
    emit('deleteStore')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除表失败:', error)
      ElMessage.error(error.message || '删除表失败')
    }
  }
}

const handleManageIndexes = () => {
  newIndexForm.name = ''
  newIndexForm.keyPath = ''
  newIndexForm.unique = false
  newIndexForm.multiEntry = false
  indexDialogVisible.value = true
}

const handleAddIndex = async () => {
  if (!newIndexForm.name.trim() || !newIndexForm.keyPath.trim()) {
    ElMessage.warning('请输入索引名和字段路径')
    return
  }
  
  try {
    await indexedDB.createIndex(props.currentStore, {
      name: newIndexForm.name.trim(),
      keyPath: newIndexForm.keyPath.trim(),
      unique: newIndexForm.unique,
      multiEntry: newIndexForm.multiEntry
    })
    
    ElMessage.success('索引创建成功')
    loadStoreData()
    emit('refresh')
    
    newIndexForm.name = ''
    newIndexForm.keyPath = ''
    newIndexForm.unique = false
    newIndexForm.multiEntry = false
  } catch (error) {
    console.error('创建索引失败:', error)
    ElMessage.error(error instanceof Error ? error.message : '创建索引失败')
  }
}

const handleDeleteIndex = async (indexName: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除索引 "${indexName}" 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await indexedDB.deleteIndex(props.currentStore, indexName)
    ElMessage.success('索引删除成功')
    loadStoreData()
    emit('refresh')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除索引失败:', error)
      ElMessage.error(error.message || '删除索引失败')
    }
  }
}

const handleImport = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.onchange = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string
        
        await ElMessageBox.confirm(
          '导入数据将覆盖或追加到当前表中，是否继续？',
          '确认导入',
          {
            confirmButtonText: '追加',
            cancelButtonText: '取消',
            type: 'info'
          }
        )
        
        const count = await indexedDB.importStore(props.currentStore, content, false)
        ElMessage.success(`成功导入 ${count} 条数据`)
        loadStoreData()
      } catch (error: any) {
        if (error !== 'cancel') {
          console.error('导入失败:', error)
          ElMessage.error('导入失败：' + (error.message || '数据格式错误'))
        }
      }
    }
    reader.readAsText(file)
  }
  
  input.click()
}

const handleExport = async () => {
  try {
    const data = await indexedDB.exportStore(props.currentStore)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${props.currentStore}_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

const addIndex = () => {
  createStoreForm.indexes.push({
    name: '',
    keyPath: '',
    unique: false,
    multiEntry: false
  })
}

const removeIndex = (idx: number) => {
  createStoreForm.indexes.splice(idx, 1)
}

const confirmCreateStore = async () => {
  if (!createStoreForm.name.trim()) {
    ElMessage.warning('请输入表名')
    return
  }
  
  try {
    await indexedDB.connect(props.currentDb)
    
    const storeInfo: any = {
      name: createStoreForm.name.trim(),
      keyPath: createStoreForm.keyPath.trim() || undefined,
      autoIncrement: createStoreForm.autoIncrement,
      indexes: createStoreForm.indexes.filter(idx => idx.name.trim() && idx.keyPath.trim())
    }
    
    await indexedDB.createStore(storeInfo)
    ElMessage.success('表创建成功')
    
    createStoreForm.name = ''
    createStoreForm.keyPath = ''
    createStoreForm.autoIncrement = true
    createStoreForm.indexes = []
    
    emit('refresh')
  } catch (error) {
    console.error('创建表失败:', error)
    ElMessage.error(error instanceof Error ? error.message : '创建表失败')
  }
}

const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '-'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

watch([() => props.currentDb, () => props.currentStore], () => {
  if (props.currentDb && props.currentStore) {
    pagination.currentPage = 1
    loadStoreData()
  }
}, { immediate: true })
</script>

<style scoped>
.data-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.manager-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.path-info {
  display: flex;
  align-items: center;
}

.manager-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.create-store-section {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.indexes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.index-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.welcome-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.data-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.cell-content {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-field {
  width: 100%;
}

.index-management h4 {
  margin-bottom: 12px;
  color: #303133;
}

:deep(.el-tabs__content) {
  height: calc(100% - 40px);
  overflow: auto;
}

:deep(.el-tab-pane) {
  height: 100%;
}

.data-section,
.structure-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.data-section > .el-table {
  flex: 1;
}
</style>