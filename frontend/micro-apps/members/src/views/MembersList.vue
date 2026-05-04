<template>
  <div class="members-list">
    <el-card class="stats-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="总会员数" :value="2586" value-style="color: #409EFF">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="今日新增" :value="28" value-style="color: #67C23A">
            <template #prefix>
              <el-icon><Plus /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="活跃会员" :value="1892" value-style="color: #E6A23C">
            <template #prefix>
              <el-icon><TrendCharts /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="累计消费" :value="1258000" value-style="color: #F56C6C" :precision="2">
            <template #prefix>
              <el-icon><Money /></el-icon>
            </template>
          </el-statistic>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="会员昵称">
          <el-input v-model="searchForm.name" placeholder="请输入会员昵称" clearable />
        </el-form-item>
        <el-form-item label="会员手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="会员等级">
          <el-select v-model="searchForm.level" placeholder="请选择等级" clearable>
            <el-option label="全部" value="" />
            <el-option label="普通会员" value="normal" />
            <el-option label="银卡会员" value="silver" />
            <el-option label="金卡会员" value="gold" />
            <el-option label="钻石会员" value="diamond" />
          </el-select>
        </el-form-item>
        <el-form-item label="注册时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>会员列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="id" label="会员ID" width="100" />
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatar" />
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="level" label="会员等级" width="120">
          <template #default="scope">
            <el-tag :type="getLevelType(scope.row.level)" size="small">
              {{ getLevelLabel(scope.row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="100">
          <template #default="scope">
            <span class="points">{{ scope.row.points }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="累计消费" width="120">
          <template #default="scope">
            <span class="amount">¥{{ scope.row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="订单数" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" link>查看</el-button>
            <el-button type="primary" link>编辑</el-button>
            <el-button
              v-if="scope.row.status === 'active'"
              type="danger"
              link
            >
              禁用
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Plus, TrendCharts, Money, Download } from '@element-plus/icons-vue'

const loading = ref(false)

const searchForm = reactive({
  name: '',
  phone: '',
  level: '',
  dateRange: []
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])

const mockMembers = [
  {
    id: 1001,
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    nickname: '张三',
    phone: '13800138001',
    level: 'gold',
    points: 2580,
    totalAmount: 15860,
    orderCount: 32,
    status: 'active',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 1002,
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    nickname: '李四',
    phone: '13800138002',
    level: 'diamond',
    points: 8950,
    totalAmount: 58920,
    orderCount: 128,
    status: 'active',
    createTime: '2023-12-20 14:20:00'
  },
  {
    id: 1003,
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    nickname: '王五',
    phone: '13800138003',
    level: 'silver',
    points: 860,
    totalAmount: 5860,
    orderCount: 12,
    status: 'active',
    createTime: '2024-02-10 09:15:00'
  },
  {
    id: 1004,
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    nickname: '赵六',
    phone: '13800138004',
    level: 'normal',
    points: 120,
    totalAmount: 1200,
    orderCount: 3,
    status: 'inactive',
    createTime: '2024-03-05 16:45:00'
  },
  {
    id: 1005,
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    nickname: '孙七',
    phone: '13800138005',
    level: 'gold',
    points: 3680,
    totalAmount: 28960,
    orderCount: 56,
    status: 'active',
    createTime: '2023-11-08 11:30:00'
  }
]

const levelMap = {
  normal: { label: '普通会员', type: 'info' },
  silver: { label: '银卡会员', type: 'primary' },
  gold: { label: '金卡会员', type: 'warning' },
  diamond: { label: '钻石会员', type: 'danger' }
}

const statusMap = {
  active: { label: '正常', type: 'success' },
  inactive: { label: '禁用', type: 'danger' }
}

const getLevelLabel = (level) => levelMap[level]?.label || level
const getLevelType = (level) => levelMap[level]?.type || 'info'
const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

const fetchMembers = async () => {
  loading.value = true
  try {
    tableData.value = mockMembers
    pagination.total = mockMembers.length
  } catch (error) {
    ElMessage.error('获取会员列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  ElMessage.success('搜索成功')
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.phone = ''
  searchForm.level = ''
  searchForm.dateRange = []
  fetchMembers()
}

const handleExport = () => {
  ElMessage.success('会员列表导出中，请稍候...')
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchMembers()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  fetchMembers()
}

onMounted(() => {
  fetchMembers()
})
</script>

<style lang="scss" scoped>
.members-list {
  .stats-card {
    margin-bottom: 20px;
  }

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .points {
    color: #409EFF;
    font-weight: bold;
  }

  .amount {
    color: #f56c6c;
    font-weight: bold;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
