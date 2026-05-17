<template>
  <Layout>
    <div class="profile-page">
      <div v-if="loading" class="loading">
        <el-skeleton :rows="5" animated />
      </div>
      
      <template v-else-if="userStore.user">
        <div class="profile-card">
          <div class="avatar-section">
            <el-avatar :size="100" :src="userStore.user.avatar">
              {{ userStore.user.nickname?.charAt(0) }}
            </el-avatar>
            <h2 class="nickname">{{ userStore.user.nickname }}</h2>
            <p v-if="userStore.user.bio" class="bio">{{ userStore.user.bio }}</p>
          </div>
          
          <div class="stats">
            <div class="stat-item">
              <div class="number">{{ userStore.user.noteCount || 0 }}</div>
              <div class="label">笔记</div>
            </div>
            <div class="stat-item">
              <div class="number">{{ userStore.user.followerCount || 0 }}</div>
              <div class="label">粉丝</div>
            </div>
            <div class="stat-item">
              <div class="number">{{ userStore.user.followingCount || 0 }}</div>
              <div class="label">关注</div>
            </div>
          </div>
          
          <el-button type="primary" @click="showEdit = true">编辑资料</el-button>
        </div>
        
        <div class="content-tabs">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="我的笔记" name="notes" />
            <el-tab-pane label="收藏" name="favorites" />
          </el-tabs>
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
                  <span class="status" :class="note.status">
                    {{ getStatusText(note.status) }}
                  </span>
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
    
    <el-dialog v-model="showEdit" title="编辑资料" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="editForm.bio" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEdit = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateProfile" :loading="updating">保存</el-button>
      </template>
    </el-dialog>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { updateProfile } from '@/api/user';
import { ElMessage } from 'element-plus';
import Layout from '@/components/Layout.vue';
import type { Note } from '@/types';
import dayjs from 'dayjs';

const userStore = useUserStore();

const loading = ref(false);
const notesLoading = ref(false);
const updating = ref(false);
const showEdit = ref(false);
const activeTab = ref('notes');
const notes = ref<Note[]>([]);

const editForm = reactive({
  nickname: '',
  bio: '',
});

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD');
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    pending: '审核中',
    published: '已发布',
    rejected: '已拒绝',
    taken_down: '已下架',
  };
  return map[status] || status;
};

const handleUpdateProfile = async () => {
  if (!editForm.nickname) {
    ElMessage.warning('请输入昵称');
    return;
  }
  
  updating.value = true;
  try {
    const res = await updateProfile(editForm);
    userStore.setUser(res.user);
    ElMessage.success('更新成功');
    showEdit.value = false;
  } catch (error) {
    console.error('更新失败:', error);
  } finally {
    updating.value = false;
  }
};

onMounted(() => {
  if (userStore.user) {
    editForm.nickname = userStore.user.nickname || '';
    editForm.bio = userStore.user.bio || '';
  }
});
</script>

<style lang="scss" scoped>
.profile-page {
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

.content-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 0 20px;
  margin-bottom: 20px;
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
        
        .status {
          &.published {
            color: #67c23a;
          }
          &.pending {
            color: #e6a23c;
          }
          &.rejected, &.taken_down {
            color: #f56c6c;
          }
        }
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
