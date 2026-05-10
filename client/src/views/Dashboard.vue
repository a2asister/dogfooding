<template>
  <div>
    <el-row :gutter="20" class="mb-6">
      <el-col :span="6">
        <el-card class="text-center">
          <div class="text-3xl font-bold text-blue-600">{{ stats.formCount }}</div>
          <div class="text-gray-500 mt-2">表单数量</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="text-center">
          <div class="text-3xl font-bold text-green-600">{{ stats.submissionCount }}</div>
          <div class="text-gray-500 mt-2">提交记录</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="text-center">
          <div class="text-3xl font-bold text-orange-600">{{ stats.pendingCount }}</div>
          <div class="text-gray-500 mt-2">待审批</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="text-center">
          <div class="text-3xl font-bold text-purple-600">{{ stats.templateCount }}</div>
          <div class="text-gray-500 mt-2">模板数量</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-medium">最近表单</span>
              <el-button type="primary" size="small" @click="goToForms">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentForms" v-loading="loading">
            <el-table-column prop="name" label="表单名称" />
            <el-table-column prop="category" label="分类" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <span :class="['status-tag', `status-${row.status}`]">
                  {{ statusMap[row.status] }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-medium">最近提交</span>
              <el-button type="primary" size="small" @click="goToSubmissions">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentSubmissions" v-loading="loading">
            <el-table-column label="表单" prop="formId.name" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <span :class="['status-tag', `status-${row.status}`]">
                  {{ submissionStatusMap[row.status] }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="提交时间">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-6">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span class="font-medium">快捷操作</span>
          </template>
          <div class="flex gap-4">
            <el-button type="primary" size="large" @click="createForm">
              <el-icon class="mr-2"><Plus /></el-icon>
              新建表单
            </el-button>
            <el-button size="large" @click="goToTemplates">
              <el-icon class="mr-2"><Collection /></el-icon>
              使用模板
            </el-button>
            <el-button size="large" @click="goToPending">
              <el-icon class="mr-2"><Bell /></el-icon>
              处理审批
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Collection, Bell } from '@element-plus/icons-vue'
import { getFormList } from '@/api/form'
import { getSubmissionList } from '@/api/submission'
import { getTemplateList } from '@/api/template'

const router = useRouter()
const loading = ref(false)

const stats = ref({
  formCount: 0,
  submissionCount: 0,
  pendingCount: 0,
  templateCount: 0
})

const recentForms = ref([])
const recentSubmissions = ref([])

const statusMap = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档'
}

const submissionStatusMap = {
  draft: '草稿',
  submitted: '已提交',
  pending: '审批中',
  approved: '已通过',
  rejected: '已拒绝',
  imported: '已导入'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const loadData = async () => {
  loading.value = true
  try {
    const [forms, submissions, templates] = await Promise.all([
      getFormList({}),
      getSubmissionList({}),
      getTemplateList({})
    ])

    stats.value = {
      formCount: forms.length || 0,
      submissionCount: submissions.length || 0,
      pendingCount: (submissions || []).filter(s => s.status === 'pending').length,
      templateCount: templates.length || 0
    }

    recentForms.value = (forms || []).slice(0, 5)
    recentSubmissions.value = (submissions || []).slice(0, 5)
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const createForm = () => router.push('/forms/new')
const goToForms = () => router.push('/forms')
const goToSubmissions = () => router.push('/submissions')
const goToTemplates = () => router.push('/templates')
const goToPending = () => router.push('/pending')

onMounted(() => {
  loadData()
})
</script>
