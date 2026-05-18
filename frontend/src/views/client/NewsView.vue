<template>
  <div class="news-page">
    <Header />

    <section class="hero-section">
      <div class="container">
        <h1>新闻资讯</h1>
        <p>获取最新的游戏动态和活动信息</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="filters">
          <div class="category-tabs">
            <button
              v-for="cat in categories"
              :key="cat.value"
              :class="{ active: selectedCategory === cat.value }"
              @click="selectedCategory = cat.value"
            >
              {{ cat.label }}
            </button>
          </div>
          <div class="search-box">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索资讯..."
              @keyup.enter="loadNews"
            >
          </div>
        </div>

        <div class="news-list">
          <div v-for="news in newsList" :key="news.id" class="news-item card" @click="goToDetail(news.id)">
            <img v-if="news.cover_image" :src="news.cover_image" :alt="news.title" class="news-cover">
            <div class="news-info">
              <div class="news-meta">
                <span class="news-category">{{ getCategoryName(news.category) }}</span>
                <span class="news-date">{{ formatDate(news.created_at) }}</span>
                <span v-if="news.is_top" class="news-top">置顶</span>
              </div>
              <h2>{{ news.title }}</h2>
              <p class="news-summary">{{ news.content.replace(/<[^>]+>/g, '').slice(0, 150) }}...</p>
              <span class="read-more">阅读全文 →</span>
            </div>
          </div>
        </div>

        <div v-if="total > pageSize" class="pagination">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadNews"
            @current-change="loadNews"
          />
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { newsApi } from '../../api'
import type { News } from '../../types'

const router = useRouter()

const categories = [
  { label: '全部', value: '' },
  { label: '公告', value: 'announcement' },
  { label: '版本更新', value: 'version' },
  { label: '活动', value: 'event' }
]

const selectedCategory = ref('')
const searchKeyword = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const newsList = ref<News[]>([])

const getCategoryName = (category: string): string => {
  const map: Record<string, string> = {
    announcement: '公告',
    version: '版本更新',
    event: '活动'
  }
  return map[category] || category
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const goToDetail = (id: number): void => {
  router.push(`/news/${id}`)
}

const loadNews = async (): Promise<void> => {
  try {
    const result = await newsApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      category: selectedCategory.value || undefined,
      keyword: searchKeyword.value || undefined
    })
    newsList.value = result.list
    total.value = result.total
  } catch {
    newsList.value = []
  }
}

watch(selectedCategory, () => {
  page.value = 1
  loadNews()
})

onMounted(() => {
  loadNews()
})
</script>

<style scoped lang="scss">
.news-page {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;
}

.category-tabs {
  display: flex;
  gap: 12px;

  button {
    padding: 10px 24px;
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

.search-box input {
  padding: 10px 16px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  border-radius: 8px;
  width: 250px;

  &:focus {
    outline: none;
    border-color: var(--secondary-color);
  }
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.news-item {
  display: flex;
  gap: 24px;
  cursor: pointer;
  padding: 0;
  overflow: hidden;

  .news-cover {
    width: 300px;
    height: 180px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .news-info {
    flex: 1;
    padding: 20px 20px 20px 0;
    display: flex;
    flex-direction: column;

    .news-meta {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 12px;

      span {
        font-size: 13px;
      }

      .news-category {
        background: var(--accent-purple);
        color: white;
        padding: 4px 12px;
        border-radius: 4px;
      }

      .news-date {
        color: var(--text-secondary);
      }

      .news-top {
        background: var(--secondary-color);
        color: var(--bg-dark);
        padding: 4px 12px;
        border-radius: 4px;
        font-weight: 600;
      }
    }

    h2 {
      font-size: 20px;
      margin-bottom: 12px;
      color: var(--text-primary);
    }

    .news-summary {
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: auto;
    }

    .read-more {
      color: var(--secondary-color);
      font-size: 14px;
      font-weight: 500;
      margin-top: 12px;
    }
  }
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
