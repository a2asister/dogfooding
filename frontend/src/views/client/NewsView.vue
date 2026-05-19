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
              placeholder="搜索资讯标题、内容、标签..."
              @keyup.enter="loadNews"
            >
            <button class="search-btn" @click="loadNews">🔍</button>
          </div>
        </div>

        <div class="news-list">
          <div 
            v-for="news in newsList" 
            :key="news.id" 
            class="news-item card" 
            @click="goToDetail(news.id)"
            v-scroll-animate
          >
            <div v-if="news.cover_image" class="news-cover">
              <LazyImage :src="news.cover_image" :alt="news.title" />
              <div class="cover-tags">
                <span v-if="news.is_top" class="cover-tag tag-top">置顶</span>
                <span v-if="news.is_hot" class="cover-tag tag-hot">热门</span>
                <span v-if="news.is_recommend" class="cover-tag tag-recommend">推荐</span>
              </div>
            </div>
            <div v-else class="news-cover no-cover">
              <span>{{ getCategoryName(news.category) }}</span>
            </div>
            <div class="news-info">
              <div class="news-meta">
                <span class="news-category">{{ getCategoryName(news.category) }}</span>
                <span class="news-date">{{ formatDate(news.created_at) }}</span>
                <span class="news-views">👁️ {{ news.view_count }}</span>
              </div>
              <h2 v-html="highlightKeyword(news.title)"></h2>
              <p class="news-summary" v-html="highlightKeyword(stripHtml(news.content).slice(0, 150)) + '...'"></p>
              <div class="news-footer">
                <div v-if="news.tags" class="news-tags">
                  <span 
                    v-for="tag in parseTags(news.tags).slice(0, 3)" 
                    :key="tag" 
                    class="news-tag"
                    @click.stop="searchByTag(tag)"
                  >
                    #{{ tag }}
                  </span>
                </div>
                <span class="read-more">阅读全文 →</span>
              </div>
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

        <div v-if="newsList.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>暂无相关资讯</p>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import LazyImage from '../../components/LazyImage.vue'
import { newsApi } from '../../api'
import type { News } from '../../types'
import { highlightText } from '../../utils/highlight'

const router = useRouter()
const route = useRoute()

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
const loading = ref(false)

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

const stripHtml = (html: string): string => {
  return html.replace(/<[^>]+>/g, '')
}

const highlightKeyword = (text: string): string => {
  if (!searchKeyword.value) return text
  return highlightText(text, searchKeyword.value)
}

const parseTags = (tagsStr: string): string[] => {
  try {
    return JSON.parse(tagsStr)
  } catch {
    return tagsStr.split(',').map(t => t.trim()).filter(Boolean)
  }
}

const goToDetail = (id: number): void => {
  router.push(`/news/${id}`)
}

const searchByTag = (tag: string): void => {
  searchKeyword.value = tag
  page.value = 1
  loadNews()
}

const loadNews = async (): Promise<void> => {
  loading.value = true
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
  } finally {
    loading.value = false
  }
}

watch(selectedCategory, () => {
  page.value = 1
  loadNews()
})

onMounted(() => {
  const queryKeyword = route.query.keyword as string
  if (queryKeyword) {
    searchKeyword.value = queryKeyword
  }
  loadNews()
})

onBeforeRouteUpdate(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
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

.search-box {
  display: flex;
  gap: 8px;

  input {
    padding: 10px 16px;
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-primary);
    border-radius: 8px;
    width: 280px;

    &:focus {
      outline: none;
      border-color: var(--secondary-color);
    }
  }

  .search-btn {
    padding: 10px 16px;
    background: var(--secondary-color);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s ease;

    &:hover {
      opacity: 0.9;
    }
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
  transition: all 0.3s var(--ease-smooth);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);

    .news-cover img {
      transform: scale(1.05);
    }
  }

  .news-cover {
    width: 300px;
    height: 180px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;

    :deep(img) {
      transition: transform 0.5s var(--ease-smooth);
    }

    &.no-cover {
      background: linear-gradient(135deg, var(--primary-color), var(--accent-purple));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      font-weight: 600;
    }

    .cover-tags {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      gap: 6px;

      .cover-tag {
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        color: white;

        &.tag-top {
          background: var(--accent-red);
        }

        &.tag-hot {
          background: linear-gradient(135deg, #ff6b6b, #ff8e53);
        }

        &.tag-recommend {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
        }
      }
    }
  }

  .news-info {
    flex: 1;
    padding: 20px 20px 20px 0;
    display: flex;
    flex-direction: column;
    min-width: 0;

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

      .news-date, .news-views {
        color: var(--text-secondary);
      }
    }

    h2 {
      font-size: 20px;
      margin-bottom: 12px;
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .news-summary {
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .news-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      gap: 12px;
    }

    .news-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .news-tag {
        background: var(--bg-card-hover);
        color: var(--secondary-color);
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--secondary-color);
          color: var(--bg-dark);
        }
      }
    }

    .read-more {
      color: var(--secondary-color);
      font-size: 14px;
      font-weight: 500;
      flex-shrink: 0;
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

.empty-state {
  text-align: center;
  padding: 80px 0;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  p {
    color: var(--text-secondary);
    font-size: 16px;
  }
}

:deep(.highlight) {
  background: rgba(255, 215, 0, 0.3);
  color: var(--accent-gold);
  padding: 0 2px;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 0;

    h1 {
      font-size: 32px;
    }

    p {
      font-size: 16px;
    }
  }

  .news-item {
    flex-direction: column;
    gap: 16px;

    .news-cover {
      width: 100%;
      height: 200px;
    }

    .news-info {
      padding: 0 16px 16px;
    }
  }

  .search-box input {
    width: 200px;
  }
}
</style>
