<template>
  <Layout>
    <div class="trash-page">
      <div class="page-header">
        <h1 class="title">回收站</h1>
        <p class="subtitle">删除的笔记会在这里保留30天</p>
      </div>

      <div v-if="loading" class="loading">
        <el-skeleton :rows="6" animated />
      </div>

      <div v-else-if="notes.length > 0" class="notes-grid">
        <div
          v-for="note in notes"
          :key="note.id"
          class="note-card"
        >
          <div class="note-cover" v-if="note.images && note.images.length > 0">
            <img :src="note.images[0]" :alt="note.title" />
          </div>
          <div class="note-cover default" v-else>
            <el-icon><Document /></el-icon>
          </div>
          <div class="note-info">
            <h3 class="title">{{ note.title }}</h3>
            <p class="content">{{ note.content.substring(0, 50) }}...</p>
            <div class="note-meta">
              <span>删除于 {{ formatTime(note.deletedAt) }}</span>
            </div>
          </div>
          <div class="note-actions">
            <el-button size="small" type="primary" @click="restoreNote(note.id)">
              恢复
            </el-button>
            <el-button size="small" type="danger" @click="deletePermanently(note.id)">
              永久删除
            </el-button>
          </div>
        </div>
      </div>

      <div v-else class="empty">
        <el-empty description="回收站为空" />
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getTrashNotes, restoreNote as restore, permanentlyDeleteNote } from '@/api/note';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document } from '@element-plus/icons-vue';
import Layout from '@/components/Layout.vue';
import type { Note } from '@/types';
import dayjs from 'dayjs';

const router = useRouter();

const loading = ref(false);
const notes = ref<Note[]>([]);

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm');
};

const fetchTrash = async () => {
  loading.value = true;
  try {
    const res = await getTrashNotes({ page: 1, pageSize: 50 });
    notes.value = res.list;
  } catch (error) {
    console.error('获取回收站失败:', error);
  } finally {
    loading.value = false;
  }
};

const restoreNote = async (id: string) => {
  try {
    await restore(id);
    ElMessage.success('恢复成功');
    notes.value = notes.value.filter(n => n.id !== id);
  } catch (error) {
    console.error('恢复失败:', error);
  }
};

const deletePermanently = async (id: string) => {
  await ElMessageBox.confirm('确定要永久删除这篇笔记吗？删除后无法恢复。', '提示', {
    confirmButtonText: '永久删除',
    cancelButtonText: '取消',
    type: 'warning',
  });
  try {
    await permanentlyDeleteNote(id);
    ElMessage.success('已永久删除');
    notes.value = notes.value.filter(n => n.id !== id);
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
    }
  }
};

onMounted(() => {
  fetchTrash();
});
</script>

<style lang="scss" scoped>
.trash-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;

  .title {
    font-size: 24px;
    font-weight: 700;
    color: #333;
    margin: 0 0 8px;
  }

  .subtitle {
    color: #999;
    font-size: 14px;
    margin: 0;
  }
}

.loading {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.note-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f0f0f0;

  .note-cover {
    height: 140px;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 48px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .note-info {
    padding: 16px;

    .title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 0 0 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .content {
      font-size: 13px;
      color: #666;
      margin: 0 0 12px;
      line-height: 1.5;
    }

    .note-meta {
      font-size: 12px;
      color: #999;
    }
  }

  .note-actions {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid #f0f0f0;
  }
}

.empty {
  background: #fff;
  border-radius: 12px;
  padding: 60px 20px;
}
</style>
