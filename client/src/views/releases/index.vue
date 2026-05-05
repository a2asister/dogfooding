<template>
  <div class="releases-page">
    <el-card shadow="hover" class="mb-24">
      <template #header>
        <span class="card-title">发布统计</span>
      </template>
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon text-primary"><Flag /></el-icon>
            <div class="stat-value">{{ stats.totalReleases || 0 }}</div>
            <div class="stat-label">总版本数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon text-success"><Upload /></el-icon>
            <div class="stat-value">{{ stats.totalAssets || 0 }}</div>
            <div class="stat-label">总资源数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon text-warning"><Promotion /></el-icon>
            <div class="stat-value">{{ stats.totalDownloads || 0 }}</div>
            <div class="stat-label">总下载量</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon text-danger"><Timer /></el-icon>
            <div class="stat-value">{{ daysSinceLastRelease || 0 }}</div>
            <div class="stat-label">距上次发布(天)</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="24" class="mb-24">
      <el-col :span="14">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">发布趋势</span>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">下载统计</span>
          </template>
          <div ref="downloadChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24" class="mb-24">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="flex-between">
              <span class="card-title">里程碑概览</span>
              <el-button type="primary" link size="small" @click="viewMilestones">
                查看全部
              </el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(milestone, index) in milestones"
              :key="milestone.id"
              :timestamp="formatDate(milestone.due_on || milestone.created_at)"
              placement="top"
              :type="getMilestoneType(milestone.state)"
            >
              <el-card shadow="hover" class="milestone-card">
                <div class="milestone-header">
                  <el-link :href="milestone.html_url" target="_blank" type="primary">
                    <span class="milestone-title">{{ milestone.title }}</span>
                  </el-link>
                  <el-tag :type="getMilestoneTagType(milestone.state)" size="small">
                    {{ milestone.state === 'open' ? '进行中' : '已完成' }}
                  </el-tag>
                </div>
                <el-progress
                  :percentage="getMilestoneProgress(milestone)"
                  :stroke-width="8"
                  :text-inside="true"
                />
                <div class="milestone-info">
                  <span>{{ milestone.open_issues }} 未解决</span>
                  <span>{{ milestone.closed_issues }} 已解决</span>
                </div>
              </el-card>
            </el-timeline-item>
            <el-timeline-item v-if="milestones.length === 0" placement="top">
              <el-card shadow="hover">
                <el-empty description="暂无里程碑" />
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="flex-between">
              <span class="card-title">发布流水线状态</span>
              <el-tag v-if="pipelineStatus" :type="pipelineStatus.consecutiveSuccesses > 5 ? 'success' : 'warning'" size="small">
                {{ pipelineStatus.consecutiveSuccesses > 5 ? '流水线健康' : '需要关注' }}
              </el-tag>
            </div>
          </template>
          <div v-if="pipelineStatus" class="pipeline-status">
            <el-row :gutter="20" class="mb-20">
              <el-col :span="8">
                <div class="pipeline-stat">
                  <div class="pipeline-stat-value">{{ pipelineStatus.totalRuns || 0 }}</div>
                  <div class="pipeline-stat-label">总运行次数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="pipeline-stat">
                  <div class="pipeline-stat-value text-success">{{ pipelineStatus.successRate || 0 }}%</div>
                  <div class="pipeline-stat-label">成功率</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="pipeline-stat">
                  <div class="pipeline-stat-value text-primary">{{ pipelineStatus.consecutiveSuccesses || 0 }}</div>
                  <div class="pipeline-stat-label">连续成功</div>
                </div>
              </el-col>
            </el-row>
            <el-divider />
            <div class="latest-runs">
              <div class="section-title">最近运行</div>
              <div
                v-for="(run, index) in pipelineStatus.recentRuns?.slice(0, 5)"
                :key="index"
                class="run-item"
              >
                <el-tag :type="getRunType(run.conclusion)" size="small" class="run-status">
                  {{ run.conclusion === 'success' ? '成功' : run.conclusion || '运行中' }}
                </el-tag>
                <span class="run-name">{{ run.name }}</span>
                <span class="run-time">{{ formatDate(run.created_at) }}</span>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无流水线数据" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover">
      <template #header>
        <span class="card-title">版本发布列表</span>
      </template>
      <div class="releases-list">
        <div v-for="release in releases" :key="release.id" class="release-item">
          <div class="release-header">
            <div class="release-badge">
              <el-icon class="text-primary"><Flag /></el-icon>
            </div>
            <div class="release-info">
              <div class="release-name">
                <el-link :href="release.html_url" target="_blank" type="primary">
                  <span class="release-tag">{{ release.tag_name }}</span>
                </el-link>
                <el-tag
                  v-if="release.prerelease"
                  type="warning"
                  size="small"
                  effect="plain"
                >
                  预发布
                </el-tag>
                <el-tag v-else type="success" size="small" effect="plain">
                  稳定版
                </el-tag>
                <el-tag
                  v-if="release.draft"
                  type="info"
                  size="small"
                  effect="plain"
                >
                  草稿
                </el-tag>
              </div>
              <div class="release-meta">
                <span class="release-author">
                  <el-avatar :size="20" :src="release.author?.avatar_url" />
                  <span>{{ release.author?.login }}</span>
                </span>
                <span class="release-date">{{ formatDate(release.published_at || release.created_at) }}</span>
              </div>
            </div>
          </div>
          <div class="release-body" v-if="release.body">
            {{ release.body.substring(0, 200) }}{{ release.body.length > 200 ? '...' : '' }}
          </div>
          <div class="release-assets" v-if="release.assets?.length > 0">
            <div class="assets-title">下载资源 ({{ release.assets.length }})</div>
            <div class="assets-list">
              <div
                v-for="asset in release.assets"
                :key="asset.id"
                class="asset-item"
              >
                <el-icon class="text-primary"><FolderOpened /></el-icon>
                <span class="asset-name">{{ asset.name }}</span>
                <span class="asset-size">{{ formatFileSize(asset.size) }}</span>
                <span class="asset-downloads">
                  <el-icon><Download /></el-icon>
                  {{ asset.download_count }}
                </span>
                <el-button type="primary" link size="small" @click="downloadAsset(asset)">
                  下载
                </el-button>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-if="releases.length === 0" description="暂无版本发布" />
      </div>
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalReleases"
          layout="prev, pager, next"
          @current-change="loadReleases"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { useAppStore } from '@/stores/app';
import { getReleases, getMilestones, getReleasePipelineStatus } from '@/api/release';

const appStore = useAppStore();

const loading = ref(false);
const releases = ref<any[]>([]);
const milestones = ref<any[]>([]);
const pipelineStatus = ref<any>(null);
const currentPage = ref(1);
const pageSize = ref(10);
const totalReleases = ref(0);

const trendChartRef = ref<HTMLElement>();
const downloadChartRef = ref<HTMLElement>();

let trendChart: echarts.ECharts | null = null;
let downloadChart: echarts.ECharts | null = null;

const stats = computed(() => {
  const totalAssets = releases.value.reduce((sum, r) => sum + (r.assets?.length || 0), 0);
  const totalDownloads = releases.value.reduce((sum, r) => {
    return sum + (r.assets?.reduce((s: number, a: any) => s + (a.download_count || 0), 0) || 0);
  }, 0);

  return {
    totalReleases: releases.value.length,
    totalAssets,
    totalDownloads,
  };
});

const daysSinceLastRelease = computed(() => {
  if (releases.value.length === 0) return 0;
  const lastRelease = releases.value[0];
  const publishDate = dayjs(lastRelease.published_at || lastRelease.created_at);
  return dayjs().diff(publishDate, 'day');
});

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD');
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getMilestoneType(state: string): string {
  return state === 'open' ? 'warning' : 'success';
}

function getMilestoneTagType(state: string): string {
  return state === 'open' ? 'warning' : 'success';
}

function getMilestoneProgress(milestone: any): number {
  const total = milestone.open_issues + milestone.closed_issues;
  if (total === 0) return 0;
  return Math.round((milestone.closed_issues / total) * 100);
}

function getRunType(conclusion: string): string {
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

function viewMilestones() {
  window.open(`https://github.com/${appStore.repositoryOwner}/${appStore.repositoryName}/milestones`, '_blank');
}

function downloadAsset(asset: any) {
  window.open(asset.browser_download_url, '_blank');
}

async function loadReleases() {
  loading.value = true;
  try {
    const [releasesData, milestonesData, pipelineData] = await Promise.all([
      getReleases(appStore.repositoryOwner, appStore.repositoryName, currentPage.value, pageSize.value),
      getMilestones(appStore.repositoryOwner, appStore.repositoryName, 'all'),
      getReleasePipelineStatus(appStore.repositoryOwner, appStore.repositoryName),
    ]);

    releases.value = releasesData || [];
    milestones.value = milestonesData || [];
    pipelineStatus.value = pipelineData;
    totalReleases.value = releases.value.length;

    await nextTick();
    initCharts();
  } catch (error) {
    console.error('加载发布数据失败:', error);
  } finally {
    loading.value = false;
  }
}

function initCharts() {
  initTrendChart();
  initDownloadChart();
}

function initTrendChart() {
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value);

    const monthMap: Record<string, number> = {};
    releases.value.forEach(release => {
      const month = dayjs(release.published_at || release.created_at).format('YYYY-MM');
      monthMap[month] = (monthMap[month] || 0) + 1;
    });

    const months = Object.keys(monthMap).sort().slice(-12);
    const data = months.map(month => monthMap[month] || 0);

    const option = {
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
        data: months.length > 0 ? months : ['暂无数据'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '发布数量',
          type: 'line',
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
            ]),
          },
          lineStyle: {
            color: '#409eff',
            width: 2,
          },
          itemStyle: {
            color: '#409eff',
          },
          data: data.length > 0 ? data : [0],
        },
      ],
    };

    trendChart.setOption(option);
  }
}

function initDownloadChart() {
  if (downloadChartRef.value) {
    downloadChart = echarts.init(downloadChartRef.value);

    const assetStats: Record<string, number> = {};
    releases.value.forEach(release => {
      release.assets?.forEach((asset: any) => {
        const name = asset.name.split('.').pop()?.toLowerCase() || 'unknown';
        assetStats[name] = (assetStats[name] || 0) + asset.download_count;
      });
    });

    const chartData = Object.entries(assetStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

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
          name: '下载分布',
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
            { value: 1, name: '暂无数据' },
          ],
        },
      ],
    };

    downloadChart.setOption(option);
  }
}

watch(
  () => [appStore.repositoryOwner, appStore.repositoryName],
  () => {
    currentPage.value = 1;
    loadReleases();
  },
);

onMounted(() => {
  loadReleases();

  window.addEventListener('resize', () => {
    trendChart?.resize();
    downloadChart?.resize();
  });
});
</script>

<style scoped lang="scss">
.releases-page {
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .milestone-card {
    .milestone-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .milestone-title {
        font-size: 14px;
        font-weight: 600;
      }
    }

    .milestone-info {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
    }
  }

  .pipeline-status {
    .pipeline-stat {
      text-align: center;

      .pipeline-stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #303133;
      }

      .pipeline-stat-label {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }
    }

    .latest-runs {
      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
      }

      .run-item {
        display: flex;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #ebeef5;

        &:last-child {
          border-bottom: none;
        }

        .run-status {
          margin-right: 12px;
        }

        .run-name {
          flex: 1;
          font-size: 13px;
          color: #606266;
        }

        .run-time {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .releases-list {
    .release-item {
      padding: 20px 0;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      .release-header {
        display: flex;
        align-items: flex-start;

        .release-badge {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #409eff 0%, #79bbff 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;

          .el-icon {
            font-size: 20px;
            color: #fff;
          }
        }

        .release-info {
          flex: 1;

          .release-name {
            display: flex;
            align-items: center;
            gap: 8px;

            .release-tag {
              font-size: 18px;
              font-weight: 700;
            }
          }

          .release-meta {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-top: 8px;
            font-size: 13px;
            color: #909399;

            .release-author {
              display: flex;
              align-items: center;
              gap: 6px;
            }
          }
        }
      }

      .release-body {
        margin-top: 12px;
        padding: 12px 16px;
        background: #f5f7fa;
        border-radius: 8px;
        font-size: 13px;
        color: #606266;
        line-height: 1.6;
      }

      .release-assets {
        margin-top: 12px;

        .assets-title {
          font-size: 13px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 8px;
        }

        .assets-list {
          .asset-item {
            display: flex;
            align-items: center;
            padding: 10px 16px;
            background: #fafafa;
            border-radius: 6px;
            margin-bottom: 6px;

            &:last-child {
              margin-bottom: 0;
            }

            .el-icon {
              font-size: 16px;
              margin-right: 8px;
            }

            .asset-name {
              flex: 1;
              font-size: 13px;
              color: #606266;
            }

            .asset-size,
            .asset-downloads {
              font-size: 12px;
              color: #909399;
              margin-right: 16px;
              display: flex;
              align-items: center;
              gap: 4px;
            }
          }
        }
      }
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>
