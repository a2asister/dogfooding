<template>
  <div class="report-center">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>报表中心</span>
          <el-button type="primary" @click="createReport">新建报表</el-button>
        </div>
      </template>
      
      <el-table :data="reports" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="报表名称" width="200" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag :type="getReportTypeTag(scope.row.type)">
              {{ getReportTypeName(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="creator" label="创建者" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'published' ? 'success' : 'info'">
              {{ scope.row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="viewReport(scope.row)">查看</el-button>
            <el-button type="primary" link @click="editReport(scope.row)">编辑</el-button>
            <el-button type="primary" link @click="exportReport(scope.row)">导出</el-button>
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
import { ElMessage } from 'element-plus'

const reports = ref([
  {
    id: 1,
    name: '月度用户增长报表',
    type: 'line',
    description: '展示过去一个月的用户注册和活跃数据',
    creator: '张三',
    createTime: '2024-01-15 10:30:00',
    status: 'published'
  },
  {
    id: 2,
    name: '用户行为分析报告',
    type: 'bar',
    description: '分析用户在各功能模块的使用情况',
    creator: '李四',
    createTime: '2024-01-14 14:20:00',
    status: 'published'
  },
  {
    id: 3,
    name: '系统性能监控报表',
    type: 'line',
    description: '监控系统各组件的运行性能指标',
    creator: '王五',
    createTime: '2024-01-13 09:15:00',
    status: 'draft'
  },
  {
    id: 4,
    name: '内容浏览统计',
    type: 'pie',
    description: '统计各类内容的浏览量分布',
    creator: '赵六',
    createTime: '2024-01-12 16:45:00',
    status: 'published'
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(4)

const getReportTypeName = (type) => {
  const typeMap = {
    line: '折线图',
    bar: '柱状图',
    pie: '饼图',
    table: '表格'
  }
  return typeMap[type] || type
}

const getReportTypeTag = (type) => {
  const tagMap = {
    line: 'primary',
    bar: 'success',
    pie: 'warning',
    table: 'info'
  }
  return tagMap[type] || 'info'
}

const createReport = () => {
  ElMessage.success('打开新建报表对话框')
}

const viewReport = (row) => {
  ElMessage.info(`查看报表: ${row.name}`)
}

const editReport = (row) => {
  ElMessage.info(`编辑报表: ${row.name}`)
}

const exportReport = (row) => {
  ElMessage.success(`导出报表: ${row.name}`)
}
</script>

<style scoped>
.report-center {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
