<template>
  <div class="cicd-page">
    <el-card shadow="hover" class="mb-24">
      <template #header>
        <span class="card-title">CI/CD 统计</span>
      </template>
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon text-primary"><Connection /></el-icon>
            <div class="stat-value">{{ stats.totalWorkflows || 0 }}</div>
            <div class="stat-label">工作流数量</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon text-success"><CircleCheck /></el-icon>
            <div class="stat-value">{{ stats.totalRuns || 0 }}</div>
            <div class="stat-label">总运行次数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon text-success"><TrendCharts /></el-icon>
            <div class="stat-value">{{ stats.successRate || 0 }}%</div>
            <div class="stat-label">成功率</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon text-warning"><Warning /></el-icon>
            <div class="stat-value">{{ stats.consecutiveSuccesses || 0 }}</div>
            <div class="stat-label">连续成功</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="24" class="mb-24">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">工作流列表</span>
          </template>
          <el-table :data="workflows" style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="工作流名称" min-width="200">
              <template #default="{ row }">
                <div class="workflow-name">
                  <el-icon class="workflow-icon"><Cpu /></el-icon>
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="state" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.state === 'active' ? 'success' : 'info'">
                  {{ row.state === 'active' ? '活跃' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewWorkflow(row)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="flex-between">
              <span class="card-title">运行状态分布</span>
            </div>
          </template>
          <div ref="statusChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover">
      <template #header>
        <span class="card-title">最近运行记录</span>
      </template>
      <el-table :data="recentRuns" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="工作流名称" min-width="200">
          <template #default="{ row }">
            <el-link :href="row.html_url" target="_blank" type="primary">
              {{ row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="event" label="触发事件" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.event }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getRunStatusType(row.conclusion)" size="small">
              {{ row.conclusion || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="head_branch" label="分支" width="120">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.head_branch }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提交者" width="150">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="24" :src="row.actor?.avatar_url" />
              <span class="user-name">{{ row.actor?.login }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewRun(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { useAppStore } from '@/stores/app';
import { getWorkflows, getWorkflowRuns, getCICDStatistics } from '@/api/cicd';

const appStore = useAppStore();

const loading = ref(false);
const workflows = ref<any[]>([]);
const recentRuns = ref<any[]>([]);
const stats = ref({
  totalWorkflows: 0,
  totalRuns: 0,
  successRate: 0,
  consecutiveSuccesses: 0,
});
const statusChartRef = ref<HTMLElement>();

let statusChart: echarts.ECharts | null = null;

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

function getRunStatusType(conclusion: string) {
  switch (conclusion) {
    case 'success':
      return 'success';
    case 'failure':
      return 'danger';
    case 'cancelled':
      return 'info';
    default:
      return 'warning';
  }
}

function viewWorkflow(workflow: any) {
  window.open(workflow.html_url, '_blank');
}

function viewRun(run: any) {
  window.open(run.html_url, '_blank');
}

async function loadData() {
  loading.value = true;
  try {
    const [workflowsData, runsData, statsData] = await Promise.all([
      getWorkflows(appStore.repositoryOwner, appStore.repositoryName),
      getWorkflowRuns(appStore.repositoryOwner, appStore.repositoryName, undefined, undefined, 1, 20),
      getCICDStatistics(appStore.repositoryOwner, appStore.repositoryName),
    ]);

    workflows.value = workflowsData.workflows || [];
    recentRuns.value = runsData.workflow_runs || [];
    stats.value = {
      totalWorkflows: statsData.totalWorkflows || 0,
      totalRuns: statsData.totalRuns || 0,
      successRate: statsData.successRate || 0,
      consecutiveSuccesses: statsData.pipelineStatus?.consecutiveSuccesses || 0,
    };

    await nextTick();
    initStatusChart(statsData);
  } catch (error) {
    console.error('加载 CI/CD 数据失败:', error);
  } finally {
    loading.value = false;
  }
}

function initStatusChart(statsData: any) {
  if (statusChartRef.value) {
    statusChart = echarts.init(statusChartRef.value);

    const distribution = statsData.conclusionDistribution || {};
    const chartData = Object.entries(distribution).map(([name, value]) => ({
      name: getStatusName(name as string),
      value,
    }));

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
      },
      series: [
        {
          name: '运行状态',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          data: chartData.length > 0 ? chartData : [
            { name: '暂无数据', value: 1 },
          ],
        },
      ],
    };

    statusChart.setOption(option);
  }
}

function getStatusName(status: string): string {
  const nameMap: Record<string, string> = {
    success: '成功',
    failure: '失败',
    cancelled: '已取消',
    action_required: '需要操作',
    neutral: '中立',
    skipped: '已跳过',
    timed_out: '超时',
  };
  return nameMap[status] || status;
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
    statusChart?.resize();
  });
});
</script>

<style scoped lang="scss">
.cicd-page {
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

  .workflow-name {
    display: flex;
    align-items: center;

    .workflow-icon {
      font-size: 18px;
      margin-right: 8px;
      color: #409eff;
    }
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
}
</style>
