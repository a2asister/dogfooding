<template>
  <div class="page-container">
    <div class="card-container">
      <div class="page-header">
        <span class="page-title">归档检索</span>
      </div>

      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索归档合同（关键词、归档ID等）"
          style="width: 400px"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="accessLevelFilter" placeholder="访问级别" clearable style="width: 150px" @change="handleSearch">
          <el-option label="公开" value="public" />
          <el-option label="内部" value="internal" />
          <el-option label="机密" value="confidential" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>

      <el-table :data="archiveList" v-loading="loading" style="width: 100%" stripe>
        <el-table-column prop="id" label="归档编号" width="120">
          <template #default="{ row }">
            <el-text type="info">{{ row.id.slice(0, 8) }}...</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="contractTitle" label="合同名称" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="viewDetail(row)">
              {{ row.contract?.title }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="contractType" label="合同类型" width="120">
          <template #default="{ row }">
            {{ contractTypeMap[row.contract?.type] || '其他' }}
          </template>
        </el-table-column>
        <el-table-column prop="partyA" label="甲方" width="140" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.contract?.partyA }}
          </template>
        </el-table-column>
        <el-table-column prop="partyB" label="乙方" width="140" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.contract?.partyB }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="合同金额" width="130">
          <template #default="{ row }">
            <span v-if="row.contract?.amount">¥{{ row.contract.amount.toLocaleString('zh-CN') }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="keywords" label="关键词" min-width="150">
          <template #default="{ row }">
            <el-tag
              v-for="keyword in row.keywords"
              :key="keyword"
              size="small"
              style="margin-right: 5px; margin-bottom: 5px"
            >
              {{ keyword }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="accessLevel" label="访问级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getAccessLevelType(row.accessLevel)">
              {{ accessLevelMap[row.accessLevel] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="archiveDate" label="归档日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.archiveDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="archiveBy" label="归档人" width="100" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="handlePageChange"
        @current-change="handlePageChange"
      />

      <el-empty v-if="archiveList.length === 0 && !loading" description="暂无归档记录" />
    </div>

    <el-dialog
      v-model="detailVisible"
      title="归档详情"
      width="800px"
    >
      <el-descriptions :column="2" border v-if="selectedArchive">
        <el-descriptions-item label="归档编号" :span="2">
          {{ selectedArchive.id }}
        </el-descriptions-item>
        <el-descriptions-item label="合同名称">
          {{ selectedArchive.contract?.title }}
        </el-descriptions-item>
        <el-descriptions-item label="合同类型">
          {{ contractTypeMap[selectedArchive.contract?.type] || '其他' }}
        </el-descriptions-item>
        <el-descriptions-item label="甲方">
          {{ selectedArchive.contract?.partyA }}
        </el-descriptions-item>
        <el-descriptions-item label="乙方">
          {{ selectedArchive.contract?.partyB }}
        </el-descriptions-item>
        <el-descriptions-item label="合同金额">
          ¥{{ selectedArchive.contract?.amount?.toLocaleString('zh-CN') }}
        </el-descriptions-item>
        <el-descriptions-item label="合同期限">
          {{ formatDate(selectedArchive.contract?.startDate) }} 至 {{ formatDate(selectedArchive.contract?.endDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="关键词" :span="2">
          <el-tag
            v-for="keyword in selectedArchive.keywords"
            :key="keyword"
            style="margin-right: 5px"
          >
            {{ keyword }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="访问级别">
          <el-tag :type="getAccessLevelType(selectedArchive.accessLevel)">
            {{ accessLevelMap[selectedArchive.accessLevel] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="存储位置">
          {{ selectedArchive.location }}
        </el-descriptions-item>
        <el-descriptions-item label="归档日期">
          {{ formatDateTime(selectedArchive.archiveDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="归档人">
          {{ selectedArchive.archiveBy }}
        </el-descriptions-item>
        <el-descriptions-item label="合同内容" :span="2">
          <div class="contract-content">
            <pre>{{ selectedArchive.contract?.content }}</pre>
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { archiveApi } from '@/api/archives'
import type { Archive } from '@/types'
import dayjs from 'dayjs'

const loading = ref(false)
const searchKeyword = ref('')
const accessLevelFilter = ref<string>('')
const detailVisible = ref(false)
const selectedArchive = ref<{ archive: Archive; contract: any } | null>(null)

const allArchives = ref<Array<{ archive: Archive; contract: any }>>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const contractTypeMap: Record<string, string> = {
  sales: '买卖合同',
  lease: '租赁合同',
  service: '服务合同',
  cooperation: '合作协议',
  loan: '借款合同',
  other: '其他合同'
}

const accessLevelMap: Record<string, string> = {
  public: '公开',
  internal: '内部',
  confidential: '机密'
}

const archiveList = computed(() => {
  let filtered = allArchives.value

  if (accessLevelFilter.value) {
    filtered = filtered.filter(a => a.archive.accessLevel === accessLevelFilter.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(a => {
      const hasKeyword = a.archive.keywords.some(k => k.toLowerCase().includes(keyword))
      const hasTitle = a.contract?.title?.toLowerCase().includes(keyword)
      const hasPartyA = a.contract?.partyA?.toLowerCase().includes(keyword)
      const hasPartyB = a.contract?.partyB?.toLowerCase().includes(keyword)
      return hasKeyword || hasTitle || hasPartyA || hasPartyB
    })
  }

  pagination.total = filtered.length

  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filtered.slice(start, end)
})

const formatDate = (date?: string) => {
  return date ? dayjs(date).format('YYYY-MM-DD') : '-'
}

const formatDateTime = (date?: string) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const getAccessLevelType = (level: string) => {
  const map: Record<string, string> = {
    public: 'success',
    internal: 'primary',
    confidential: 'danger'
  }
  return map[level] || ''
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await archiveApi.getAll()
    allArchives.value = await Promise.all(
      res.data.map(async (archive: Archive) => {
        try {
          const detailRes = await archiveApi.getById(archive.id)
          return detailRes.data
        } catch {
          return { archive, contract: null }
        }
      })
    )
    pagination.total = allArchives.value.length
  } catch (error) {
    console.error('Failed to fetch archives:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
}

const resetSearch = () => {
  searchKeyword.value = ''
  accessLevelFilter.value = ''
  pagination.page = 1
}

const handlePageChange = () => {
}

const viewDetail = async (row: { archive: Archive; contract: any }) => {
  try {
    const res = await archiveApi.getById(row.archive.id)
    selectedArchive.value = res.data
    detailVisible.value = true
  } catch (error) {
    console.error('Failed to fetch archive detail:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.contract-content {
  max-height: 300px;
  overflow-y: auto;
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.contract-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.8;
}
</style>
