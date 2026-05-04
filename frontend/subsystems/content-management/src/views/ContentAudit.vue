<template>
  <div class="content-audit">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>内容审核</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="待审核" name="pending">
          <el-table :data="pendingAudits" stripe style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="文章标题" min-width="250" />
            <el-table-column prop="author" label="作者" width="120" />
            <el-table-column prop="category" label="分类" width="120">
              <template #default="scope">
                <el-tag :type="getCategoryTag(scope.row.category)">
                  {{ getCategoryName(scope.row.category) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="submitTime" label="提交时间" width="180" />
            <el-table-column label="操作" width="250" fixed="right">
              <template #default="scope">
                <el-button 
                  type="primary" 
                  link 
                  @click="handleView(scope.row)"
                  v-if="userStore.hasPermission('content:audit:read')"
                >
                  查看
                </el-button>
                <el-button 
                  type="success" 
                  link 
                  @click="handleApprove(scope.row)"
                  v-if="userStore.hasPermission('content:audit:approve')"
                >
                  通过
                </el-button>
                <el-button 
                  type="danger" 
                  link 
                  @click="handleReject(scope.row)"
                  v-if="userStore.hasPermission('content:audit:reject')"
                >
                  驳回
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="已通过" name="approved">
          <el-table :data="approvedAudits" stripe style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="文章标题" min-width="250" />
            <el-table-column prop="author" label="作者" width="120" />
            <el-table-column prop="category" label="分类" width="120">
              <template #default="scope">
                <el-tag :type="getCategoryTag(scope.row.category)">
                  {{ getCategoryName(scope.row.category) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="approveTime" label="审核时间" width="180" />
            <el-table-column prop="approver" label="审核人" width="120" />
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="已驳回" name="rejected">
          <el-table :data="rejectedAudits" stripe style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="文章标题" min-width="250" />
            <el-table-column prop="author" label="作者" width="120" />
            <el-table-column prop="category" label="分类" width="120">
              <template #default="scope">
                <el-tag :type="getCategoryTag(scope.row.category)">
                  {{ getCategoryName(scope.row.category) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="rejectTime" label="驳回时间" width="180" />
            <el-table-column prop="rejectReason" label="驳回原因" min-width="200" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../store/userStore'

const userStore = useUserStore()
const activeTab = ref('pending')

const pendingAudits = ref([
  {
    id: 1,
    title: 'Vue 3 组合式 API 深入解析',
    author: '张三',
    category: 'tech',
    submitTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    title: '2024年Q1产品 roadmap',
    author: '李四',
    category: 'product',
    submitTime: '2024-01-14 14:20:00'
  },
  {
    id: 3,
    title: '春节活动推广方案',
    author: '王五',
    category: 'operation',
    submitTime: '2024-01-13 09:15:00'
  }
])

const approvedAudits = ref([
  {
    id: 4,
    title: '前端性能优化指南',
    author: '赵六',
    category: 'tech',
    approveTime: '2024-01-12 16:45:00',
    approver: '管理员'
  },
  {
    id: 5,
    title: '用户体验设计原则',
    author: '孙七',
    category: 'product',
    approveTime: '2024-01-11 11:30:00',
    approver: '管理员'
  }
])

const rejectedAudits = ref([
  {
    id: 6,
    title: '测试文章 - 内容不符合规范',
    author: '周八',
    category: 'tech',
    rejectTime: '2024-01-10 15:20:00',
    rejectReason: '内容涉及敏感词汇，不符合平台规范'
  }
])

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

const handleView = (row) => {
  ElMessage.info(`查看文章: ${row.title}`)
}

const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要通过文章 "${row.title}" 的审核吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })
    
    const index = pendingAudits.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      const approved = {
        ...row,
        approveTime: new Date().toLocaleString(),
        approver: '当前用户'
      }
      pendingAudits.value.splice(index, 1)
      approvedAudits.value.unshift(approved)
      ElMessage.success('审核通过')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Approve error:', error)
    }
  }
}

const handleReject = async (row) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入驳回原因', '驳回审核', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入驳回原因'
    })
    
    const index = pendingAudits.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      const rejected = {
        ...row,
        rejectTime: new Date().toLocaleString(),
        rejectReason: reason
      }
      pendingAudits.value.splice(index, 1)
      rejectedAudits.value.unshift(rejected)
      ElMessage.success('已驳回')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Reject error:', error)
    }
  }
}
</script>

<style scoped>
.content-audit {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
