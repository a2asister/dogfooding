<template>
  <Layout>
    <div class="topic-detail-page">
      <div v-if="loading" class="loading">
        <el-skeleton :rows="10" animated />
      </div>

      <template v-else-if="topic">
        <div class="topic-header">
          <div class="topic-cover" v-if="topic.cover">
            <img :src="topic.cover" :alt="topic.name" />
          </div>
          <div class="topic-cover default" v-else>
            <el-icon><Collection /></el-icon>
          </div>
          <div class="topic-info">
            <div class="topic-title">
              <h1>#{{ topic.name }}</h1>
              <el-tag v-if="topic.isHot" type="danger" size="small" round>
                热门
              </el-tag>
            </div>
            <p class="topic-desc">{{ topic.description || '暂无描述' }}</p>
            <div class="topic-stats">
              <span>{{ topic.noteCount }} 笔记</span>
              <span>{{ topic.followCount }} 关注</span>
            </div>
            <div class="topic-actions">
              <el-button
                v-if="userStore.isLoggedIn"
                :type="topic.isFollowing ? 'primary' : ''"
                size="large"
                @click="handleFollow"
              >
                {{ topic.isFollowing ? '已关注' : '+ 关注话题' }}
              </el-button>
              <el-button size="large" @click="handlePublish">
                <el-icon><Edit /></el-icon>
                发布笔记
              </el-button>
            </div>
          </div>
        </div>

        <div class="topic-content">
          <el-tabs v-model="activeTab" class="content-tabs">
            <el-tab-pane label="最新" name="latest" />
            <el-tab-pane label="热门" name="hot" />
          </el-tabs>

          <div v-if="notesLoading" class="notes-loading">
            <el-skeleton :rows="5" animated />
          </div>

          <div v-else-if="notes.length > 0" class="notes-list">
            <NoteCard
              v-for="note in notes"
              :key="note.id"
              :note="note"
              @update="fetchNotes(true)"
            />
          </div>

          <div v-else class="no-notes">
            <el-empty description="该话题下暂无笔记，快来发布第一篇吧~" />
          </div>

          <div v-if="hasMore" class="load-more">
            <el-button :loading="notesLoading" @click="loadMore">加载更多</el-button>
          </div>
        </div>
      </template>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getTopicDetail, followTopic, getTopicNotes } from '@/api/topic';
import { ElMessage } from 'element-plus';
import { Collection, Edit } from '@element-plus/icons-vue';
import Layout from '@/components/Layout.vue';
import NoteCard from '@/components/NoteCard.vue';
import type { Topic, Note } from '@/types';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const topic = ref<Topic | null>(null);
const notes = ref<Note[]>([]);
const notesLoading = ref(false);
const activeTab = ref('latest');
const page = ref(1);
const pageSize = ref(20);
const hasMore = ref(true);

const fetchTopic = async () => {
  loading.value = true;
  try {
    const id = route.params.id as string;
    const res = await getTopicDetail(id);
    topic.value = res.topic;
    fetchNotes(true);
  } catch (error) {
    console.error('获取话题详情失败:', error);
  } finally {
    loading.value = false;
  }
};

const fetchNotes = async (reset = false) => {
  if (!topic.value) return;
  if (reset) {
    page.value = 1;
    hasMore.value = true;
    notes.value = [];
  }
  notesLoading.value = true;
  try {
    const res = await getTopicNotes({
      id: topic.value.id,
      sort: activeTab.value === 'hot' ? 'hot' : 'latest',
      page: page.value,
      pageSize: pageSize.value,
    });
    notes.value = reset ? res.list : [...notes.value, ...res.list];
    hasMore.value = res.list.length >= pageSize.value;
    page.value++;
  } catch (error) {
    console.error('获取笔记列表失败:', error);
  } finally {
    notesLoading.value = false;
  }
};

const handleFollow = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  if (!topic.value) return;
  try {
    const res = await followTopic(topic.value.id);
    topic.value.isFollowing = res.following;
    topic.value.followCount = res.followCount;
    ElMessage.success(res.following ? '关注成功' : '取消关注');
  } catch (error) {
    console.error('关注话题失败:', error);
  }
};

const handlePublish = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  router.push({
    path: '/publish',
    query: { topic: topic.value?.name },
  });
};

const loadMore = () => {
  fetchNotes();
};

onMounted(() => {
  fetchTopic();
});
</script>

<style lang="scss" scoped>
.topic-detail-page {
  max-width: 800px;
  margin: 0 auto;
}

.loading {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
}

.topic-header {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  display: flex;
  gap: 24px;

  .topic-cover {
    width: 160px;
    height: 160px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 64px;

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
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .topic-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      h1 {
        font-size: 28px;
        font-weight: 700;
        color: #333;
        margin: 0;
      }
    }

    .topic-desc {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .topic-stats {
      display: flex;
      gap: 24px;
      font-size: 14px;
      color: #999;
      margin-bottom: 20px;
    }

    .topic-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.topic-content {
  background: #fff;
  border-radius: 12px;
  padding: 20px;

  .content-tabs {
    margin-bottom: 20px;
  }

  .notes-loading {
    padding: 20px 0;
  }

  .no-notes {
    padding: 60px 0;
  }

  .notes-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .load-more {
    text-align: center;
    margin-top: 30px;
  }
}
</style>
