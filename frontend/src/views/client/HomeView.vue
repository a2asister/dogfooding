<template>
  <div class="home-page">
    <Header />
    
    <BannerCarousel :banners="banners" />

    <section class="section highlights-section">
      <div class="container">
        <h2 class="section-title">游戏特色</h2>
        <div class="highlights-grid">
          <div v-for="item in highlights" :key="item.id" class="highlight-card card">
            <div class="highlight-icon">{{ item.icon }}</div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section news-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title" style="margin-bottom: 0;">最新资讯</h2>
          <router-link to="/news" class="more-link">查看更多 →</router-link>
        </div>
        <div class="news-grid">
          <div v-for="news in latestNews" :key="news.id" class="news-card card" @click="goToNews(news.id)">
            <img v-if="news.cover_image" :src="news.cover_image" :alt="news.title" class="news-cover">
            <div class="news-content">
              <span class="news-category">{{ getCategoryName(news.category) }}</span>
              <h3>{{ news.title }}</h3>
              <p class="news-date">{{ formatDate(news.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section events-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title" style="margin-bottom: 0;">热门活动</h2>
          <router-link to="/events" class="more-link">查看更多 →</router-link>
        </div>
        <div class="events-grid">
          <div v-for="event in ongoingEvents" :key="event.id" class="event-card card" @click="goToEvent(event)">
            <img v-if="event.cover_image" :src="event.cover_image" :alt="event.title" class="event-cover">
            <div class="event-status ongoing">进行中</div>
            <div class="event-content">
              <h3>{{ event.title }}</h3>
              <div v-if="event.description" class="event-desc" v-html="event.description"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section previews-section">
      <div class="container">
        <h2 class="section-title">精彩预览</h2>
        <div class="previews-grid">
          <div v-for="(preview, index) in previews" :key="index" class="preview-item">
            <img :src="preview.url" :alt="preview.title">
            <div class="preview-overlay">
              <span>{{ preview.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>立即加入星际幻想</h2>
          <p>开启你的宇宙冒险之旅，探索未知星系</p>
          <router-link to="/download" class="btn-primary">立即下载</router-link>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import BannerCarousel from '../../components/BannerCarousel.vue'
import { newsApi, eventApi, homeApi } from '../../api'
import type { Banner, Highlight, News, Event } from '../../types'

const banners = ref<Banner[]>([])
const highlights = ref<Highlight[]>([])
const latestNews = ref<News[]>([])
const ongoingEvents = ref<Event[]>([])
const previews = ref<{ url: string; title: string }[]>([])

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

const goToNews = (id: number): void => {
  window.location.href = `/news/${id}`
}

const loadHomeData = async (): Promise<void> => {
  try {
    const homeData = await homeApi.getHomeData()
    banners.value = homeData.banners as Banner[] || []
    highlights.value = homeData.highlights as Highlight[] || []
    previews.value = homeData.previews as { url: string; title: string }[] || []
  } catch {
    banners.value = [
      { id: 1, image: 'https://picsum.photos/1920/500?random=1', title: '星际幻想 正式公测开启', link: '/download' },
      { id: 2, image: 'https://picsum.photos/1920/500?random=2', title: '全新版本 破晓来临', link: '/news' },
      { id: 3, image: 'https://picsum.photos/1920/500?random=3', title: '跨服战场 荣耀开启', link: '/events' }
    ]
    highlights.value = [
      { id: 1, icon: '🎮', title: '极致画质', description: '4K超清画面，沉浸式游戏体验' },
      { id: 2, icon: '⚔️', title: '多元战斗', description: '丰富技能组合，策略对决' },
      { id: 3, icon: '🌍', title: '开放世界', description: '超大地图自由探索' },
      { id: 4, icon: '👥', title: '社交互动', description: '组队副本，公会争霸' }
    ]
    previews.value = [
      { url: 'https://picsum.photos/600/400?random=4', title: '战斗场景' },
      { url: 'https://picsum.photos/600/400?random=5', title: '角色展示' },
      { url: 'https://picsum.photos/600/400?random=6', title: '世界风光' }
    ]
  }

  try {
    latestNews.value = await newsApi.getLatest(3)
  } catch {
    latestNews.value = []
  }

  try {
    ongoingEvents.value = await eventApi.getOngoing(3)
  } catch {
    ongoingEvents.value = []
  }
}

const goToEvent = (event: Event): void => {
  if (event.link_url) {
    window.open(event.link_url, '_blank')
  } else {
    ElMessage.info('活动详情即将上线，敬请期待！')
  }
}

onMounted(() => {
  loadHomeData()
})
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
}

.section {
  padding: 80px 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
}

.more-link {
  color: var(--secondary-color);
  font-size: 15px;
  font-weight: 500;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.highlight-card {
  text-align: center;
  padding: 32px 24px;
  transition: all 0.3s ease;

  .highlight-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 20px;
    margin-bottom: 12px;
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
    font-size: 14px;
    margin: 0;
  }
}

.news-grid, .events-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.news-card, .event-card {
  overflow: hidden;
  cursor: pointer;
  padding: 0;

  .news-cover, .event-cover {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .news-content, .event-content {
    padding: 20px;
  }

  .news-category {
    display: inline-block;
    background: var(--accent-purple);
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 16px;
    margin-bottom: 8px;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .news-date {
    color: var(--text-secondary);
    font-size: 13px;
    margin: 0;
  }

  .event-status {
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
  }
}

.event-card {
  position: relative;
}

.previews-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.preview-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;

  img {
    width: 100%;
    height: 280px;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .preview-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    padding: 20px;

    span {
      color: white;
      font-size: 16px;
      font-weight: 600;
    }
  }

  &:hover img {
    transform: scale(1.05);
  }
}

.cta-section {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-purple));
  text-align: center;

  .cta-content {
    h2 {
      font-size: 36px;
      color: white;
      margin-bottom: 16px;
    }

    p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 18px;
      margin-bottom: 32px;
    }
  }
}

@media (max-width: 1200px) {
  .highlights-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .section {
    padding: 60px 0;
  }

  .news-grid, .events-grid, .previews-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .section {
    padding: 40px 0;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 24px;
  }

  .highlights-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .news-grid, .events-grid, .previews-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .highlight-card {
    padding: 24px 16px;

    .highlight-icon {
      font-size: 36px;
    }

    h3 {
      font-size: 18px;
    }
  }

  .cta-section {
    .cta-content {
      h2 {
        font-size: 28px;
      }

      p {
        font-size: 16px;
      }
    }
  }
}

@media (max-width: 576px) {
  .preview-item {
    img {
      height: 200px;
    }
  }

  .news-card, .event-card {
    .news-cover, .event-cover {
      height: 160px;
    }
  }
}
</style>
