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
        <div v-if="news" class="detail-content">
          <div class="detail-meta">
            <span class="detail-category">{{ getCategoryName(news.category) }}</span>
            <span class="detail-date">发布时间：{{ formatDate(news.created_at) }}</span>
            <span class="detail-views">阅读量：{{ news.view_count }}</span>
          </div>
          <div v-if="news.cover_image" class="detail-cover">
            <img :src="news.cover_image" :alt="news.title">
          </div>
          <div class="detail-body" v-html="news.content"></div>
          <div class="detail-footer">
            <router-link to="/news" class="back-link">← 返回列表</router-link>
          </div>
        </div>
        <div v-else class="loading">
          <el-icon :size="40" class="is-loading"><Loading /></el-icon>
          <p>加载中...</p>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { newsApi } from '../../api'
import type { News } from '../../types'
import { Loading } from '@element-plus/icons-vue'

const route = useRoute()
const news = ref<News | null>(null)

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

const loadNewsDetail = async (): Promise<void> => {
  const id = Number(route.params.id)
  if (!id) return

  try {
    const result = await newsApi.getDetail(id)
    news.value = result
  } catch {
    news.value = null
  }
}

onMounted(() => {
  loadNewsDetail()
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

.detail-content {
  max-width: 900px;
  margin: 0 auto;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 40px;
  border: 1px solid var(--border-color);
}

.detail-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);

  span {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .detail-category {
    background: var(--accent-purple);
    color: white;
    padding: 6px 16px;
    border-radius: 4px;
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
</style>
