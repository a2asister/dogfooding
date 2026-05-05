<template>
  <div class="compliance-page">
    <el-card shadow="hover" class="mb-24">
      <template #header>
        <span class="card-title">合规检测概览</span>
      </template>
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="score-card" :class="getScoreClass(complianceData.score)">
            <div class="score-value">{{ complianceData.score || 0 }}</div>
            <div class="score-label">合规评分</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon text-success"><CircleCheck /></el-icon>
            <div class="stat-value">{{ complianceData.passedChecks || 0 }}</div>
            <div class="stat-label">通过检查</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon text-danger"><CircleClose /></el-icon>
            <div class="stat-value">{{ complianceData.totalChecks - complianceData.passedChecks || 0 }}</div>
            <div class="stat-label">未通过检查</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon text-warning"><Warning /></el-icon>
            <div class="stat-value">{{ securityAlerts }}</div>
            <div class="stat-label">安全警报</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="24" class="mb-24">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">合规检查项</span>
          </template>
          <div class="checks-list">
            <div
              v-for="(check, key) in complianceChecks"
              :key="key"
              class="check-item"
            >
              <el-icon class="check-icon" :class="check.passed ? 'text-success' : 'text-danger'">
                <CircleCheck v-if="check.passed" />
                <CircleClose v-else />
              </el-icon>
              <div class="check-info">
                <div class="check-name">{{ check.name }}</div>
                <div class="check-desc">{{ check.description }}</div>
              </div>
              <el-tag :type="check.passed ? 'success' : 'danger'" size="small">
                {{ check.passed ? '通过' : '未通过' }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">许可证信息</span>
          </template>
          <div v-if="complianceData.license" class="license-info">
            <div class="license-header">
              <el-icon class="license-icon"><Document /></el-icon>
              <div>
                <div class="license-name">{{ complianceData.license.name }}</div>
                <div class="license-spdx">{{ complianceData.license.spdx_id }}</div>
              </div>
            </div>
            <el-divider />
            <div class="license-description">
              {{ complianceData.license.description || '暂无描述' }}
            </div>
          </div>
          <el-empty v-else description="未检测到许可证" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24" class="mb-24">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">社区文档检查</span>
          </template>
          <el-table :data="communityFiles" style="width: 100%">
            <el-table-column prop="name" label="文档名称" width="200">
              <template #default="{ row }">
                <el-icon v-if="row.exists" class="text-success"><CircleCheck /></el-icon>
                <el-icon v-else class="text-danger"><CircleClose /></el-icon>
                <span style="margin-left: 8px">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="fileName" label="文件名" width="200">
              <template #default="{ row }">
                <code>{{ row.fileName }}</code>
              </template>
            </el-table-column>
            <el-table-column prop="exists" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.exists ? 'success' : 'danger'" size="small">
                  {{ row.exists ? '存在' : '缺失' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">安全警报分布</span>
          </template>
          <div ref="alertChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover">
      <template #header>
        <span class="card-title">改进建议</span>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(recommendation, index) in complianceData.recommendations"
          :key="index"
          :timestamp="`建议 ${index + 1}`"
          placement="top"
        >
          <el-card shadow="hover">
            <div class="recommendation-content">
              <el-icon class="text-warning"><Warning /></el-icon>
              <span style="margin-left: 8px">{{ recommendation }}</span>
            </div>
          </el-card>
        </el-timeline-item>
        <el-timeline-item v-if="complianceData.recommendations?.length === 0" placement="top">
          <el-card shadow="hover">
            <el-empty description="暂无改进建议，项目合规状态良好！" />
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import * as echarts from 'echarts';
import { useAppStore } from '@/stores/app';
import { analyzeCompliance } from '@/api/compliance';
import { CircleCheck, CircleClose } from '@element-plus/icons-vue';

const appStore = useAppStore();

const loading = ref(false);
const complianceData = ref<any>({
  score: 0,
  passedChecks: 0,
  totalChecks: 0,
  checks: {},
  license: null,
  recommendations: [],
  files: {},
});
const alertChartRef = ref<HTMLElement>();

let alertChart: echarts.ECharts | null = null;

const securityAlerts = computed(() => {
  const alerts = complianceData.value.security?.dependabotAlerts?.open || {};
  return (alerts.critical || 0) + (alerts.high || 0) + (alerts.medium || 0);
});

const complianceChecks = computed(() => {
  const checks = complianceData.value.checks || {};
  return [
    { name: '许可证文件', description: '项目是否包含开源许可证文件', passed: checks.hasLicense, fileName: 'LICENSE' },
    { name: 'README 文档', description: '项目是否包含 README 文档', passed: checks.hasReadme, fileName: 'README.md' },
    { name: '安全策略', description: '项目是否包含安全策略文档', passed: checks.hasSecurityPolicy, fileName: 'SECURITY.md' },
    { name: '行为准则', description: '项目是否包含行为准则文档', passed: checks.hasCodeOfConduct, fileName: 'CODE_OF_CONDUCT.md' },
    { name: '贡献指南', description: '项目是否包含贡献指南文档', passed: checks.hasContributingGuide, fileName: 'CONTRIBUTING.md' },
  ].map(check => ({
    ...check,
    exists: check.passed,
  }));
});

const communityFiles = computed(() => [
  { name: 'README 文档', fileName: 'README.md', exists: complianceData.value.files?.readme },
  { name: '安全策略', fileName: 'SECURITY.md', exists: complianceData.value.files?.securityPolicy },
  { name: '行为准则', fileName: 'CODE_OF_CONDUCT.md', exists: complianceData.value.files?.codeOfConduct },
  { name: '贡献指南', fileName: 'CONTRIBUTING.md', exists: complianceData.value.files?.contributingGuide },
]);

function getScoreClass(score: number) {
  if (score >= 80) return 'score-high';
  if (score >= 50) return 'score-medium';
  return 'score-low';
}

async function loadData() {
  loading.value = true;
  try {
    const data = await analyzeCompliance(appStore.repositoryOwner, appStore.repositoryName);
    complianceData.value = data;

    await nextTick();
    initAlertChart();
  } catch (error) {
    console.error('加载合规数据失败:', error);
  } finally {
    loading.value = false;
  }
}

function initAlertChart() {
  if (alertChartRef.value) {
    alertChart = echarts.init(alertChartRef.value);

    const alerts = complianceData.value.security?.dependabotAlerts?.open || {};
    const chartData = [
      { value: alerts.critical || 0, name: '严重' },
      { value: alerts.high || 0, name: '高危' },
      { value: alerts.medium || 0, name: '中等' },
      { value: alerts.low || 0, name: '低危' },
    ].filter(item => item.value > 0);

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
      color: ['#f56c6c', '#ff6b6b', '#ffd666', '#909399'],
      series: [
        {
          name: '安全警报',
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
            { value: 1, name: '暂无警报' },
          ],
        },
      ],
    };

    alertChart.setOption(option);
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
    alertChart?.resize();
  });
});
</script>

<style scoped lang="scss">
.compliance-page {
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .score-card {
    text-align: center;
    padding: 16px;
    border-radius: 8px;
    transition: all 0.3s;

    &.score-high {
      background: linear-gradient(135deg, #67c23a 0%, #95d475 100%);
    }

    &.score-medium {
      background: linear-gradient(135deg, #e6a23c 0%, #f5c76d 100%);
    }

    &.score-low {
      background: linear-gradient(135deg, #f56c6c 0%, #f9a7a7 100%);
    }

    .score-value {
      font-size: 48px;
      font-weight: 700;
      color: #fff;
    }

    .score-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 8px;
    }
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

  .checks-list {
    .check-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      .check-icon {
        font-size: 24px;
        margin-right: 12px;
      }

      .check-info {
        flex: 1;

        .check-name {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
        }

        .check-desc {
          font-size: 12px;
          color: #909399;
          margin-top: 2px;
        }
      }
    }
  }

  .license-info {
    .license-header {
      display: flex;
      align-items: center;

      .license-icon {
        font-size: 48px;
        color: #409eff;
        margin-right: 16px;
      }

      .license-name {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }

      .license-spdx {
        font-size: 14px;
        color: #909399;
        margin-top: 4px;
      }
    }

    .license-description {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
    }
  }

  .recommendation-content {
    display: flex;
    align-items: flex-start;
    font-size: 14px;
    color: #606266;
  }
}
</style>
