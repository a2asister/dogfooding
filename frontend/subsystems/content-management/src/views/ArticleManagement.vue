<template>
  <div class="article-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>文章管理</span>
          <el-button 
            type="primary" 
            @click="handleCreate"
            v-if="userStore.hasPermission('content:article:create')"
          >
            新建文章
          </el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" style="margin-bottom: 20px;">
        <el-form-item label="文章标题">
          <el-input v-model="searchForm.title" placeholder="请输入文章标题" clearable />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择分类" clearable>
            <el-option label="技术" value="tech" />
            <el-option label="产品" value="product" />
            <el-option label="运营" value="operation" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
            <el-option label="待审核" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="articles" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="文章标题" min-width="200" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            <el-tag :type="getCategoryTag(scope.row.category)">
              {{ getCategoryName(scope.row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="views" label="浏览量" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              link 
              @click="handleView(scope.row)"
              v-if="userStore.hasPermission('content:article:read')"
            >
              查看
            </el-button>
            <el-button 
              type="primary" 
              link 
              @click="handleEdit(scope.row)"
              v-if="userStore.hasPermission('content:article:update')"
            >
              编辑
            </el-button>
            <el-button 
              type="primary" 
              link 
              @click="handlePublish(scope.row)"
              v-if="userStore.hasPermission('content:article:publish') && scope.row.status !== 'published'"
            >
              发布
            </el-button>
            <el-button 
              type="danger" 
              link 
              @click="handleDelete(scope.row)"
              v-if="userStore.hasPermission('content:article:delete')"
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

const searchForm = ref({
  title: '',
  category: '',
  status: ''
})

const articles = ref([
  {
    id: 1,
    title: 'Vue 3 组合式 API 入门指南',
    category: 'tech',
    author: '张三',
    views: 1520,
    createTime: '2024-01-15 10:30:00',
    status: 'published'
  },
  {
    id: 2,
    title: '2024年产品规划文档',
    category: 'product',
    author: '李四',
    views: 890,
    createTime: '2024-01-14 14:20:00',
    status: 'draft'
  },
  {
    id: 3,
    title: '春节活动运营方案',
    category: 'operation',
    author: '王五',
    views: 2340,
    createTime: '2024-01-13 09:15:00',
    status: 'published'
  },
  {
    id: 4,
    title: '前端性能优化最佳实践',
    category: 'tech',
    author: '赵六',
    views: 3560,
    createTime: '2024-01-12 16:45:00',
    status: 'pending'
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(4)

const getCategoryName = (category) => {
  const categoryMap = {
    tech: '技术',
    product: '产品',
    operation: '运营'
  }
  return categoryMap[category] || category
}

const getCategoryTag = (category) => {
  const tagMap = {
    tech: 'primary',
    product: 'success',
    operation: 'warning'
  }
  return tagMap[category] || 'info'
}

const getStatusName = (status) => {
  const statusMap = {
    published: '已发布',
    draft: '草稿',
    pending: '待审核'
  }
  return statusMap[status] || status
}

const getStatusTag = (status) => {
  const tagMap = {
    published: 'success',
    draft: 'info',
    pending: 'warning'
  }
  return tagMap[status] || 'info'
}

const handleSearch = () => {
  ElMessage.success('搜索成功')
}

const handleReset = () => {
  searchForm.value = {
    title: '',
    category: '',
    status: ''
  }
  ElMessage.info('已重置搜索条件')
}

const handleCreate = () => {
  ElMessage.success('打开新建文章对话框')
}

const handleView = (row) => {
  ElMessage.info(`查看文章: ${row.title}`)
}

const handleEdit = (row) => {
  ElMessage.info(`编辑文章: ${row.title}`)
}

const handlePublish = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要发布文章 "${row.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    row.status = 'published'
    ElMessage.success('发布成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Publish error:', error)
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除文章 "${row.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const index = articles.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      articles.value.splice(index, 1)
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
.article-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
