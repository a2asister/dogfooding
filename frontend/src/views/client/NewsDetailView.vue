<template>
  <div class="news-detail-page">
    <Header />

    <section class="hero-section">
      <div class="container">
        <h1>{{ news?.title || '资讯详情' }}</h1>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="detail-layout">
          <div class="detail-main">
            <div v-if="news" class="detail-content card" v-scroll-animate>
              <div class="detail-meta">
                <div class="meta-left">
                  <span class="detail-category">{{ getCategoryName(news.category) }}</span>
                  <span v-if="news.is_top" class="tag tag-top">置顶</span>
                  <span v-if="news.is_hot" class="tag tag-hot">热门</span>
                  <span v-if="news.is_recommend" class="tag tag-recommend">推荐</span>
                </div>
                <div class="meta-right">
                  <span class="detail-date">{{ formatDate(news.created_at) }}</span>
                  <span class="detail-views">👁️ {{ news.view_count }}</span>
                  <span v-if="news.share_count" class="detail-shares">🔗 {{ news.share_count }}</span>
                </div>
              </div>

              <div v-if="news.tags" class="detail-tags">
                <span 
                  v-for="tag in parseTags(news.tags)" 
                  :key="tag" 
                  class="tag-item"
                  @click="searchByTag(tag)"
                >
                  #{{ tag }}
                </span>
              </div>

              <div v-if="news.cover_image" class="detail-cover">
                <img :src="news.cover_image" :alt="news.title">
              </div>

              <div class="detail-body" v-html="news.content"></div>

              <div class="detail-actions">
                <ShareButtons 
                  :title="news.title" 
                  @share="handleShare"
                />
              </div>

              <div class="detail-footer">
                <router-link to="/news" class="back-link">← 返回列表</router-link>
              </div>

              <div class="prev-next-nav">
                <router-link 
                  v-if="news.prev" 
                  :to="`/news/${news.prev.id}`" 
                  class="nav-item prev"
                >
                  <span class="nav-label">← 上一篇</span>
                  <span class="nav-title">{{ news.prev.title }}</span>
                </router-link>
                <div v-else class="nav-item prev disabled">
                  <span class="nav-label">← 上一篇</span>
                  <span class="nav-title">没有更多了</span>
                </div>

                <router-link 
                  v-if="news.next" 
                  :to="`/news/${news.next.id}`" 
                  class="nav-item next"
                >
                  <span class="nav-label">下一篇 →</span>
                  <span class="nav-title">{{ news.next.title }}</span>
                </router-link>
                <div v-else class="nav-item next disabled">
                  <span class="nav-label">下一篇 →</span>
                  <span class="nav-title">没有更多了</span>
                </div>
              </div>
            </div>

            <div v-else class="loading">
              <el-icon :size="40" class="is-loading"><Loading /></el-icon>
              <p>加载中...</p>
            </div>
          </div>

          <aside class="detail-sidebar" v-scroll-animate="{ delay: 100 }">
            <div class="sidebar-card card">
              <h3 class="sidebar-title">🔥 热门推荐</h3>
              <div class="hot-list">
                <div 
                  v-for="(item, index) in hotRecommend" 
                  :key="item.id" 
                  class="hot-item"
                  @click="goToDetail(item.id)"
                >
                  <span class="hot-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
                  <span class="hot-title">{{ item.title }}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import ShareButtons from '../../components/ShareButtons.vue'
import { newsApi } from '../../api'
import type { News, NewsDetail } from '../../types'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const news = ref<NewsDetail | null>(null)
const hotRecommend = ref<News[]>([])

const getCategoryName = (category: string): string => {
  const map: Record<string, string> = {
    announcement: '公告',
    version: '版本更新',
    event: '活动'
  }
  return map[category] || category
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const parseTags = (tagsStr: string): string[] => {
  try {
    return JSON.parse(tagsStr)
  } catch {
    return tagsStr.split(',').map(t => t.trim()).filter(Boolean)
  }
}

const searchByTag = (tag: string): void => {
  router.push({ path: '/news', query: { keyword: tag } })
}

const goToDetail = (id: number): void => {
  router.push(`/news/${id}`)
}

const handleShare = async (): Promise<void> => {
  if (news.value) {
    try {
      await newsApi.incrementShare(news.value.id)
      if (news.value.share_count !== undefined) {
        news.value.share_count++
      }
    } catch {
      // ignore error
    }
  }
}

const loadNewsDetail = async (): Promise<void> => {
  const id = Number(route.params.id)
  if (!id) return

  try {
    const result = await newsApi.getDetail(id)
    news.value = result
    hotRecommend.value = result.hot_recommend || []
  } catch {
    news.value = null
    ElMessage.error('资讯不存在或已下线')
    router.push('/news')
  }
}

const loadHotRecommend = async (): Promise<void> => {
  try {
    const result = await newsApi.getHotRecommend(6)
    hotRecommend.value = result
  } catch {
    hotRecommend.value = []
  }
}

watch(() => route.params.id, () => {
  loadNewsDetail()
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

onMounted(() => {
  loadNewsDetail()
  loadHotRecommend()
})
</script>

<style scoped lang="scss">
.news-detail-page {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-purple));
  padding: 60px 0;
  text-align: center;

  h1 {
    font-size: 36px;
    color: white;
    max-width: 900px;
    margin: 0 auto;
  }
}

.section {
  padding: 60px 0;
}

.detail-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.detail-main {
  min-width: 0;
}

.detail-content {
  padding: 40px;
}

.detail-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: 12px;

  .meta-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .meta-right {
    display: flex;
    gap: 16px;
    align-items: center;

    span {
      font-size: 14px;
      color: var(--text-secondary);
    }
  }

  .detail-category {
    background: var(--accent-purple);
    color: white;
    padding: 6px 16px;
    border-radius: 4px;
    font-size: 14px;
  }
}

.tag {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;

  &.tag-top {
    background: var(--accent-red);
    color: white;
  }

  &.tag-hot {
    background: linear-gradient(135deg, #ff6b6b, #ff8e53);
    color: white;
  }

  &.tag-recommend {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    color: white;
  }
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;

  .tag-item {
    background: var(--bg-card-hover);
    color: var(--secondary-color);
    padding: 6px 14px;
    border-radius: 16px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s var(--ease-smooth);

    &:hover {
      background: var(--secondary-color);
      color: var(--bg-dark);
    }
  }
}

.detail-cover {
  margin-bottom: 30px;

  img {
    width: 100%;
    border-radius: 8px;
  }
}

.detail-body {
  color: var(--text-primary);
  line-height: 1.8;
  font-size: 16px;

  :deep(h1), :deep(h2), :deep(h3) {
    margin: 24px 0 16px;
    color: var(--secondary-color);
  }

  :deep(p) {
    margin-bottom: 16px;
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 8px;
    margin: 16px 0;
  }

  :deep(ul), :deep(ol) {
    margin: 16px 0;
    padding-left: 24px;
  }

  :deep(li) {
    margin-bottom: 8px;
  }

  :deep(.highlight) {
    background: rgba(255, 215, 0, 0.3);
    color: var(--accent-gold);
    padding: 0 2px;
    border-radius: 2px;
  }
}

.detail-actions {
  margin: 30px 0;
  display: flex;
  justify-content: flex-end;
}

.detail-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);

  .back-link {
    color: var(--secondary-color);
    font-size: 15px;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.8;
    }
  }
}

.prev-next-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid var(--border-color);

  .nav-item {
    padding: 20px;
    background: var(--bg-card-hover);
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.3s var(--ease-smooth);
    cursor: pointer;

    &:hover:not(.disabled) {
      background: var(--bg-input);
      transform: translateY(-2px);
    }

    &.prev {
      text-align: left;
    }

    &.next {
      text-align: right;
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .nav-label {
      display: block;
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .nav-title {
      display: block;
      font-size: 15px;
      color: var(--text-primary);
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.detail-sidebar {
  position: sticky;
  top: 20px;
  align-self: flex-start;
}

.sidebar-card {
  padding: 24px;

  .sidebar-title {
    font-size: 18px;
    color: var(--text-primary);
    margin: 0 0 20px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--secondary-color);
  }
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .hot-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s var(--ease-smooth);

    &:hover {
      background: var(--bg-card-hover);

      .hot-title {
        color: var(--secondary-color);
      }
    }

    .hot-rank {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      background: var(--bg-input);
      color: var(--text-secondary);
      flex-shrink: 0;

      &.rank-1 {
        background: linear-gradient(135deg, #ffd700, #ff8c00);
        color: white;
      }

      &.rank-2 {
        background: linear-gradient(135deg, #c0c0c0, #808080);
        color: white;
      }

      &.rank-3 {
        background: linear-gradient(135deg, #cd7f32, #8b4513);
        color: white;
      }
    }

    .hot-title {
      font-size: 14px;
      color: var(--text-primary);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}

.loading {
  text-align: center;
  padding: 60px 0;

  p {
    margin-top: 16px;
    color: var(--text-secondary);
  }

  .is-loading {
    color: var(--secondary-color);
    animation: rotate 1s linear infinite;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 992px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .detail-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 0;

    h1 {
      font-size: 24px;
    }
  }

  .detail-content {
    padding: 20px;
  }

  .prev-next-nav {
    grid-template-columns: 1fr;
  }
}
</style>
