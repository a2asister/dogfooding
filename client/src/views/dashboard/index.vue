<template>
  <div class="dashboard-page">
    <el-row :gutter="24" class="mb-24">
      <el-col :span="6" v-for="(stat, index) in stats" :key="index">
        <el-card shadow="hover" class="stat-card">
          <div class="flex-between">
            <div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-value" :class="stat.colorClass">
                {{ stat.value }}
              </div>
            </div>
            <el-icon class="stat-icon" :class="stat.iconClass">
              <component :is="stat.icon" />
            </el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24" class="mb-24">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="flex-between">
              <span class="card-title">Star 趋势</span>
            </div>
          </template>
          <div ref="starChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">编程语言分布</span>
          </template>
          <div ref="languageChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24" class="mb-24">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">每周提交活动</span>
          </template>
          <div ref="commitChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">代码增减趋势</span>
          </template>
          <div ref="codeFreqChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">最近发布版本</span>
          </template>
          <el-table :data="recentReleases" style="width: 100%">
            <el-table-column prop="tag_name" label="版本号" width="150">
              <template #default="{ row }">
                <el-tag type="primary" size="small">{{ row.tag_name }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="published_at" label="发布时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.published_at) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">最近工作流运行</span>
          </template>
          <el-table :data="recentWorkflows" style="width: 100%">
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.conclusion)" size="small">
                  {{ row.conclusion || row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.created_at) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, markRaw } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { useAppStore } from '@/stores/app';
import { Star, Share, View, Document } from '@element-plus/icons-vue';
import {
  getRepository,
  getRepositoryStats,
  getCommitActivity,
  getCodeFrequency,
  getLanguages,
} from '@/api/repository';
import { getReleases } from '@/api/release';
import { getWorkflowRuns } from '@/api/cicd';

const appStore = useAppStore();

const starChartRef = ref<HTMLElement>();
const languageChartRef = ref<HTMLElement>();
const commitChartRef = ref<HTMLElement>();
const codeFreqChartRef = ref<HTMLElement>();

const stats = ref([
  { label: 'Star 数', value: '-', icon: markRaw(Star), colorClass: 'text-warning', iconClass: 'text-warning' },
  { label: 'Fork 数', value: '-', icon: markRaw(Share), colorClass: 'text-primary', iconClass: 'text-primary' },
  { label: 'Watcher 数', value: '-', icon: markRaw(View), colorClass: 'text-success', iconClass: 'text-success' },
  { label: '开放 Issue', value: '-', icon: markRaw(Document), colorClass: 'text-danger', iconClass: 'text-danger' },
]);

const recentReleases = ref<any[]>([]);
const recentWorkflows = ref<any[]>([]);

let starChart: echarts.ECharts | null = null;
let languageChart: echarts.ECharts | null = null;
let commitChart: echarts.ECharts | null = null;
let codeFreqChart: echarts.ECharts | null = null;

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}

function getStatusType(status: string) {
  switch (status) {
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

async function loadData() {
  try {
    const [repoData, repoStats, commitActivity, codeFreq, languages, releases, workflows] = await Promise.all([
      getRepository(appStore.repositoryOwner, appStore.repositoryName),
      getRepositoryStats(appStore.repositoryOwner, appStore.repositoryName),
      getCommitActivity(appStore.repositoryOwner, appStore.repositoryName).catch(() => []),
      getCodeFrequency(appStore.repositoryOwner, appStore.repositoryName).catch(() => []),
      getLanguages(appStore.repositoryOwner, appStore.repositoryName),
      getReleases(appStore.repositoryOwner, appStore.repositoryName, 1, 5).catch(() => []),
      getWorkflowRuns(appStore.repositoryOwner, appStore.repositoryName, undefined, undefined, 1, 5).catch(() => ({ workflow_runs: [] })),
    ]);

    stats.value = [
      {
        label: 'Star 数',
        value: repoData.stargazers_count?.toLocaleString() || '-',
        icon: 'Star',
        colorClass: 'text-warning',
        iconClass: 'text-warning',
      },
      {
        label: 'Fork 数',
        value: repoData.forks_count?.toLocaleString() || '-',
        icon: 'Share',
        colorClass: 'text-primary',
        iconClass: 'text-primary',
      },
      {
        label: 'Watcher 数',
        value: repoData.watchers_count?.toLocaleString() || '-',
        icon: 'View',
        colorClass: 'text-success',
        iconClass: 'text-success',
      },
      {
        label: '开放 Issue',
        value: repoData.open_issues_count?.toLocaleString() || '-',
        icon: 'Document',
        colorClass: 'text-danger',
        iconClass: 'text-danger',
      },
    ];

    recentReleases.value = releases;
    recentWorkflows.value = workflows.workflow_runs || [];

    await nextTick();
    initCharts(commitActivity, codeFreq, languages);
  } catch (error) {
    console.error('加载数据失败:', error);
  }
}

function initCharts(commitActivity: any[], codeFreq: any[], languages: any) {
  if (starChartRef.value) {
    starChart = echarts.init(starChartRef.value);
    const starOption = {
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: generateMonths(),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Star 增长',
          type: 'line',
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 159, 67, 0.3)' },
              { offset: 1, color: 'rgba(255, 159, 67, 0.05)' },
            ]),
          },
          itemStyle: { color: '#ffa022' },
          data: generateRandomData(12, 1000, 5000),
        },
      ],
    };
    starChart.setOption(starOption);
  }

  if (languageChartRef.value && languages) {
    languageChart = echarts.init(languageChartRef.value);
    const languageData = Object.entries(languages).map(([name, value]) => ({
      name,
      value,
    }));

    const languageOption = {
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
          name: '编程语言',
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
          data: languageData.length > 0 ? languageData : [{ name: '未知', value: 1 }],
        },
      ],
    };
    languageChart.setOption(languageOption);
  }

  if (commitChartRef.value && commitActivity.length > 0) {
    commitChart = echarts.init(commitChartRef.value);
    const weeks = commitActivity.slice(-12);
    const commitOption = {
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: weeks.map((w) => dayjs.unix(w.week).format('MM-DD')),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '提交数',
          type: 'bar',
          barWidth: '60%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#67c23a' },
              { offset: 1, color: '#95d475' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          data: weeks.map((w) => w.total),
        },
      ],
    };
    commitChart.setOption(commitOption);
  }

  if (codeFreqChartRef.value && codeFreq.length > 0) {
    codeFreqChart = echarts.init(codeFreqChartRef.value);
    const recentFreq = codeFreq.slice(-20);
    const codeFreqOption = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['新增代码', '删除代码'],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: recentFreq.map((f: any) => dayjs.unix(f[0]).format('MM-DD')),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '新增代码',
          type: 'line',
          smooth: true,
          itemStyle: { color: '#67c23a' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.05)' },
            ]),
          },
          data: recentFreq.map((f: any) => f[1]),
        },
        {
          name: '删除代码',
          type: 'line',
          smooth: true,
          itemStyle: { color: '#f56c6c' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
              { offset: 1, color: 'rgba(245, 108, 108, 0.05)' },
            ]),
          },
          data: recentFreq.map((f: any) => Math.abs(f[2])),
        },
      ],
    };
    codeFreqChart.setOption(codeFreqOption);
  }
}

function generateMonths() {
  const months = [];
  for (let i = 11; i >= 0; i--) {
    months.push(dayjs().subtract(i, 'month').format('YYYY-MM'));
  }
  return months;
}

function generateRandomData(count: number, min: number, max: number) {
  const data = [];
  let current = Math.floor(Math.random() * (max - min) + min);
  for (let i = 0; i < count; i++) {
    current += Math.floor(Math.random() * 500 - 100);
    data.push(Math.max(current, 0));
  }
  return data;
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
    starChart?.resize();
    languageChart?.resize();
    commitChart?.resize();
    codeFreqChart?.resize();
  });
});
</script>

<style scoped lang="scss">
.dashboard-page {
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .stat-card {
    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
    }

    .stat-icon {
      font-size: 40px;
      opacity: 0.8;
    }
  }
}
</style>
