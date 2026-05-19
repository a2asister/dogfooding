<template>
  <div class="creator-data-center">
    <div class="page-header">
      <h2>创作者数据中心</h2>
      <div class="filter-bar">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 280px"
          @change="fetchData"
        />
        <el-button type="primary" @click="fetchData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="data-content">
      <el-row :gutter="20" class="stats-cards">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon icon-blue">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">总创作者数</p>
              <p class="stat-value">{{ mockStats.totalCreators }}</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon icon-green">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">新增创作者</p>
              <p class="stat-value">{{ mockStats.newCreators }}</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon icon-orange">
              <el-icon><Medal /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">认证创作者</p>
              <p class="stat-value">{{ mockStats.verifiedCreators }}</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon icon-red">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">待审核认证</p>
              <p class="stat-value">{{ mockStats.pendingVerifications }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="chart-section">
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <span>创作者增长趋势</span>
            </template>
            <div class="chart-container">
              <el-table :data="mockTrendData" border size="small">
                <el-table-column prop="date" label="日期" width="120" />
                <el-table-column prop="newCreators" label="新增创作者" />
                <el-table-column prop="totalCreators" label="总创作者" />
              </el-table>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <span>创作者活跃度</span>
            </template>
            <div class="chart-container">
              <el-table :data="mockActivityData" border size="small">
                <el-table-column prop="date" label="日期" width="120" />
                <el-table-column prop="activeCreators" label="活跃创作者" />
                <el-table-column prop="newNotes" label="发布笔记数" />
              </el-table>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card shadow="hover" class="creator-list-card">
        <template #header>
          <span>创作者列表</span>
        </template>
        <el-table :data="creators" border stripe>
          <el-table-column label="创作者" width="180">
            <template #default="{ row }">
              <div class="creator-info">
                <el-avatar :src="row.user?.avatar" size="40" />
                <span class="creator-name">{{ row.user?.nickname }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="认证类型" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.verification" :type="getVerificationType(row.verification.type)">
                {{ getVerificationName(row.verification.type) }}
              </el-tag>
              <span v-else>未认证</span>
            </template>
          </el-table-column>
          <el-table-column label="粉丝数" width="100" align="center">
            <template #default="{ row }">
              {{ row.user?.followerCount || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="笔记数" width="100" align="center">
            <template #default="{ row }">
              {{ row.user?.noteCount || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="总浏览量" width="120" align="center">
            <template #default="{ row }">
              {{ row.totalViews || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="总点赞" width="100" align="center">
            <template #default="{ row }">
              {{ row.totalLikes || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="注册时间" width="180">
            <template #default="{ row }">
              {{ row.user?.createdAt ? formatDate(row.user.createdAt) : '-' }}
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[10, 20, 50, 100]"
            @size-change="fetchData"
            @current-change="fetchData"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getCreatorOverview, getCreatorDataRange } from '@/api/creator';
import type { CreatorData } from '@/types';
import { Refresh, User, TrendCharts, Medal, Clock } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const loading = ref(false);
const creators = ref<CreatorData[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const dateRange = ref<[string, string] | null>(null);

const mockStats = reactive({
  totalCreators: 12580,
  newCreators: 328,
  verifiedCreators: 1256,
  pendingVerifications: 89,
});

const mockTrendData = ref([
  { date: '2024-01-01', newCreators: 45, totalCreators: 12000 },
  { date: '2024-01-02', newCreators: 52, totalCreators: 12052 },
  { date: '2024-01-03', newCreators: 38, totalCreators: 12090 },
  { date: '2024-01-04', newCreators: 61, totalCreators: 12151 },
  { date: '2024-01-05', newCreators: 48, totalCreators: 12199 },
  { date: '2024-01-06', newCreators: 55, totalCreators: 12254 },
  { date: '2024-01-07', newCreators: 42, totalCreators: 12296 },
]);

const mockActivityData = ref([
  { date: '2024-01-01', activeCreators: 856, newNotes: 1234 },
  { date: '2024-01-02', activeCreators: 923, newNotes: 1456 },
  { date: '2024-01-03', activeCreators: 789, newNotes: 1123 },
  { date: '2024-01-04', activeCreators: 1012, newNotes: 1567 },
  { date: '2024-01-05', activeCreators: 945, newNotes: 1345 },
  { date: '2024-01-06', activeCreators: 876, newNotes: 1289 },
  { date: '2024-01-07', activeCreators: 912, newNotes: 1378 },
]);

const getVerificationName = (type: string) => {
  const map: Record<string, string> = {
    personal: '个人认证',
    organization: '机构认证',
    expert: '专家认证',
    celebrity: '名人认证',
  };
  return map[type] || type;
};

const getVerificationType = (type: string) => {
  const map: Record<string, string> = {
    personal: 'primary',
    organization: 'success',
    expert: 'warning',
    celebrity: 'danger',
  };
  return map[type] || 'info';
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const fetchData = async () => {
  loading.value = true;
  try {
    await getCreatorOverview();
    const res = await getCreatorDataRange({
      startDate: dateRange.value?.[0] || dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
      endDate: dateRange.value?.[1] || dayjs().format('YYYY-MM-DD'),
    });
    creators.value = res.list;
    total.value = res.total;
  } catch (error) {
    console.error('获取创作者数据失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.creator-data-center {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .filter-bar {
      display: flex;
      gap: 12px;
    }
  }

  .data-content {
    .stats-cards {
      margin-bottom: 20px;

      .stat-card {
        display: flex;
        align-items: center;
        gap: 16px;

        :deep(.el-card__body) {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: #fff;

          &.icon-blue {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          &.icon-green {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          }

          &.icon-orange {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          &.icon-red {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          }
        }

        .stat-info {
          .stat-label {
            margin: 0;
            font-size: 14px;
            color: #909399;
            margin-bottom: 4px;
          }

          .stat-value {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            color: #303133;
          }
        }
      }
    }

    .chart-section {
      margin-bottom: 20px;

      .chart-card {
        .chart-container {
          height: 300px;
        }
      }
    }

    .creator-list-card {
      .creator-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .creator-name {
          font-weight: 500;
        }
      }

      .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>
