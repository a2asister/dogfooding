<template>
  <div class="pr-page">
    <el-card shadow="hover" class="mb-24">
      <template #header>
        <span class="card-title">PR 统计</span>
      </template>
      <el-row :gutter="24">
        <el-col :span="8">
          <div class="stat-card">
            <el-icon class="stat-icon text-primary"><Share /></el-icon>
            <div class="stat-value">{{ stats.open || 0 }}</div>
            <div class="stat-label">开放 PR</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <el-icon class="stat-icon text-success"><CircleCheck /></el-icon>
            <div class="stat-value">{{ stats.closed || 0 }}</div>
            <div class="stat-label">已关闭/合并 PR</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <el-icon class="stat-icon text-info"><DataAnalysis /></el-icon>
            <div class="stat-value">{{ stats.total || 0 }}</div>
            <div class="stat-label">总计 PR</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <div class="flex-between">
          <span class="card-title">PR 列表</span>
          <el-select v-model="filterState" placeholder="状态筛选" clearable @change="loadPRs" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="开放" value="open" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </div>
      </template>
      <el-table :data="pullRequests" style="width: 100%" v-loading="loading">
        <el-table-column prop="number" label="编号" width="80">
          <template #default="{ row }">
            <el-text type="primary" class="pr-number">#{{ row.number }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="300">
          <template #default="{ row }">
            <div class="pr-title">
              <el-link :href="row.html_url" target="_blank" type="primary" class="title-text">
                {{ row.title }}
              </el-link>
              <div class="pr-branch" v-if="row.base && row.head">
                <el-tag size="small">{{ row.base.ref }}</el-tag>
                <el-icon class="arrow-icon"><Right /></el-icon>
                <el-tag size="small" type="primary">{{ row.head.ref }}</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.state === 'open' ? 'success' : 'info'">
              {{ row.state === 'open' ? '开放' : row.merged_at ? '已合并' : '已关闭' }}
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
        <el-table-column label="变更统计" width="160">
          <template #default="{ row }">
            <div class="change-stats">
              <span class="additions">+{{ row.additions || 0 }}</span>
              <span class="deletions">-{{ row.deletions || 0 }}</span>
              <span class="files">{{ row.changed_files || 0 }} 个文件</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import dayjs from 'dayjs';
import { useAppStore } from '@/stores/app';
import { getPullRequests, getPullRequestStatistics } from '@/api/pull-request';

const appStore = useAppStore();

const loading = ref(false);
const pullRequests = ref<any[]>([]);
const stats = ref({ open: 0, closed: 0, total: 0 });
const filterState = ref('');

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

async function loadPRs() {
  loading.value = true;
  try {
    const [statsData, prsData] = await Promise.all([
      getPullRequestStatistics(appStore.repositoryOwner, appStore.repositoryName),
      getPullRequests(
        appStore.repositoryOwner,
        appStore.repositoryName,
        filterState.value || undefined,
        1,
        20,
      ),
    ]);

    stats.value = statsData;
    pullRequests.value = prsData;
  } catch (error) {
    console.error('加载 PR 失败:', error);
  } finally {
    loading.value = false;
  }
}

watch(
  () => [appStore.repositoryOwner, appStore.repositoryName],
  () => {
    loadPRs();
  },
);

onMounted(() => {
  loadPRs();
});
</script>

<style scoped lang="scss">
.pr-page {
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

  .pr-title {
    .title-text {
      font-size: 14px;
      font-weight: 500;
      display: block;
      margin-bottom: 8px;
    }

    .pr-branch {
      display: flex;
      align-items: center;
      gap: 8px;

      .arrow-icon {
        color: #909399;
      }
    }
  }

  .pr-number {
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

  .change-stats {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;

    .additions {
      color: #67c23a;
      font-weight: 600;
    }

    .deletions {
      color: #f56c6c;
      font-weight: 600;
    }

    .files {
      color: #909399;
    }
  }
}
</style>
