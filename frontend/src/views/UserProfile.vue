<template>
  <Layout>
    <div class="user-profile">
      <div v-if="loading" class="loading">
        <el-skeleton :rows="5" animated />
      </div>
      
      <template v-else-if="user">
        <div class="profile-card">
          <div class="avatar-section">
            <el-avatar :size="100" :src="user.avatar">
              {{ user.nickname?.charAt(0) }}
            </el-avatar>
            <h2 class="nickname">{{ user.nickname }}</h2>
            <p v-if="user.bio" class="bio">{{ user.bio }}</p>
          </div>
          
          <div class="stats">
            <div class="stat-item">
              <div class="number">{{ user.noteCount || 0 }}</div>
              <div class="label">笔记</div>
            </div>
            <div class="stat-item">
              <div class="number">{{ user.followerCount || 0 }}</div>
              <div class="label">粉丝</div>
            </div>
            <div class="stat-item">
              <div class="number">{{ user.followingCount || 0 }}</div>
              <div class="label">关注</div>
            </div>
          </div>
          
          <el-button
            v-if="userStore.isLoggedIn && userStore.user?.id !== user.id"
            :type="user.isFollowing ? '' : 'primary'"
            @click="handleFollow"
            :loading="following"
          >
            {{ user.isFollowing ? '已关注' : '关注' }}
          </el-button>
        </div>
        
        <div class="notes-list">
          <div v-if="notesLoading" class="loading">
            <el-skeleton :rows="3" animated />
          </div>
          <template v-else-if="notes.length > 0">
            <div v-for="note in notes" :key="note.id" class="note-item" @click="$router.push(`/note/${note.id}`)">
              <div class="note-info">
                <h3>{{ note.title }}</h3>
                <p class="desc">{{ note.content }}</p>
                <div class="meta">
                  <span>{{ formatTime(note.createdAt) }}</span>
                  <span>❤️ {{ note.likeCount }}</span>
                  <span>⭐ {{ note.favoriteCount }}</span>
                </div>
              </div>
              <div v-if="note.images && note.images.length > 0" class="note-image">
                <img :src="note.images[0]" />
              </div>
            </div>
          </template>
          <div v-else class="empty">
            <el-empty description="暂无笔记" />
          </div>
        </div>
      </template>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getUserProfile, followUser } from '@/api/user';
import { ElMessage } from 'element-plus';
import Layout from '@/components/Layout.vue';
import type { User, Note } from '@/types';
import dayjs from 'dayjs';

const route = useRoute();
const userStore = useUserStore();

const loading = ref(false);
const notesLoading = ref(false);
const following = ref(false);
const user = ref<User | null>(null);
const notes = ref<Note[]>([]);

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD');
};

const fetchUser = async () => {
  loading.value = true;
  try {
    const res = await getUserProfile(route.params.id as string);
    user.value = res.user;
  } catch (error) {
    console.error('获取用户信息失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleFollow = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    return;
  }
  if (!user.value) return;
  
  following.value = true;
  try {
    const res = await followUser(user.value.id);
    user.value.isFollowing = res.following;
    ElMessage.success(res.following ? '关注成功' : '取消关注');
  } catch (error) {
    console.error('关注失败:', error);
  } finally {
    following.value = false;
  }
};

onMounted(() => {
  fetchUser();
});
</script>

<style lang="scss" scoped>
.user-profile {
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  margin-bottom: 20px;
  
  .avatar-section {
    margin-bottom: 30px;
    
    .nickname {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin: 16px 0 8px;
    }
    
    .bio {
      color: #666;
      font-size: 14px;
    }
  }
  
  .stats {
    display: flex;
    justify-content: center;
    gap: 60px;
    margin-bottom: 30px;
    
    .stat-item {
      .number {
        font-size: 28px;
        font-weight: 700;
        color: #333;
      }
      .label {
        font-size: 14px;
        color: #999;
        margin-top: 4px;
      }
    }
  }
}

.notes-list {
  .note-item {
    display: flex;
    gap: 20px;
    padding: 20px;
    background: #fff;
    border-radius: 12px;
    margin-bottom: 16px;
    cursor: pointer;
    transition: box-shadow 0.3s;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .note-info {
      flex: 1;
      
      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
      }
      
      .desc {
        font-size: 14px;
        color: #666;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-bottom: 12px;
      }
      
      .meta {
        font-size: 12px;
        color: #999;
        display: flex;
        gap: 12px;
      }
    }
    
    .note-image {
      width: 100px;
      height: 100px;
      flex-shrink: 0;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
      }
    }
  }
}

.loading {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
}

.empty {
  background: #fff;
  border-radius: 12px;
  padding: 60px;
  text-align: center;
}
</style>
