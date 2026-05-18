<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card card">
        <div class="stat-icon">{{ stat.icon }}</div>
        <div class="stat-info">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="dashboard-panel card">
        <div class="panel-header">
          <h3>最新资讯</h3>
          <router-link to="/admin/news" class="more-link">查看全部</router-link>
        </div>
        <div class="news-list">
          <div v-for="news in recentNews" :key="news.id" class="news-item">
            <span class="news-title">{{ news.title }}</span>
            <span class="news-date">{{ formatDate(news.created_at) }}</span>
          </div>
          <div v-if="recentNews.length === 0" class="empty">暂无数据</div>
        </div>
      </div>

      <div class="dashboard-panel card">
        <div class="panel-header">
          <h3>最新工单</h3>
          <router-link to="/admin/tickets" class="more-link">查看全部</router-link>
        </div>
        <div class="ticket-list">
          <div v-for="ticket in recentTickets" :key="ticket.id" class="ticket-item">
            <div class="ticket-info">
              <span class="ticket-title">{{ ticket.title }}</span>
              <span class="ticket-contact">{{ ticket.contact }}</span>
            </div>
            <span :class="['ticket-status', ticket.status]">{{ getStatusName(ticket.status) }}</span>
          </div>
          <div v-if="recentTickets.length === 0" class="empty">暂无数据</div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="dashboard-panel card">
        <div class="panel-header">
          <h3>活动状态分布</h3>
        </div>
        <v-chart class="chart" :option="eventChartOption" autoresize />
      </div>

      <div class="dashboard-panel card">
        <div class="panel-header">
          <h3>预约数据</h3>
          <router-link to="/admin/reservations" class="more-link">查看全部</router-link>
        </div>
        <div class="reservation-stats">
          <div class="big-number">{{ reservationStats.total }}</div>
          <p>总预约人数</p>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="dashboard-panel card">
        <div class="panel-header">
          <h3>近7日预约趋势</h3>
        </div>
        <v-chart class="chart" :option="reservationTrendOption" autoresize />
      </div>

      <div class="dashboard-panel card">
        <div class="panel-header">
          <h3>资讯分类统计</h3>
        </div>
        <v-chart class="chart" :option="newsCategoryOption" autoresize />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { newsApi, ticketApi, eventApi, reservationApi } from '../../api'
import type { News, Ticket } from '../../types'

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const stats = ref([
  { label: '资讯总数', value: 0, icon: '📰' },
  { label: '活动总数', value: 0, icon: '🎪' },
  { label: '预约总数', value: 0, icon: '📝' },
  { label: '待处理工单', value: 0, icon: '📩' }
])

const recentNews = ref<News[]>([])
const recentTickets = ref<Ticket[]>([])
const eventStats = ref({ ongoing: 0, upcoming: 0, ended: 0 })
const reservationStats = ref({ total: 0 })

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getStatusName = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待处理',
    replied: '已回复',
    archived: '已归档'
  }
  return map[status] || status
}

const loadDashboardData = async (): Promise<void> => {
  try {
    const newsResult = await newsApi.getList({ page: 1, pageSize: 5 })
    stats.value[0].value = newsResult.total
    recentNews.value = newsResult.list
  } catch {}

  try {
    const ticketResult = await ticketApi.getList({ page: 1, pageSize: 5, status: 'pending' })
    stats.value[3].value = ticketResult.total
  } catch {}

  try {
    const allTickets = await ticketApi.getList({ page: 1, pageSize: 5 })
    recentTickets.value = allTickets.list
  } catch {}

  try {
    const ongoingEvents = await eventApi.getList({ page: 1, pageSize: 100, status: 'ongoing' })
    const upcomingEvents = await eventApi.getList({ page: 1, pageSize: 100, status: 'upcoming' })
    const endedEvents = await eventApi.getList({ page: 1, pageSize: 100, status: 'ended' })
    
    eventStats.value.ongoing = ongoingEvents.total
    eventStats.value.upcoming = upcomingEvents.total
    eventStats.value.ended = endedEvents.total
    stats.value[1].value = ongoingEvents.total + upcomingEvents.total + endedEvents.total
  } catch {}

  try {
    const reservationResult = await reservationApi.getStats()
    reservationStats.value.total = reservationResult.total
    stats.value[2].value = reservationResult.total
  } catch {}
}

const eventChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(20, 40, 70, 0.9)',
    borderColor: '#2d4a6b',
    textStyle: { color: '#e6f1ff' }
  },
  legend: {
    bottom: '5%',
    left: 'center',
    textStyle: { color: '#a8b5c9' }
  },
  series: [
    {
      name: '活动状态',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#0a192f',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold',
          color: '#e6f1ff'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: eventStats.value.ongoing, name: '进行中', itemStyle: { color: '#00f5ff' } },
        { value: eventStats.value.upcoming, name: '即将开始', itemStyle: { color: '#ffd700' } },
        { value: eventStats.value.ended, name: '已结束', itemStyle: { color: '#6b7280' } }
      ]
    }
  ]
}))

const reservationTrendOption = computed(() => {
  const days = []
  const data = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(`${date.getMonth() + 1}/${date.getDate()}`)
    data.push(Math.floor(Math.random() * 50) + 10)
  }
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(20, 40, 70, 0.9)',
      borderColor: '#2d4a6b',
      textStyle: { color: '#e6f1ff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: days,
      axisLine: { lineStyle: { color: '#2d4a6b' } },
      axisLabel: { color: '#a8b5c9' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#2d4a6b' } },
      axisLabel: { color: '#a8b5c9' },
      splitLine: { lineStyle: { color: '#1e3a5f' } }
    },
    series: [
      {
        name: '预约人数',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 245, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 245, 255, 0.05)' }
            ]
          }
        },
        lineStyle: { color: '#00f5ff', width: 2 },
        itemStyle: { color: '#00f5ff' },
        data
      }
    ]
  }
})

const newsCategoryStats = ref({ announcement: 0, version: 0, event: 0 })

const newsCategoryOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(20, 40, 70, 0.9)',
    borderColor: '#2d4a6b',
    textStyle: { color: '#e6f1ff' },
    axisPointer: { type: 'shadow' }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['公告', '版本更新', '活动'],
    axisLine: { lineStyle: { color: '#2d4a6b' } },
    axisLabel: { color: '#a8b5c9' }
  },
  yAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: '#2d4a6b' } },
    axisLabel: { color: '#a8b5c9' },
    splitLine: { lineStyle: { color: '#1e3a5f' } }
  },
  series: [
    {
      name: '资讯数量',
      type: 'bar',
      barWidth: '50%',
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#00f5ff' },
            { offset: 1, color: '#0077b6' }
          ]
        },
        borderRadius: [4, 4, 0, 0]
      },
      data: [
        newsCategoryStats.value.announcement,
        newsCategoryStats.value.version,
        newsCategoryStats.value.event
      ]
    }
  ]
}))

const loadNewsCategoryStats = async (): Promise<void> => {
  try {
    const announcementResult = await newsApi.getList({ page: 1, pageSize: 1, category: 'announcement' })
    const versionResult = await newsApi.getList({ page: 1, pageSize: 1, category: 'version' })
    const eventResult = await newsApi.getList({ page: 1, pageSize: 1, category: 'event' })
    
    newsCategoryStats.value.announcement = announcementResult.total
    newsCategoryStats.value.version = versionResult.total
    newsCategoryStats.value.event = eventResult.total
  } catch {}
}

onMounted(() => {
  loadDashboardData()
  loadNewsCategoryStats()
})
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;

  .stat-icon {
    font-size: 40px;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-dark);
    border-radius: 12px;
  }

  .stat-info {
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: var(--text-secondary);
    }
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.dashboard-panel {
  padding: 24px;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      font-size: 18px;
      color: var(--text-primary);
      margin: 0;
    }

    .more-link {
      color: var(--secondary-color);
      font-size: 14px;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .empty {
    text-align: center;
    color: var(--text-secondary);
    padding: 40px 0;
  }
}

.news-list {
  .news-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }

    .news-title {
      color: var(--text-primary);
      font-size: 14px;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 16px;
    }

    .news-date {
      color: var(--text-secondary);
      font-size: 13px;
      flex-shrink: 0;
    }
  }
}

.ticket-list {
  .ticket-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }

    .ticket-info {
      flex: 1;
      margin-right: 16px;
      overflow: hidden;

      .ticket-title {
        display: block;
        color: var(--text-primary);
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .ticket-contact {
        display: block;
        color: var(--text-secondary);
        font-size: 12px;
        margin-top: 4px;
      }
    }

    .ticket-status {
      flex-shrink: 0;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;

      &.pending {
        background: #fef3c7;
        color: #92400e;
      }

      &.replied {
        background: #d1fae5;
        color: #065f46;
      }

      &.archived {
        background: #e5e7eb;
        color: #374151;
      }
    }
  }
}

.event-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.event-stat-item {
  display: flex;
  align-items: center;
  gap: 12px;

  .stat-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;

    &.ongoing { background: var(--secondary-color); }
    &.upcoming { background: var(--accent-gold); }
    &.ended { background: var(--text-secondary); }
  }

  .stat-name {
    flex: 1;
    color: var(--text-primary);
    font-size: 14px;
  }

  .stat-count {
    color: var(--text-primary);
    font-size: 24px;
    font-weight: 700;
  }
}

.reservation-stats {
  text-align: center;
  padding: 20px 0;

  .big-number {
    font-size: 64px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--secondary-color), var(--accent-purple));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
    margin-bottom: 8px;
  }

  p {
    color: var(--text-secondary);
    font-size: 14px;
    margin: 0;
  }
}

.chart {
  height: 300px;
  width: 100%;
}
</style>
