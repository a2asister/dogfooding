<template>
  <Layout>
    <div class="topic-page">
      <div class="page-header">
        <h1 class="title">话题广场</h1>
        <p class="subtitle">发现更多感兴趣的话题</p>
      </div>

      <div class="category-tabs">
        <el-tabs v-model="activeCategory" @tab-change="handleCategoryChange">
          <el-tab-pane label="全部" name="all" />
          <el-tab-pane v-for="cat in categories" :key="cat" :label="cat" :name="cat" />
        </el-tabs>
      </div>

      <div class="topics-grid">
        <div v-if="loading" class="loading-skeleton">
          <el-skeleton :rows="6" animated />
        </div>

        <div v-else-if="topics.length > 0" class="grid-container">
          <div
            v-for="topic in topics"
            :key="topic.id"
            class="topic-card"
            @click="$router.push(`/topic/${topic.id}`)"
          >
            <div class="topic-cover" v-if="topic.cover">
              <img :src="topic.cover" :alt="topic.name" />
            </div>
            <div class="topic-cover default" v-else>
              <el-icon><Collection /></el-icon>
            </div>
            <div class="topic-info">
              <div class="topic-header">
                <h3 class="topic-name">#{{ topic.name }}</h3>
                <el-tag v-if="topic.isHot" type="danger" size="small" round>
                  热门
                </el-tag>
              </div>
              <p class="topic-desc">{{ topic.description || '暂无描述' }}</p>
              <div class="topic-stats">
                <span>{{ topic.noteCount }} 笔记</span>
                <span>{{ topic.followCount }} 关注</span>
              </div>
              <div class="topic-footer">
                <el-button
                  v-if="userStore.isLoggedIn"
                  :type="topic.isFollowing ? 'primary' : ''"
                  size="small"
                  @click.stop="handleFollow(topic)"
                >
                  {{ topic.isFollowing ? '已关注' : '+ 关注' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-topics">
          <el-empty description="暂无话题" />
        </div>
      </div>

      <div v-if="hasMore" class="load-more">
        <el-button :loading="loading" @click="loadMore">加载更多</el-button>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getTopicSquare, followTopic } from '@/api/topic';
import { ElMessage } from 'element-plus';
import { Collection } from '@element-plus/icons-vue';
import Layout from '@/components/Layout.vue';
import type { Topic } from '@/types';

const router = useRouter();
const userStore = useUserStore();

const categories = ref<string[]>(['生活', '科技', '旅行', '美食', '摄影', '设计', '时尚', '娱乐', '教育']);
const activeCategory = ref('all');
const topics = ref<Topic[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(20);
const hasMore = ref(true);

const fetchTopics = async (reset = false) => {
  if (reset) {
    topics.value = [];
  }
  loading.value = true;
  try {
    const res = await getTopicSquare();
    let allTopics = res.topics || [];
    if (activeCategory.value !== 'all') {
      allTopics = allTopics.filter((t: any) => t.category === activeCategory.value);
    }
    topics.value = allTopics;
    hasMore.value = false;
  } catch (error) {
    console.error('获取话题列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleCategoryChange = () => {
  fetchTopics(true);
};

const loadMore = () => {
  fetchTopics();
};

const handleFollow = async (topic: Topic) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  try {
    const res = await followTopic(topic.id);
    topic.isFollowing = res.following;
    topic.followCount = res.followCount;
    ElMessage.success(res.following ? '关注成功' : '取消关注');
  } catch (error) {
    console.error('关注话题失败:', error);
  }
};

onMounted(() => {
  fetchTopics(true);
});
</script>

<style lang="scss" scoped>
.topic-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;

  .title {
    font-size: 32px;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
  }

  .subtitle {
    color: #999;
    font-size: 14px;
  }
}

.category-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 0 20px;
  margin-bottom: 20px;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }
}

.topics-grid {
  .loading-skeleton {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .no-topics {
    background: #fff;
    border-radius: 12px;
    padding: 60px 20px;
  }
}

.topic-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  .topic-cover {
    height: 140px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 48px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &.default {
      background: linear-gradient(135deg, #f093fb, #f5576c);
    }
  }

  .topic-info {
    padding: 16px;

    .topic-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      .topic-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .topic-desc {
      color: #666;
      font-size: 13px;
      line-height: 1.5;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 39px;
    }

    .topic-stats {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #999;
      margin-bottom: 12px;
    }

    .topic-footer {
      display: flex;
      justify-content: flex-end;
    }
  }
}

.load-more {
  text-align: center;
  margin-top: 30px;
}
</style>
