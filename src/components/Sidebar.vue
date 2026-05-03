<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h3>
        <el-icon><Database /></el-icon>
        IndexedDB 管理
      </h3>
      <el-button type="primary" size="small" @click="handleCreateDatabase">
        <el-icon><Plus /></el-icon>
        新建数据库
      </el-button>
    </div>
    
    <div class="sidebar-content">
      <div class="database-list" v-if="databases.length > 0">
        <div
          v-for="db in databases"
          :key="db.name"
          class="database-item"
          :class="{ 'is-active': currentDb === db.name }"
        >
          <div class="database-header" @click="toggleDatabase(db)">
            <el-icon class="expand-icon" :class="{ 'is-expanded': expandedDbs.includes(db.name) }">
              <CaretRight />
            </el-icon>
            <el-icon><FolderOpened /></el-icon>
            <span class="db-name">{{ db.name }}</span>
            <span class="db-version">v{{ db.version }}</span>
            <div class="db-actions">
              <el-tooltip content="删除数据库" placement="top">
                <el-button
                  type="danger"
                  size="small"
                  text
                  @click.stop="handleDeleteDatabase(db.name)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
          
          <div class="store-list" v-if="expandedDbs.includes(db.name)">
            <div
              class="store-item"
              :class="{ 'is-active': currentDb === db.name && currentStore === store.name }"
              v-for="store in db.stores"
              :key="store.name"
              @click="selectStore(db.name, store.name)"
            >
              <el-icon><Document /></el-icon>
              <span class="store-name">{{ store.name }}</span>
            </div>
            <div class="store-item add-store" @click="handleCreateStore(db.name)">
              <el-icon><Plus /></el-icon>
              <span class="store-name">新建表</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="empty-state" v-else>
        <el-empty description="暂无数据库">
          <el-button type="primary" @click="handleCreateDatabase">
            创建第一个数据库
          </el-button>
        </el-empty>
      </div>
    </div>
    
    <el-dialog
      v-model="createDbDialogVisible"
      title="创建数据库"
      width="400px"
    >
      <el-form :model="createDbForm" label-width="80px">
        <el-form-item label="数据库名">
          <el-input v-model="createDbForm.name" placeholder="请输入数据库名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDbDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCreateDatabase">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import indexedDB from '../utils/indexedDB'
import type { DatabaseInfo } from '../utils/indexedDB'

const emit = defineEmits<{
  (e: 'selectStore', dbName: string, storeName: string): void
  (e: 'refresh'): void
}>()

const databases = ref<DatabaseInfo[]>([])
const expandedDbs = ref<string[]>([])
const currentDb = ref<string>('')
const currentStore = ref<string>('')
const createDbDialogVisible = ref(false)
const createDbForm = reactive({
  name: ''
})

const loadDatabases = async () => {
  try {
    databases.value = await indexedDB.getDatabaseList()
  } catch (error) {
    console.error('加载数据库列表失败:', error)
    ElMessage.error('加载数据库列表失败')
  }
}

const toggleDatabase = (db: DatabaseInfo) => {
  const index = expandedDbs.value.indexOf(db.name)
  if (index > -1) {
    expandedDbs.value.splice(index, 1)
  } else {
    expandedDbs.value.push(db.name)
  }
}

const selectStore = async (dbName: string, storeName: string) => {
  currentDb.value = dbName
  currentStore.value = storeName
  emit('selectStore', dbName, storeName)
}

const handleCreateDatabase = () => {
  createDbForm.name = ''
  createDbDialogVisible.value = true
}

const confirmCreateDatabase = async () => {
  if (!createDbForm.name.trim()) {
    ElMessage.warning('请输入数据库名称')
    return
  }
  
  try {
    await indexedDB.createDatabase(createDbForm.name.trim())
    ElMessage.success('数据库创建成功')
    createDbDialogVisible.value = false
    await loadDatabases()
    emit('refresh')
  } catch (error) {
    console.error('创建数据库失败:', error)
    ElMessage.error('创建数据库失败')
  }
}

const handleDeleteDatabase = async (dbName: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除数据库 "${dbName}" 吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await indexedDB.deleteDatabase(dbName)
    ElMessage.success('数据库删除成功')
    
    if (currentDb.value === dbName) {
      currentDb.value = ''
      currentStore.value = ''
    }
    
    await loadDatabases()
    emit('refresh')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除数据库失败:', error)
      ElMessage.error(error.message || '删除数据库失败')
    }
  }
}

const handleCreateStore = (dbName: string) => {
  currentDb.value = dbName
  emit('selectStore', dbName, '')
}

onMounted(async () => {
  await loadDatabases()
})

watch(expandedDbs, async () => {
  await loadDatabases()
}, { deep: true })

defineExpose({
  loadDatabases
})
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100%;
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.database-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.database-item {
  border-radius: 4px;
  overflow: hidden;
}

.database-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;
  gap: 8px;
}

.database-header:hover {
  background-color: #e4e7ed;
}

.database-item.is-active .database-header {
  background-color: #ecf5ff;
  color: #409eff;
}

.expand-icon {
  transition: transform 0.2s;
}

.expand-icon.is-expanded {
  transform: rotate(90deg);
}

.db-name {
  flex: 1;
  font-weight: 500;
}

.db-version {
  font-size: 12px;
  color: #909399;
}

.db-actions {
  display: none;
}

.database-header:hover .db-actions {
  display: block;
}

.store-list {
  padding-left: 24px;
  padding-top: 4px;
  padding-bottom: 4px;
}

.store-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;
  gap: 8px;
}

.store-item:hover {
  background-color: #e4e7ed;
}

.store-item.is-active {
  background-color: #ecf5ff;
  color: #409eff;
}

.store-item.add-store {
  color: #909399;
}

.store-item.add-store:hover {
  color: #409eff;
  background-color: #ecf5ff;
}

.store-name {
  font-size: 14px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}
</style>