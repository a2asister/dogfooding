<template>
  <div class="category-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button 
            type="primary" 
            @click="handleCreate"
            v-if="userStore.hasPermission('content:category:create')"
          >
            新建分类
          </el-button>
        </div>
      </template>
      
      <el-table :data="categories" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" width="150" />
        <el-table-column prop="code" label="分类代码" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="articleCount" label="文章数量" width="120">
          <template #default="scope">
            <el-tag type="primary">{{ scope.row.articleCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              link 
              @click="handleEdit(scope.row)"
              v-if="userStore.hasPermission('content:category:update')"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              link 
              @click="handleDelete(scope.row)"
              v-if="userStore.hasPermission('content:category:delete')"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../store/userStore'

const userStore = useUserStore()

const categories = ref([
  {
    id: 1,
    name: '技术',
    code: 'tech',
    description: '技术相关文章，包括前端、后端、运维等技术内容',
    articleCount: 156,
    status: 'active',
    createTime: '2024-01-01 00:00:00'
  },
  {
    id: 2,
    name: '产品',
    code: 'product',
    description: '产品相关文章，包括产品设计、用户体验、产品规划等',
    articleCount: 89,
    status: 'active',
    createTime: '2024-01-02 10:30:00'
  },
  {
    id: 3,
    name: '运营',
    code: 'operation',
    description: '运营相关文章，包括活动策划、用户运营、内容运营等',
    articleCount: 123,
    status: 'active',
    createTime: '2024-01-03 14:20:00'
  },
  {
    id: 4,
    name: '设计',
    code: 'design',
    description: '设计相关文章，包括UI设计、交互设计、视觉设计等',
    articleCount: 67,
    status: 'inactive',
    createTime: '2024-01-04 09:15:00'
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(4)

const handleCreate = () => {
  ElMessage.success('打开新建分类对话框')
}

const handleEdit = (row) => {
  ElMessage.info(`编辑分类: ${row.name}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除分类 "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const index = categories.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      categories.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete error:', error)
    }
  }
}
</script>

<style scoped>
.category-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
