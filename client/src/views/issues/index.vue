<template>
  <div class="issues-page">
    <el-card shadow="hover" class="mb-24">
      <template #header>
        <div class="flex-between">
          <span class="card-title">Issue 统计</span>
        </div>
      </template>
      <el-row :gutter="24">
        <el-col :span="8">
          <div class="stat-card">
            <el-icon class="stat-icon text-primary"><Document /></el-icon>
            <div class="stat-value">{{ stats.open || 0 }}</div>
            <div class="stat-label">开放 Issue</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <el-icon class="stat-icon text-success"><CircleCheck /></el-icon>
            <div class="stat-value">{{ stats.closed || 0 }}</div>
            <div class="stat-label">已关闭 Issue</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <el-icon class="stat-icon text-info"><DataAnalysis /></el-icon>
            <div class="stat-value">{{ stats.total || 0 }}</div>
            <div class="stat-label">总计 Issue</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="hover" class="mb-24">
      <template #header>
        <div class="flex-between">
          <span class="card-title">筛选条件</span>
        </div>
      </template>
      <el-form :inline="true" :model="filters">
        <el-form-item label="状态">
          <el-select v-model="filters.state" placeholder="全部" clearable @change="loadIssues">
            <el-option label="全部" value="" />
            <el-option label="开放" value="open" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="filters.labels" placeholder="多个标签用逗号分隔" @keyup.enter="loadIssues" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadIssues">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <span class="card-title">Issue 列表</span>
      </template>
      <el-table
        :data="issues"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="number" label="编号" width="80">
          <template #default="{ row }">
            <el-text type="primary" class="issue-number">#{{ row.number }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="300">
          <template #default="{ row }">
            <div class="issue-title">
              <el-link :href="row.html_url" target="_blank" type="primary" class="title-text">
                {{ row.title }}
              </el-link>
              <div class="issue-labels" v-if="row.labels?.length">
                <el-tag
                  v-for="label in row.labels"
                  :key="label.id"
                  size="small"
                  :style="{ backgroundColor: '#' + label.color, color: getLabelTextColor(label.color) }"
                >
                  {{ label.name }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.state === 'open' ? 'success' : 'info'">
              {{ row.state === 'open' ? '开放' : '已关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建者" width="150">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="24" :src="row.user?.avatar_url" />
              <span class="user-name">{{ row.user?.login }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="comments" label="评论" width="80">
          <template #default="{ row }">
            <div class="comments-count">
              <el-icon><ChatDotRound /></el-icon>
              <span>{{ row.comments }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 16px; justify-content: flex-end"
        @size-change="loadIssues"
        @current-change="loadIssues"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import dayjs from 'dayjs';
import { useAppStore } from '@/stores/app';
import { getIssues, getIssueStatistics } from '@/api/issue';

const appStore = useAppStore();

const loading = ref(false);
const issues = ref<any[]>([]);
const stats = ref({ open: 0, closed: 0, total: 0 });

const filters = ref({
  state: '',
  labels: '',
});

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

function getLabelTextColor(color: string) {
  if (!color) return '#303133';
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#303133' : '#ffffff';
}

async function loadIssues() {
  loading.value = true;
  try {
    const [statsData, issuesData] = await Promise.all([
      getIssueStatistics(appStore.repositoryOwner, appStore.repositoryName),
      getIssues(
        appStore.repositoryOwner,
        appStore.repositoryName,
        filters.value.state || undefined,
        filters.value.labels || undefined,
        pagination.value.page,
        pagination.value.pageSize,
      ),
    ]);

    stats.value = statsData;
    issues.value = issuesData;
    pagination.value.total = issuesData.length || 30;
  } catch (error) {
    console.error('加载 Issue 失败:', error);
  } finally {
    loading.value = false;
  }
}

watch(
  () => [appStore.repositoryOwner, appStore.repositoryName],
  () => {
    pagination.value.page = 1;
    loadIssues();
  },
);

onMounted(() => {
  loadIssues();
});
</script>

<style scoped lang="scss">
.issues-page {
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .stat-card {
    text-align: center;
    padding: 16px;

    .stat-icon {
      font-size: 36px;
      margin-bottom: 12px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
    }
  }

  .issue-title {
    .title-text {
      font-size: 14px;
      font-weight: 500;
      display: block;
      margin-bottom: 8px;
    }

    .issue-labels {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
  }

  .issue-number {
    font-weight: 600;
  }

  .user-info {
    display: flex;
    align-items: center;

    .user-name {
      margin-left: 8px;
      font-size: 13px;
      color: #606266;
    }
  }

  .comments-count {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #606266;
  }
}
</style>
