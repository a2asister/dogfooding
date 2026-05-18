<template>
  <div class="events-page">
    <Header />

    <section class="hero-section">
      <div class="container">
        <h1>活动中心</h1>
        <p>参与精彩活动，赢取丰厚奖励</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="filters">
          <div class="status-tabs">
            <button
              v-for="status in statusOptions"
              :key="status.value"
              :class="{ active: selectedStatus === status.value }"
              @click="selectedStatus = status.value"
            >
              {{ status.label }}
            </button>
          </div>
        </div>

        <div class="events-grid">
          <div v-for="event in eventsList" :key="event.id" class="event-card card" @click="joinEvent(event)">
            <div class="event-image">
              <img v-if="event.cover_image" :src="event.cover_image" :alt="event.title">
              <div :class="['event-badge', event.status]">{{ getStatusName(event.status) }}</div>
            </div>
            <div class="event-info">
              <h3>{{ event.title }}</h3>
              <div v-if="event.description" class="event-desc" v-html="event.description"></div>
              <div class="event-time" v-if="event.start_time && event.end_time">
                <span>活动时间：{{ formatDate(event.start_time) }} - {{ formatDate(event.end_time) }}</span>
              </div>
              <div class="event-actions">
                <button
                  v-if="event.status === 'ongoing'"
                  class="btn-primary event-btn"
                  @click.stop="joinEvent(event)"
                >
                  立即参与
                </button>
                <button
                  v-else-if="event.status === 'upcoming'"
                  class="event-btn upcoming"
                  disabled
                >
                  即将开始
                </button>
                <button
                  v-else
                  class="event-btn ended"
                  disabled
                >
                  已结束
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="eventsList.length === 0" class="empty-state">
          <p>暂无活动</p>
        </div>

        <div v-if="total > pageSize" class="pagination">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[6, 12, 24]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadEvents"
            @current-change="loadEvents"
          />
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { eventApi } from '../../api'
import type { Event } from '../../types'

const statusOptions = [
  { label: '全部', value: '' },
  { label: '进行中', value: 'ongoing' },
  { label: '即将开始', value: 'upcoming' },
  { label: '已结束', value: 'ended' }
]

const selectedStatus = ref('')
const page = ref(1)
const pageSize = ref(6)
const total = ref(0)
const eventsList = ref<Event[]>([])

const getStatusName = (status: string): string => {
  const map: Record<string, string> = {
    ongoing: '进行中',
    upcoming: '即将开始',
    ended: '已结束'
  }
  return map[status] || status
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const joinEvent = (event: Event): void => {
  if (event.link_url) {
    window.open(event.link_url, '_blank')
  } else {
    ElMessage.info('活动参与链接即将上线，敬请期待！')
  }
}

const loadEvents = async (): Promise<void> => {
  try {
    const result = await eventApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      status: selectedStatus.value || undefined
    })
    eventsList.value = result.list
    total.value = result.total
  } catch {
    eventsList.value = []
  }
}

watch(selectedStatus, () => {
  page.value = 1
  loadEvents()
})

onMounted(() => {
  loadEvents()
})
</script>

<style scoped lang="scss">
.events-page {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-purple));
  padding: 80px 0;
  text-align: center;

  h1 {
    font-size: 48px;
    color: white;
    margin-bottom: 16px;
  }

  p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 20px;
  }
}

.section {
  padding: 60px 0;
}

.filters {
  margin-bottom: 40px;
}

.status-tabs {
  display: flex;
  gap: 12px;
  justify-content: center;

  button {
    padding: 10px 32px;
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-secondary);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover, &.active {
      border-color: var(--secondary-color);
      color: var(--secondary-color);
    }

    &.active {
      background: var(--secondary-color);
      color: var(--bg-dark);
    }
  }
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.event-card {
  overflow: hidden;
  padding: 0;
  cursor: pointer;

  .event-image {
    position: relative;
    height: 220px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .event-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;

      &.ongoing {
        background: var(--secondary-color);
        color: var(--bg-dark);
      }

      &.upcoming {
        background: var(--accent-gold);
        color: var(--bg-dark);
      }

      &.ended {
        background: var(--text-secondary);
        color: white;
      }
    }
  }

  &:hover .event-image img {
    transform: scale(1.05);
  }
}

.event-info {
  padding: 24px;

  h3 {
    font-size: 18px;
    margin-bottom: 12px;
    color: var(--text-primary);
  }

  .event-desc {
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 16px;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .event-time {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 20px;
  }

  .event-btn {
    width: 100%;
    padding: 10px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &.upcoming {
      background: var(--accent-gold);
      color: var(--bg-dark);
      cursor: not-allowed;
      opacity: 0.7;
    }

    &.ended {
      background: var(--border-color);
      color: var(--text-secondary);
      cursor: not-allowed;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: var(--text-secondary);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;

  :deep(.el-pagination) {
    --el-pagination-bg-color: var(--bg-card);
    --el-pagination-text-color: var(--text-secondary);
    --el-pagination-hover-color: var(--secondary-color);
    --el-pagination-button-bg-color: var(--bg-card);
    --el-pagination-button-disabled-bg-color: var(--bg-dark);
  }
}
</style>
