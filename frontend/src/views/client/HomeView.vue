<template>
  <div class="home-page">
    <Header />
    
    <section class="hero-section">
      <div class="video-background">
        <video
          v-if="heroVideoUrl"
          autoplay
          muted
          loop
          playsinline
          poster="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%20game%20banner%20futuristic%20dark%20blue%20neon&image_size=landscape_16_9"
        >
          <source :src="heroVideoUrl" type="video/mp4">
        </video>
        <div class="video-overlay"></div>
      </div>
      
      <div class="hero-content">
        <h1 class="hero-title" v-scroll-animate="'fade-down'">
          <span class="gradient-text">星际幻想</span>
        </h1>
        <p class="hero-subtitle" v-scroll-animate="{ animation: 'fade-up', delay: 200 }">
          开启你的宇宙冒险之旅，探索未知星系
        </p>
        <div class="hero-buttons" v-scroll-animate="{ animation: 'fade-up', delay: 400 }">
          <button class="btn btn-primary btn-lg" @click="playCGVideo">
            <span>🎬</span> 观看CG预告
          </button>
          <router-link to="/download" class="btn btn-secondary btn-lg">
            <span>⬇️</span> 立即下载
          </router-link>
        </div>
      </div>
      
      <div class="scroll-indicator">
        <span>向下滚动</span>
        <div class="scroll-arrow"></div>
      </div>
    </section>

    <BannerCarousel :banners="banners" />

    <section class="section highlights-section">
      <div class="container">
        <h2 class="section-title" v-scroll-animate="'fade-up'">游戏特色</h2>
        <div class="highlights-grid">
          <div 
            v-for="(item, index) in highlights" 
            :key="item.id" 
            class="highlight-card card"
            v-scroll-animate="{ animation: 'fade-up', delay: index * 100 }"
          >
            <div class="highlight-icon">{{ item.icon }}</div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section news-section">
      <div class="container">
        <div class="section-header" v-scroll-animate="'fade-up'">
          <h2 class="section-title" style="margin-bottom: 0;">最新资讯</h2>
          <router-link to="/news" class="more-link">查看更多 →</router-link>
        </div>
        <div class="news-grid">
          <div 
            v-for="(news, index) in latestNews" 
            :key="news.id" 
            class="news-card card" 
            @click="goToNews(news.id)"
            v-scroll-animate="{ animation: 'fade-up', delay: index * 100 }"
          >
            <div class="news-cover-wrapper">
              <LazyImage 
                v-if="news.cover_image" 
                :src="news.cover_image" 
                :alt="news.title" 
              />
            </div>
            <div class="news-content">
              <div class="news-tags">
                <span class="tag tag-purple">{{ getCategoryName(news.category) }}</span>
                <span v-if="news.is_top" class="tag tag-gold tag-top">置顶</span>
              </div>
              <h3>{{ news.title }}</h3>
              <p class="news-date">{{ formatDate(news.created_at) }}</p>
              <p class="news-views">👁️ {{ news.view_count || 0 }} 阅读</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section events-section">
      <div class="container">
        <div class="section-header" v-scroll-animate="'fade-up'">
          <h2 class="section-title" style="margin-bottom: 0;">热门活动</h2>
          <router-link to="/events" class="more-link">查看更多 →</router-link>
        </div>
        <div class="events-grid">
          <div 
            v-for="(event, index) in ongoingEvents" 
            :key="event.id" 
            class="event-card card" 
            @click="goToEvent(event)"
            v-scroll-animate="{ animation: 'fade-up', delay: index * 100 }"
          >
            <div class="event-cover-wrapper">
              <LazyImage 
                v-if="event.cover_image" 
                :src="event.cover_image" 
                :alt="event.title" 
              />
            </div>
            <div class="event-status" :class="event.status">
              {{ getEventStatusText(event.status) }}
            </div>
            <div class="event-content">
              <h3>{{ event.title }}</h3>
              <div v-if="event.description" class="event-desc" v-html="event.description"></div>
              <div class="event-time">
                <span>📅 {{ formatDate(event.start_time) }} - {{ formatDate(event.end_time) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section previews-section">
      <div class="container">
        <h2 class="section-title" v-scroll-animate="'fade-up'">精彩预览</h2>
        <p class="section-subtitle" v-scroll-animate="'fade-up'">点击查看高清大图和CG视频</p>
        <div class="previews-grid">
          <div 
            v-for="(preview, index) in previews" 
            :key="preview.id" 
            class="preview-item"
            @click="openPreview(preview)"
            v-scroll-animate="{ animation: 'fade-up', delay: index * 100 }"
          >
            <LazyImage :src="preview.thumbnail || preview.url" :alt="preview.title" />
            <div class="preview-overlay">
              <div class="preview-icon">
                <span v-if="preview.type === 'video'">▶️</span>
                <span v-else>🔍</span>
              </div>
              <span class="preview-title">{{ preview.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section cta-section">
      <div class="container">
        <div class="cta-content" v-scroll-animate="'zoom-in'">
          <h2>立即加入星际幻想</h2>
          <p>开启你的宇宙冒险之旅，探索未知星系</p>
          <div class="cta-buttons">
            <router-link to="/download" class="btn btn-primary btn-lg">立即下载</router-link>
            <router-link to="/intro" class="btn btn-secondary btn-lg">了解更多</router-link>
          </div>
        </div>
      </div>
    </section>

    <Footer />

    <MediaModal
      v-model:visible="showMediaModal"
      :type="currentMedia?.type || 'image'"
      :src="currentMedia?.url || ''"
      :title="currentMedia?.title || ''"
      :poster="currentMedia?.thumbnail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import BannerCarousel from '../../components/BannerCarousel.vue'
import LazyImage from '../../components/LazyImage.vue'
import MediaModal from '../../components/MediaModal.vue'
import { newsApi, eventApi, homeApi } from '../../api'
import type { Banner, Highlight, News, Event } from '../../types'

interface PreviewItem {
  id: number
  type: 'image' | 'video'
  url: string
  thumbnail?: string
  title: string
}

const banners = ref<Banner[]>([])
const highlights = ref<Highlight[]>([])
const latestNews = ref<News[]>([])
const ongoingEvents = ref<Event[]>([])
const previews = ref<PreviewItem[]>([])

const showMediaModal = ref(false)
const currentMedia = ref<PreviewItem | null>(null)

const heroVideoUrl = ref('')

const getCategoryName = (category: string): string => {
  const map: Record<string, string> = {
    announcement: '公告',
    version: '版本更新',
    event: '活动'
  }
  return map[category] || category
}

const getEventStatusText = (status: string): string => {
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

const goToNews = (id: number): void => {
  window.location.href = `/news/${id}`
}

const playCGVideo = (): void => {
  currentMedia.value = {
    id: 0,
    type: 'video',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: '星际幻想 - 官方CG预告'
  }
  showMediaModal.value = true
}

const openPreview = (preview: PreviewItem): void => {
  currentMedia.value = preview
  showMediaModal.value = true
}

const loadHomeData = async (): Promise<void> => {
  try {
    const homeData = await homeApi.getHomeData()
    banners.value = homeData.banners as Banner[] || []
    highlights.value = homeData.highlights as Highlight[] || []
    const rawPreviews = homeData.previews as PreviewItem[] || []
    previews.value = rawPreviews.map((p, i) => ({
      ...p,
      id: i,
      type: p.type || 'image'
    }))
  } catch {
    banners.value = [
      { id: 1, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%20game%20banner%20futuristic%20dark%20blue%20neon&image_size=landscape_16_9', title: '星际幻想 正式公测开启', link: '/download' },
      { id: 2, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fantasy%20game%20world%20magic%20epic%20battle&image_size=landscape_16_9', title: '全新版本 破晓来临', link: '/news' },
      { id: 3, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=space%20galaxy%20game%20adventure%20stars%20cosmic&image_size=landscape_16_9', title: '跨服战场 荣耀开启', link: '/events' }
    ]
    highlights.value = [
      { id: 1, icon: '🎮', title: '极致画质', description: '4K超清画面，沉浸式游戏体验' },
      { id: 2, icon: '⚔️', title: '多元战斗', description: '丰富技能组合，策略对决' },
      { id: 3, icon: '🌍', title: '开放世界', description: '超大地图自由探索' },
      { id: 4, icon: '👥', title: '社交互动', description: '组队副本，公会争霸' }
    ]
    previews.value = [
      { id: 1, type: 'image', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=game%20screenshot%20fantasy%20battle%20scene%20epic&image_size=landscape_16_9', title: '战斗场景' },
      { id: 2, type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=game%20cg%20video%20thumbnail%20epic&image_size=landscape_16_9', title: 'CG宣传视频' },
      { id: 3, type: 'image', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=game%20character%20design%20warrior%20armor%20fantasy&image_size=landscape_16_9', title: '角色展示' },
      { id: 4, type: 'image', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=game%20landscape%20fantasy%20world%20castle%20mountains&image_size=landscape_16_9', title: '世界风光' }
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

.hero-section {
  position: relative;
  height: 100vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .video-background {
    position: absolute;
    inset: 0;
    z-index: 0;

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .video-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(13, 17, 23, 0.3) 0%,
      rgba(13, 17, 23, 0.7) 50%,
      var(--bg-dark) 100%
    );
  }

  .hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    max-width: 800px;
    padding: 0 24px;
  }

  .hero-title {
    font-size: 72px;
    font-weight: 900;
    margin-bottom: 24px;
    line-height: 1.1;
    text-shadow: 0 4px 20px rgba(0, 245, 255, 0.5);

    .gradient-text {
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: glow 3s ease-in-out infinite;
    }
  }

  .hero-subtitle {
    font-size: 20px;
    color: var(--text-secondary);
    margin-bottom: 48px;
  }

  .hero-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .scroll-indicator {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    color: var(--text-muted);
    font-size: 12px;
    z-index: 1;

    span {
      display: block;
      margin-bottom: 8px;
    }

    .scroll-arrow {
      width: 24px;
      height: 24px;
      border-right: 2px solid var(--text-muted);
      border-bottom: 2px solid var(--text-muted);
      transform: rotate(45deg);
      margin: 0 auto;
      animation: bounce 2s infinite;
    }
  }
}

@keyframes glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}

@keyframes bounce {
  0%, 100% { transform: rotate(45deg) translateY(0); }
  50% { transform: rotate(45deg) translateY(10px); }
}

.section {
  padding: 100px 0;
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
  transition: all 0.3s var(--ease-smooth);

  &:hover {
    opacity: 0.8;
    transform: translateX(4px);
  }
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.highlight-card {
  text-align: center;
  padding: 40px 24px;

  .highlight-icon {
    font-size: 56px;
    margin-bottom: 20px;
    filter: drop-shadow(0 4px 8px rgba(0, 245, 255, 0.3));
    transition: transform 0.3s var(--ease-bounce);
  }

  &:hover .highlight-icon {
    transform: scale(1.1) rotate(5deg);
  }

  h3 {
    font-size: 22px;
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

  .news-cover-wrapper, .event-cover-wrapper {
    width: 100%;
    height: 220px;
    overflow: hidden;
  }

  .news-content, .event-content {
    padding: 24px;
  }

  .news-tags {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  h3 {
    font-size: 18px;
    margin-bottom: 8px;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.3s var(--ease-smooth);
  }

  &:hover h3 {
    color: var(--secondary-color);
  }

  .news-date, .news-views {
    color: var(--text-muted);
    font-size: 13px;
    margin: 0;
  }

  .news-views {
    margin-top: 8px;
  }

  .event-status {
    position: absolute;
    top: 16px;
    right: 16px;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;

    &.ongoing {
      background: var(--accent-green);
      color: white;
    }

    &.upcoming {
      background: var(--accent-gold);
      color: var(--bg-dark);
    }

    &.ended {
      background: var(--text-muted);
      color: white;
    }
  }
}

.event-card {
  position: relative;

  .event-desc {
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .event-time {
    color: var(--text-muted);
    font-size: 13px;
  }
}

.previews-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.preview-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 16/9;

  &::deep img {
    transition: transform 0.5s var(--ease-smooth);
  }

  .preview-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 60%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding: 20px;
    opacity: 0;
    transition: opacity 0.3s var(--ease-smooth);

    .preview-icon {
      font-size: 32px;
      margin-bottom: 12px;
      transform: scale(0.5);
      transition: transform 0.3s var(--ease-bounce);
    }

    .preview-title {
      color: white;
      font-size: 14px;
      font-weight: 500;
      text-align: center;
    }
  }

  &:hover {
    &::deep img {
      transform: scale(1.1);
    }

    .preview-overlay {
      opacity: 1;

      .preview-icon {
        transform: scale(1);
      }
    }
  }
}

.cta-section {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-purple) 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(0, 245, 255, 0.1) 0%, transparent 50%);
    animation: rotate 30s linear infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .cta-content {
    position: relative;
    text-align: center;
    z-index: 1;

    h2 {
      font-size: 42px;
      color: white;
      margin-bottom: 16px;
    }

    p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 18px;
      margin-bottom: 40px;
    }

    .cta-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }
  }
}

@media (max-width: 1200px) {
  .highlights-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .previews-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .section {
    padding: 60px 0;
  }

  .hero-title {
    font-size: 48px !important;
  }

  .news-grid, .events-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-section {
    height: 80vh;
    min-height: 500px;
  }

  .hero-title {
    font-size: 36px !important;
  }

  .hero-subtitle {
    font-size: 16px !important;
  }

  .section {
    padding: 48px 0;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 24px;
  }

  .highlights-grid, .previews-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .news-grid, .events-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .highlight-card {
    padding: 24px 16px;

    .highlight-icon {
      font-size: 40px;
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
</style>
