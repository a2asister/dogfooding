<template>
  <div class="contributors-page">
    <el-card shadow="hover" class="mb-24">
      <template #header>
        <span class="card-title">贡献者统计概览</span>
      </template>
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon text-primary"><User /></el-icon>
            <div class="stat-value">{{ summary.totalContributors || 0 }}</div>
            <div class="stat-label">总贡献者</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon text-success"><Edit /></el-icon>
            <div class="stat-value">{{ totalCommits }}</div>
            <div class="stat-label">总提交数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon text-warning"><Calendar /></el-icon>
            <div class="stat-value">{{ recentWeeks }}</div>
            <div class="stat-label">活动周数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon text-info"><TrendCharts /></el-icon>
            <div class="stat-value">{{ topContributors?.length || 0 }}</div>
            <div class="stat-label">Top 贡献者</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="24" class="mb-24">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">每周提交活动</span>
          </template>
          <div ref="commitChartRef" class="chart-container-large"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">Top 贡献者</span>
          </template>
          <div class="top-contributors">
            <div
              v-for="(contributor, index) in topContributors"
              :key="contributor.author?.login || index"
              class="contributor-item"
            >
              <div class="rank">{{ index + 1 }}</div>
              <el-avatar :size="40" :src="contributor.author?.avatar_url" />
              <div class="contributor-info">
                <div class="contributor-name">{{ contributor.author?.login }}</div>
                <div class="contributor-stats">
                  <span class="commits">{{ contributor.total }} 次提交</span>
                  <span class="weeks">{{ contributor.weeks }} 周参与</span>
                </div>
              </div>
              <el-progress
                :percentage="getContributorPercentage(contributor.total)"
                :stroke-width="8"
                :show-text="false"
                style="width: 80px"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover">
      <template #header>
        <span class="card-title">贡献者列表</span>
      </template>
      <el-table :data="contributors" style="width: 100%" v-loading="loading">
        <el-table-column label="排名" width="80">
          <template #default="{ $index }">
            <el-tag :type="$index < 3 ? 'warning' : 'info'" size="small">
              #{{ $index + 1 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.avatar_url" />
              <div class="user-details">
                <el-link :href="row.html_url" target="_blank" type="primary">
                  {{ row.login }}
                </el-link>
                <span class="type-tag" v-if="row.type === 'Bot'">Bot</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="contributions" label="贡献次数" width="120">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.contributions }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewContributor(row.login)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import * as echarts from 'echarts';
import { useAppStore } from '@/stores/app';
import { getContributors, getCommitActivity } from '@/api/repository';
import { getContributorActivitySummary } from '@/api/contributor';

const appStore = useAppStore();

const loading = ref(false);
const contributors = ref<any[]>([]);
const summary = ref<any>({ totalContributors: 0 });
const topContributors = ref<any[]>([]);
const commitActivity = ref<any[]>([]);
const commitChartRef = ref<HTMLElement>();

let commitChart: echarts.ECharts | null = null;

const totalCommits = computed(() => {
  return commitActivity.value.reduce((sum, week) => sum + (week.total || 0), 0);
});

const recentWeeks = computed(() => commitActivity.value.length);

const maxContributions = computed(() => {
  return Math.max(...topContributors.value.map((c) => c.total || 0), 1);
});

function getContributorPercentage(total: number) {
  return Math.round((total / maxContributions.value) * 100);
}

function viewContributor(login: string) {
  window.open(`https://github.com/${login}`, '_blank');
}

async function loadData() {
  loading.value = true;
  try {
    const [activitySummary, contributorsData, commitData] = await Promise.all([
      getContributorActivitySummary(appStore.repositoryOwner, appStore.repositoryName),
      getContributors(appStore.repositoryOwner, appStore.repositoryName, 1, 100),
      getCommitActivity(appStore.repositoryOwner, appStore.repositoryName),
    ]);

    summary.value = activitySummary;
    contributors.value = contributorsData;
    commitActivity.value = commitData;
    topContributors.value = activitySummary.topContributors || [];

    await nextTick();
    initCommitChart();
  } catch (error) {
    console.error('加载贡献者数据失败:', error);
  } finally {
    loading.value = false;
  }
}

function initCommitChart() {
  if (commitChartRef.value && commitActivity.value.length > 0) {
    commitChart = echarts.init(commitChartRef.value);

    const weeks = commitActivity.value.slice(-20);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: weeks.map((week: any) => {
          const date = new Date(week.week * 1000);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '周日',
          type: 'bar',
          stack: 'total',
          itemStyle: { color: '#5470c6' },
          data: weeks.map((w: any) => w.days?.[0] || 0),
        },
        {
          name: '周一',
          type: 'bar',
          stack: 'total',
          itemStyle: { color: '#91cc75' },
          data: weeks.map((w: any) => w.days?.[1] || 0),
        },
        {
          name: '周二',
          type: 'bar',
          stack: 'total',
          itemStyle: { color: '#fac858' },
          data: weeks.map((w: any) => w.days?.[2] || 0),
        },
        {
          name: '周三',
          type: 'bar',
          stack: 'total',
          itemStyle: { color: '#ee6666' },
          data: weeks.map((w: any) => w.days?.[3] || 0),
        },
        {
          name: '周四',
          type: 'bar',
          stack: 'total',
          itemStyle: { color: '#73c0de' },
          data: weeks.map((w: any) => w.days?.[4] || 0),
        },
        {
          name: '周五',
          type: 'bar',
          stack: 'total',
          itemStyle: { color: '#3ba272' },
          data: weeks.map((w: any) => w.days?.[5] || 0),
        },
        {
          name: '周六',
          type: 'bar',
          stack: 'total',
          itemStyle: { color: '#fc8452' },
          data: weeks.map((w: any) => w.days?.[6] || 0),
        },
      ],
    };

    commitChart.setOption(option);
  }
}

watch(
  () => [appStore.repositoryOwner, appStore.repositoryName],
  () => {
    loadData();
  },
);

onMounted(() => {
  loadData();

  window.addEventListener('resize', () => {
    commitChart?.resize();
  });
});
</script>

<style scoped lang="scss">
.contributors-page {
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

  .top-contributors {
    .contributor-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      .rank {
        width: 24px;
        font-size: 16px;
        font-weight: 600;
        color: #909399;
        margin-right: 12px;
      }

      .contributor-info {
        flex: 1;
        margin-left: 12px;

        .contributor-name {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
        }

        .contributor-stats {
          font-size: 12px;
          color: #909399;
          margin-top: 4px;

          .commits {
            margin-right: 12px;
          }
        }
      }
    }
  }

  .user-info {
    display: flex;
    align-items: center;

    .user-details {
      margin-left: 12px;
      display: flex;
      flex-direction: column;

      .type-tag {
        font-size: 12px;
        color: #909399;
        margin-top: 2px;
      }
    }
  }
}
</style>
