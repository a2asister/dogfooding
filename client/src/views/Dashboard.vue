<template>
  <div>
    <header class="main-header">
      <h1 class="page-title">仪表盘</h1>
      <div class="header-actions">
        <span class="text-muted text-sm">
          最后更新: {{ lastUpdateTime }}
        </span>
        <button class="btn btn-outline btn-sm" @click="loadData">
          刷新
        </button>
      </div>
    </header>
    <div class="main-body">
      <div class="grid grid-4 mb-4">
        <div class="stat-card">
          <div class="stat-icon primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
              <path d="M12 2v4"/>
              <path d="M12 18v4"/>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ overview?.circuitBreakers?.total || 0 }}</div>
            <div class="stat-label">熔断器总数</div>
            <div class="flex gap-2 mt-1">
              <span v-if="overview?.circuitBreakers?.open" class="badge badge-danger">
                {{ overview.circuitBreakers.open }} 开启
              </span>
              <span v-if="overview?.circuitBreakers?.halfOpen" class="badge badge-warning">
                {{ overview.circuitBreakers.halfOpen }} 半开
              </span>
              <span class="badge badge-success">
                {{ overview?.circuitBreakers?.closed || 0 }} 关闭
              </span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ overview?.rateLimiters?.enabled || 0 }}</div>
            <div class="stat-label">激活的限流器</div>
            <div class="flex gap-2 mt-1">
              <span class="badge badge-info">
                {{ overview?.rateLimiters?.adaptive || 0 }} 自适应
              </span>
              <span class="text-muted text-sm">
                共 {{ overview?.rateLimiters?.total || 0 }} 个
              </span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ overview?.isolation?.activeRequests || 0 }}</div>
            <div class="stat-label">活动请求</div>
            <div class="flex gap-2 mt-1">
              <span class="badge badge-secondary">
                {{ overview?.isolation?.queuedRequests || 0 }} 排队
              </span>
              <span v-if="overview?.isolation?.rejectedRequests" class="badge badge-danger">
                {{ overview.isolation.rejectedRequests }} 拒绝
              </span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon danger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ overview?.chaosExperiments?.running || 0 }}</div>
            <div class="stat-label">运行中的演练</div>
            <div class="flex gap-2 mt-1">
              <span v-if="overview?.chaosExperiments?.paused" class="badge badge-warning">
                {{ overview.chaosExperiments.paused }} 暂停
              </span>
              <span class="text-muted text-sm">
                共 {{ overview?.chaosExperiments?.total || 0 }} 个
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-2 mb-4">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">请求统计</h3>
          </div>
          <div class="card-body">
            <div class="chart-container small">
              <Bar :data="metricsChartData" :options="chartOptions" />
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">成功率 & 响应时间</h3>
          </div>
          <div class="card-body">
            <div class="chart-container small">
              <Line :data="successRateChartData" :options="lineChartOptions" />
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">熔断器状态</h3>
          </div>
          <div class="card-body">
            <div class="table-container" v-if="circuitBreakers.length > 0">
              <table class="table">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>状态</th>
                    <th>失败率</th>
                    <th>慢调用率</th>
                    <th>总调用</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="circuit in circuitBreakers" :key="circuit.id">
                    <td class="font-semibold">{{ circuit.name }}</td>
                    <td>
                      <span :class="['badge', getStatusBadgeClass(circuit.state)]">
                        {{ getStatusText(circuit.state) }}
                      </span>
                    </td>
                    <td>
                      <div class="flex items-center gap-2">
                        <div class="progress-bar" style="width: 80px;">
                          <div 
                            :class="['progress-bar-fill', circuit.failureRate > 30 ? 'warning' : 'success']"
                            :style="{ width: circuit.failureRate + '%' }"
                          ></div>
                        </div>
                        <span :class="circuit.failureRate > 30 ? 'text-warning' : 'text-success'">
                          {{ circuit.failureRate.toFixed(1) }}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div class="flex items-center gap-2">
                        <div class="progress-bar" style="width: 80px;">
                          <div 
                            :class="['progress-bar-fill', circuit.slowCallRate > 30 ? 'warning' : 'success']"
                            :style="{ width: circuit.slowCallRate + '%' }"
                          ></div>
                        </div>
                        <span :class="circuit.slowCallRate > 30 ? 'text-warning' : 'text-success'">
                          {{ circuit.slowCallRate.toFixed(1) }}%
                        </span>
                      </div>
                    </td>
                    <td>{{ circuit.metrics?.totalCalls || 0 }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state">
              <div class="empty-state-icon">🔌</div>
              <div class="empty-state-text">暂无熔断器配置</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">限流器状态</h3>
          </div>
          <div class="card-body">
            <div class="table-container" v-if="rateLimiters.length > 0">
              <table class="table">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>类型</th>
                    <th>当前限制</th>
                    <th>剩余</th>
                    <th>自适应</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="limiter in rateLimiters" :key="limiter.id">
                    <td class="font-semibold">{{ limiter.name }}</td>
                    <td>
                      <span class="badge badge-secondary">
                        {{ getLimitTypeText(limiter.limitType) }}
                      </span>
                    </td>
                    <td>
                      <span class="font-bold">{{ limiter.currentLimit }}</span>
                      <span v-if="limiter.currentLimit !== limiter.baseLimit" class="text-muted text-sm ml-1">
                        (基础: {{ limiter.baseLimit }})
                      </span>
                    </td>
                    <td>
                      <div class="flex items-center gap-2">
                        <div class="progress-bar" style="width: 100px;">
                          <div 
                            class="progress-bar-fill primary"
                            :style="{ width: (limiter.remaining / limiter.currentLimit) * 100 + '%' }"
                          ></div>
                        </div>
                        <span class="text-sm">{{ limiter.remaining }}</span>
                      </div>
                    </td>
                    <td>
                      <span v-if="limiter.adaptive" class="badge badge-info">
                        已启用
                      </span>
                      <span v-else class="text-muted">未启用</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state">
              <div class="empty-state-icon">⚡</div>
              <div class="empty-state-text">暂无限流器配置</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Bar, Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type {
  DashboardOverview,
  CircuitBreakerListItem,
  RateLimiterListItem,
  MetricsHistoryItem,
} from '@/types';
import { dashboardApi } from '@/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const overview = ref<DashboardOverview | null>(null);
const circuitBreakers = ref<CircuitBreakerListItem[]>([]);
const rateLimiters = ref<RateLimiterListItem[]>([]);
const metricsHistory = ref<MetricsHistoryItem[]>([]);
const lastUpdateTime = ref('--:--:--');

let refreshInterval: ReturnType<typeof setInterval> | null = null;

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        color: '#a1a1aa',
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(45, 55, 72, 0.5)',
      },
      ticks: {
        color: '#a1a1aa',
      },
    },
    y: {
      grid: {
        color: 'rgba(45, 55, 72, 0.5)',
      },
      ticks: {
        color: '#a1a1aa',
      },
    },
  },
};

const lineChartOptions = {
  ...chartOptions,
  scales: {
    ...chartOptions.scales,
    y: {
      ...chartOptions.scales.y,
      min: 0,
      max: 100,
    },
  },
};

const metricsChartData = computed(() => {
  const labels = metricsHistory.value.slice(-12).map(m => {
    const date = new Date(m.timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  });

  return {
    labels,
    datasets: [
      {
        label: '成功',
        data: metricsHistory.value.slice(-12).map(m => m.successCount),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: '失败',
        data: metricsHistory.value.slice(-12).map(m => m.failureCount),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };
});

const successRateChartData = computed(() => {
  const labels = metricsHistory.value.slice(-12).map(m => {
    const date = new Date(m.timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  });

  return {
    labels,
    datasets: [
      {
        label: '成功率 (%)',
        data: metricsHistory.value.slice(-12).map(m => m.successRate),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };
});

const getStatusBadgeClass = (state: string) => {
  switch (state) {
    case 'open': return 'badge-danger';
    case 'half_open': return 'badge-warning';
    default: return 'badge-success';
  }
};

const getStatusText = (state: string) => {
  switch (state) {
    case 'open': return '开启';
    case 'half_open': return '半开';
    default: return '关闭';
  }
};

const getLimitTypeText = (type: string) => {
  const types: Record<string, string> = {
    fixed_window: '固定窗口',
    sliding_window: '滑动窗口',
    token_bucket: '令牌桶',
    leaky_bucket: '漏桶',
  };
  return types[type] || type;
};

const loadData = async () => {
  try {
    const [overviewData, circuits, limiters, history] = await Promise.all([
      dashboardApi.getOverview(),
      dashboardApi.getCircuitBreakers(),
      dashboardApi.getRateLimiters(),
      dashboardApi.getMetricsHistory(),
    ]);
    
    overview.value = overviewData;
    circuitBreakers.value = circuits;
    rateLimiters.value = limiters;
    metricsHistory.value = history;
    
    const now = new Date();
    lastUpdateTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
};

onMounted(() => {
  loadData();
  refreshInterval = setInterval(loadData, 5000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
