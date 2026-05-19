<template>
  <Layout>
    <div class="analytics-page">
      <div class="page-header">
        <div>
          <h1>数据统计</h1>
          <p>全维度数据分析，助力运营决策</p>
        </div>
        <div class="header-actions">
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

      <div v-loading="loading" class="analytics-content">
        <div class="stats-overview">
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">今日UV</span>
              <el-tooltip content="独立访客数">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="stat-value">{{ overview?.todayUV || 0 }}</div>
            <div class="stat-trend up" v-if="overview?.todayUV">
              <el-icon><Top /></el-icon>
              12.5%
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">今日PV</span>
              <el-tooltip content="页面浏览量">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="stat-value">{{ overview?.todayPV || 0 }}</div>
            <div class="stat-trend up" v-if="overview?.todayPV">
              <el-icon><Top /></el-icon>
              8.3%
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">新增用户</span>
            </div>
            <div class="stat-value">{{ overview?.todayNewUsers || 0 }}</div>
            <div class="stat-trend down" v-if="overview?.todayNewUsers">
              <el-icon><Bottom /></el-icon>
              3.2%
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">活跃用户</span>
            </div>
            <div class="stat-value">{{ overview?.todayActiveUsers || 0 }}</div>
            <div class="stat-trend up" v-if="overview?.todayActiveUsers">
              <el-icon><Top /></el-icon>
              15.7%
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">今日收入</span>
            </div>
            <div class="stat-value">¥{{ overview?.todayRevenue || 0 }}</div>
            <div class="stat-trend up" v-if="overview?.todayRevenue">
              <el-icon><Top /></el-icon>
              22.1%
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">转化率</span>
            </div>
            <div class="stat-value">{{ (overview?.avgConversionRate || 0).toFixed(2) }}%</div>
            <div class="stat-trend up" v-if="overview?.avgConversionRate">
              <el-icon><Top /></el-icon>
              2.4%
            </div>
          </div>
        </div>

        <el-row :gutter="20" class="charts-section">
          <el-col :span="12">
            <div class="chart-card">
              <div class="chart-header">
                <h3>流量趋势</h3>
                <el-radio-group v-model="trafficMetric" size="small">
                  <el-radio-button value="uv">UV</el-radio-button>
                  <el-radio-button value="pv">PV</el-radio-button>
                </el-radio-group>
              </div>
              <div class="chart-content">
                <div class="chart-placeholder">
                  <div class="trend-bars">
                    <div
                      v-for="i in 7"
                      :key="i"
                      class="bar"
                      :style="{ height: `${Math.random() * 80 + 20}%` }"
                    >
                      <span class="bar-label">{{ Math.floor(Math.random() * 10000) }}</span>
                    </div>
                  </div>
                  <div class="chart-labels">
                    <span v-for="i in 7" :key="i">{{ getDayLabel(i) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-card">
              <div class="chart-header">
                <h3>用户留存</h3>
              </div>
              <div class="chart-content">
                <div class="retention-stats">
                  <div class="retention-item">
                    <div class="retention-value">{{ (overview?.avgRetentionDay1 || 0).toFixed(1) }}%</div>
                    <div class="retention-label">次日留存</div>
                  </div>
                  <div class="retention-item">
                    <div class="retention-value">{{ (overview?.avgRetentionDay7 || 0).toFixed(1) }}%</div>
                    <div class="retention-label">7日留存</div>
                  </div>
                  <div class="retention-item">
                    <div class="retention-value">18.5%</div>
                    <div class="retention-label">30日留存</div>
                  </div>
                </div>
                <div class="retention-chart">
                  <div class="retention-bars">
                    <div class="retention-bar" style="width: 65%">
                      <span>次日留存 65.0%</span>
                    </div>
                    <div class="retention-bar" style="width: 35%">
                      <span>7日留存 35.0%</span>
                    </div>
                    <div class="retention-bar" style="width: 18%">
                      <span>30日留存 18.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="charts-section">
          <el-col :span="8">
            <div class="chart-card">
              <div class="chart-header">
                <h3>流量来源</h3>
              </div>
              <div class="chart-content">
                <div class="source-list">
                  <div
                    v-for="source in overview?.trafficSources || mockSources"
                    :key="source.source"
                    class="source-item"
                  >
                    <div class="source-header">
                      <span class="source-name">{{ getSourceName(source.source) }}</span>
                      <span class="source-count">{{ source.count }}</span>
                    </div>
                    <el-progress
                      :percentage="source.percentage"
                      :stroke-width="6"
                      :color="getSourceColor(source.source)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="16">
            <div class="chart-card">
              <div class="chart-header">
                <h3>热门作品</h3>
                <el-button type="primary" link size="small" @click="$router.push('/analytics/content')">
                  查看全部
                </el-button>
              </div>
              <div class="chart-content">
                <el-table :data="overview?.topNotes || mockTopNotes" size="small">
                  <el-table-column prop="title" label="作品名称" min-width="200" show-overflow-tooltip />
                  <el-table-column prop="views" label="浏览量" width="100" />
                  <el-table-column label="互动率" width="100">
                    <template #default="{ row }">
                      <span :class="row.engagementRate > 5 ? 'rate-high' : 'rate-normal'">
                        {{ row.engagementRate.toFixed(2) }}%
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="80">
                    <template #default="{ row }">
                      <el-button
                        type="primary"
                        link
                        size="small"
                        @click="$router.push(`/note/${row.noteId}`)"
                      >
                        查看
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-col>
        </el-row>

        <div class="chart-card">
          <div class="chart-header">
            <h3>每日数据明细</h3>
          </div>
          <div class="chart-content">
            <el-table :data="dailyStats" border stripe size="small">
              <el-table-column prop="date" label="日期" width="120" />
              <el-table-column prop="uniqueVisitors" label="UV" width="100" />
              <el-table-column prop="pageViews" label="PV" width="100" />
              <el-table-column prop="newUsers" label="新增用户" width="100" />
              <el-table-column prop="activeUsers" label="活跃用户" width="100" />
              <el-table-column prop="newNotes" label="新增笔记" width="100" />
              <el-table-column prop="newViews" label="新增浏览" width="100" />
              <el-table-column prop="newLikes" label="新增点赞" width="100" />
              <el-table-column prop="newComments" label="新增评论" width="100" />
              <el-table-column label="次日留存" width="100">
                <template #default="{ row }">
                  {{ (row.retentionDay1 || 0).toFixed(1) }}%
                </template>
              </el-table-column>
              <el-table-column label="7日留存" width="100">
                <template #default="{ row }">
                  {{ (row.retentionDay7 || 0).toFixed(1) }}%
                </template>
              </el-table-column>
              <el-table-column label="收入" width="100">
                <template #default="{ row }">
                  ¥{{ row.totalRevenue || 0 }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Refresh,
  QuestionFilled,
  Top,
  Bottom,
} from '@element-plus/icons-vue';
import Layout from '@/components/Layout.vue';
import { getAnalyticsOverview, getDailyStats } from '@/api/analytics';
import type { AnalyticsOverview, DailySiteStats } from '@/types';
import dayjs from 'dayjs';

const loading = ref(false);
const overview = ref<AnalyticsOverview | null>(null);
const dailyStats = ref<DailySiteStats[]>([]);
const dateRange = ref<[Date, Date]>([
  dayjs().subtract(6, 'day').toDate(),
  dayjs().toDate(),
]);
const trafficMetric = ref('uv');

const mockSources = [
  { source: 'direct', count: 12500, percentage: 35 },
  { source: 'search', count: 8900, percentage: 25 },
  { source: 'social', count: 6700, percentage: 19 },
  { source: 'referral', count: 4500, percentage: 13 },
  { source: 'other', count: 3200, percentage: 8 },
];

const mockTopNotes = [
  { noteId: '1', title: '2024年最值得入手的美妆好物推荐', views: 125680, engagementRate: 8.5 },
  { noteId: '2', title: '探店｜这家咖啡店真的太好拍了', views: 98756, engagementRate: 6.2 },
  { noteId: '3', title: '穿搭分享｜春季必备的10件单品', views: 87654, engagementRate: 7.8 },
  { noteId: '4', title: '家居改造｜500元搞定出租屋', views: 76543, engagementRate: 5.4 },
  { noteId: '5', title: '数码评测｜这款手机值得买吗？', views: 65432, engagementRate: 9.1 },
];

const getDayLabel = (index: number) => {
  return dayjs().subtract(7 - index, 'day').format('MM/DD');
};

const getSourceName = (source: string) => {
  const map: Record<string, string> = {
    direct: '直接访问',
    search: '搜索引擎',
    social: '社交媒体',
    referral: '外链跳转',
    other: '其他',
  };
  return map[source] || source;
};

const getSourceColor = (source: string) => {
  const map: Record<string, string> = {
    direct: '#667eea',
    search: '#f093fb',
    social: '#43e97b',
    referral: '#fa709a',
    other: '#999',
  };
  return map[source] || '#999';
};

const fetchOverview = async () => {
  try {
    const res = await getAnalyticsOverview();
    overview.value = res.overview;
  } catch (error) {
    console.error('获取数据概览失败:', error);
  }
};

const fetchDailyStats = async () => {
  if (!dateRange.value?.[0] || !dateRange.value?.[1]) return;
  loading.value = true;
  try {
    const res = await getDailyStats({
      startDate: dayjs(dateRange.value[0]).format('YYYY-MM-DD'),
      endDate: dayjs(dateRange.value[1]).format('YYYY-MM-DD'),
    });
    dailyStats.value = res.stats;
  } catch (error) {
    console.error('获取每日统计失败:', error);
    ElMessage.error('获取数据失败');
  } finally {
    loading.value = false;
  }
};

const fetchData = () => {
  fetchOverview();
  fetchDailyStats();
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.analytics-page {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
  }

  p {
    color: #999;
    font-size: 14px;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 20px;

  .stat-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .stat-label {
        font-size: 13px;
        color: #999;
      }

      .help-icon {
        color: #ccc;
        cursor: help;
        font-size: 14px;
      }
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      line-height: 1.2;
      margin-bottom: 8px;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;

      &.up {
        color: #67c23a;
      }

      &.down {
        color: #f56c6c;
      }

      .el-icon {
        font-size: 12px;
      }
    }
  }
}

.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
  }
}

.chart-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  .trend-bars {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    height: 160px;

    .bar {
      flex: 1;
      background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
      border-radius: 4px 4px 0 0;
      position: relative;
      display: flex;
      justify-content: center;
      transition: all 0.3s;

      &:hover {
        opacity: 0.8;
      }

      .bar-label {
        position: absolute;
        top: -20px;
        font-size: 10px;
        color: #666;
      }
    }
  }

  .chart-labels {
    display: flex;
    gap: 8px;
    margin-top: 8px;

    span {
      flex: 1;
      text-align: center;
      font-size: 11px;
      color: #999;
    }
  }
}

.retention-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;

  .retention-item {
    text-align: center;

    .retention-value {
      font-size: 32px;
      font-weight: 700;
      color: #667eea;
    }

    .retention-label {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
  }
}

.retention-chart {
  .retention-bars {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .retention-bar {
      height: 32px;
      background: linear-gradient(90deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.1) 100%);
      border-radius: 4px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      transition: all 0.3s;

      span {
        font-size: 13px;
        color: #667eea;
        font-weight: 500;
      }
    }
  }
}

.source-list {
  .source-item {
    margin-bottom: 16px;

    .source-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;

      .source-name {
        font-size: 13px;
        color: #333;
      }

      .source-count {
        font-size: 13px;
        font-weight: 500;
        color: #666;
      }
    }
  }
}

.rate-high {
  color: #67c23a;
  font-weight: 600;
}

.rate-normal {
  color: #e6a23c;
}
</style>
