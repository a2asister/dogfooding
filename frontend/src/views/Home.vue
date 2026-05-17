<template>
  <Layout>
    <div class="home-page">
      <div class="tabs-container">
        <el-tabs v-model="activeTab" class="home-tabs">
          <el-tab-pane label="推荐" name="recommend" />
          <el-tab-pane v-if="userStore.isLoggedIn" label="关注" name="following" />
        </el-tabs>
      </div>
      
      <div class="note-list">
        <div v-if="loading" class="loading">
          <el-skeleton :rows="5" animated />
        </div>
        
        <template v-else-if="notes.length > 0">
          <div v-for="note in notes" :key="note.id" class="note-card">
            <div class="note-header">
              <div class="author" @click="$router.push(`/user/${note.author.id}`)">
                <el-avatar :size="40" :src="note.author.avatar">
                  {{ note.author.nickname?.charAt(0) }}
                </el-avatar>
                <div class="info">
                  <div class="name">{{ note.author.nickname }}</div>
                  <div class="time">{{ formatTime(note.createdAt) }}</div>
                </div>
              </div>
              <div v-if="note.topics && note.topics.length > 0" class="topics">
                <el-tag v-for="topic in note.topics" :key="topic" size="small" type="info">
                  #{{ topic }}
                </el-tag>
              </div>
            </div>
            
            <div class="note-content" @click="$router.push(`/note/${note.id}`)">
              <h3 class="title">{{ note.title }}</h3>
              <p class="desc">{{ note.content }}</p>
              <div v-if="note.images && note.images.length > 0" class="images">
                <img
                  v-for="(img, idx) in note.images.slice(0, 3)"
                  :key="idx"
                  :src="img"
                  :class="{ single: note.images.length === 1 }"
                />
              </div>
            </div>
            
            <div class="note-footer">
              <div class="action" :class="{ active: note.isLiked }" @click.stop="handleLike(note)">
                <el-icon><Star /></el-icon>
                <span>{{ note.likeCount }}</span>
              </div>
              <div class="action" :class="{ active: note.isFavorited }" @click.stop="handleFavorite(note)">
                <el-icon><Collection /></el-icon>
                <span>{{ note.favoriteCount }}</span>
              </div>
              <div class="action" @click.stop="handleShare(note)">
                <el-icon><Share /></el-icon>
                <span>{{ note.shareCount }}</span>
              </div>
              <div class="action">
                <el-icon><View /></el-icon>
                <span>{{ note.viewCount }}</span>
              </div>
            </div>
          </div>
        </template>
        
        <div v-else class="empty">
          <el-empty description="暂无笔记" />
        </div>
      </div>
      
      <div v-if="total > notes.length" class="load-more">
        <el-button :loading="loadingMore" @click="loadMore">加载更多</el-button>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getNoteList, likeNote, favoriteNote, shareNote } from '@/api/note';
import { ElMessage } from 'element-plus';
import { Star, Collection, Share, View } from '@element-plus/icons-vue';
import Layout from '@/components/Layout.vue';
import type { Note } from '@/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref('recommend');
const loading = ref(false);
const loadingMore = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const notes = ref<Note[]>([]);

const formatTime = (time: string) => {
  return dayjs(time).fromNow();
};

const fetchNotes = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }
  
  try {
    const res = await getNoteList({
      page: page.value,
      pageSize: pageSize.value,
      type: activeTab.value as 'recommend' | 'following',
    });
    
    if (isLoadMore) {
      notes.value = [...notes.value, ...res.list];
    } else {
      notes.value = res.list;
    }
    total.value = res.total;
  } catch (error) {
    console.error('获取笔记列表失败:', error);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = () => {
  page.value++;
  fetchNotes(true);
};

const handleLike = async (note: Note) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  
  try {
    const res = await likeNote(note.id);
    note.isLiked = res.liked;
    note.likeCount = res.likeCount;
  } catch (error) {
    console.error('点赞失败:', error);
  }
};

const handleFavorite = async (note: Note) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  
  try {
    const res = await favoriteNote(note.id);
    note.isFavorited = res.favorited;
    note.favoriteCount = res.favoriteCount;
  } catch (error) {
    console.error('收藏失败:', error);
  }
};

const handleShare = async (note: Note) => {
  try {
    const res = await shareNote(note.id);
    note.shareCount = res.shareCount;
    ElMessage.success('分享成功');
  } catch (error) {
    console.error('分享失败:', error);
  }
};

onMounted(async () => {
  if (userStore.isLoggedIn && !userStore.user) {
    await userStore.fetchCurrentUser();
  }
  fetchNotes();
});
</script>

<style lang="scss" scoped>
.home-page {
  max-width: 700px;
  margin: 0 auto;
}

.tabs-container {
  background: #fff;
  border-radius: 8px;
  padding: 0 20px;
  margin-bottom: 20px;
}

.home-tabs {
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
}

.note-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.note-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: box-shadow 0.3s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.author {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .info {
    .name {
      font-weight: 500;
      color: #333;
    }
    .time {
      font-size: 12px;
      color: #999;
    }
  }
}

.topics {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.note-content {
  .title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }
  
  .desc {
    color: #666;
    line-height: 1.6;
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .images {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    
    img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: 8px;
      
      &.single {
        grid-column: span 3;
        height: 300px;
      }
    }
  }
}

.note-footer {
  display: flex;
  gap: 32px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.action {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s;
  
  &:hover, &.active {
    color: #409eff;
  }
}

.loading {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.empty {
  background: #fff;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
}

.load-more {
  text-align: center;
  margin-top: 20px;
}
</style>
