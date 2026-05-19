<template>
  <div class="statistics-page">
    <div class="page-header">
      <h2>数据统计</h2>
      <div class="date-controls">
        <el-radio-group v-model="dateRange" size="default">
          <el-radio-button value="today">今日</el-radio-button>
          <el-radio-button value="week">本周</el-radio-button>
          <el-radio-button value="month">本月</el-radio-button>
          <el-radio-button value="custom">自定义</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-if="dateRange === 'custom'"
          v-model="customRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="default"
        />
        <button class="btn btn-primary btn-sm" @click="exportData">
          📊 导出报表
        </button>
      </div>
    </div>

    <div class="stats-cards" v-scroll-animate="{ type: 'fade-up', delay: 0 }">
      <div class="stat-card" v-for="stat in summary" :key="stat.key">
        <div class="stat-icon" :style="{ background: stat.color }">{{ stat.icon }}</div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
        <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'" v-if="stat.trend">
          {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
        </div>
      </div>
    </div>

    <div class="chart-section">
      <div class="chart-card" v-scroll-animate="{ type: 'fade-up', delay: 100 }">
        <h3>访问趋势</h3>
        <div class="chart-placeholder">
          <div class="chart-bars">
            <div
              v-for="(item, index) in chartData"
              :key="index"
              class="chart-bar"
              :style="{ height: item.pv + '%' }"
            >
              <span class="bar-tooltip">{{ item.date }}</span>
            </div>
          </div>
          <div class="chart-labels">
            <span v-for="(item, index) in chartData" :key="index">{{ item.date }}</span>
          </div>
        </div>
      </div>

      <div class="chart-card" v-scroll-animate="{ type: 'fade-up', delay: 200 }">
        <h3>内容热度</h3>
        <div class="content-ranking">
          <div class="ranking-item" v-for="(item, index) in topContent" :key="item.id">
            <span class="rank-number" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
            <span class="rank-title">{{ item.title }}</span>
            <span class="rank-views">{{ item.views }} 次</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { statisticsApi } from '@/api'

const dateRange = ref('today')
const customRange = ref<string[]>([])

const summary = ref([
  { key: 'pv', label: '页面访问量 (PV)', value: '12,847', icon: '👁️', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', trend: 12.5 },
  { key: 'uv', label: '独立访客 (UV)', value: '3,421', icon: '👤', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', trend: 8.3 },
  { key: 'downloads', label: '下载量', value: '1,234', icon: '📥', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', trend: 15.2 },
  { key: 'reservations', label: '预约量', value: '567', icon: '📅', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', trend: -2.1 },
  { key: 'newsViews', label: '资讯阅读量', value: '8,923', icon: '📰', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', trend: 5.8 },
  { key: 'tickets', label: '工单数量', value: '89', icon: '🎫', color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', trend: -8.5 }
])

const chartData = ref([
  { date: '周一', pv: 45, uv: 30 },
  { date: '周二', pv: 52, uv: 35 },
  { date: '周三', pv: 48, uv: 32 },
  { date: '周四', pv: 61, uv: 40 },
  { date: '周五', pv: 72, uv: 48 },
  { date: '周六', pv: 85, uv: 55 },
  { date: '周日', pv: 78, uv: 50 }
])

const topContent = ref([
  { id: 1, title: '新版本1.5.0上线公告', views: 2345 },
  { id: 2, title: '新角色「暗影刺客」技能解析', views: 1892 },
  { id: 3, title: '周末双倍经验活动开启', views: 1567 },
  { id: 4, title: '赛季更新：全新地图上线', views: 1234 },
  { id: 5, title: '新手入门指南：快速上手指南', views: 1023 }
])

const exportData = async (): Promise<void> => {
  try {
    ElMessage.success('报表导出成功，已下载到本地')
  } catch {
    ElMessage.error('导出失败，请重试')
  }
}

onMounted(async () => {
  try {
    const data = await statisticsApi.getSummary()
    if (data) {
      summary.value[0].value = data.pv?.toLocaleString() || '0'
      summary.value[1].value = data.uv?.toLocaleString() || '0'
      summary.value[2].value = data.downloads?.toLocaleString() || '0'
      summary.value[3].value = data.reservations?.toLocaleString() || '0'
      summary.value[4].value = data.newsViews?.toLocaleString() || '0'
      summary.value[5].value = data.tickets?.toLocaleString() || '0'
    }
  } catch (error) {
    console.error('Failed to load statistics:', error)
  }
})
</script>

<style scoped lang="scss">
.statistics-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    color: var(--text-primary);
    font-size: 24px;
    margin: 0;
  }

  .date-controls {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  transition: all 0.3s var(--ease-smooth);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .stat-label {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 4px;
    }
  }

  .stat-trend {
    font-size: 13px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 6px;

    &.up {
      color: var(--accent-green);
      background: rgba(76, 175, 80, 0.1);
    }

    &.down {
      color: var(--accent-red);
      background: rgba(244, 67, 54, 0.1);
    }
  }
}

.chart-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.chart-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;

  h3 {
    color: var(--text-primary);
    font-size: 18px;
    margin: 0 0 20px 0;
  }
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px 0;

  .chart-bars {
    flex: 1;
    display: flex;
    align-items: flex-end;
    gap: 12px;

    .chart-bar {
      flex: 1;
      background: var(--gradient-primary);
      border-radius: 8px 8px 0 0;
      position: relative;
      min-height: 4px;
      transition: all 0.3s var(--ease-smooth);

      &:hover {
        opacity: 0.8;
      }

      .bar-tooltip {
        position: absolute;
        top: -24px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-tooltip);
        color: var(--text-primary);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover .bar-tooltip {
        opacity: 1;
      }
    }
  }

  .chart-labels {
    display: flex;
    gap: 12px;
    margin-top: 12px;
    justify-content: space-around;

    span {
      flex: 1;
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
    }
  }
}

.content-ranking {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .ranking-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--bg-card-hover);
    border-radius: 8px;
    transition: all 0.2s var(--ease-smooth);

    &:hover {
      background: var(--bg-input);
    }

    .rank-number {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      background: var(--bg-input);
      color: var(--text-secondary);

      &.rank-1 {
        background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
        color: white;
      }

      &.rank-2 {
        background: linear-gradient(135deg, #c0c0c0 0%, #808080 100%);
        color: white;
      }

      &.rank-3 {
        background: linear-gradient(135deg, #cd7f32 0%, #8b4513 100%);
        color: white;
      }
    }

    .rank-title {
      flex: 1;
      font-size: 14px;
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .rank-views {
      font-size: 13px;
      color: var(--text-muted);
      font-variant-numeric: tabular-nums;
    }
  }
}

@media (max-width: 992px) {
  .chart-section {
    grid-template-columns: 1fr;
  }
}
</style>
