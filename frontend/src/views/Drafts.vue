<template>
  <Layout>
    <div class="drafts-page">
      <div class="page-header">
        <h2>草稿箱</h2>
      </div>
      
      <div v-if="loading" class="loading">
        <el-skeleton :rows="5" animated />
      </div>
      
      <template v-else-if="drafts.length > 0">
        <div v-for="draft in drafts" :key="draft.id" class="draft-item">
          <div class="draft-info" @click="$router.push(`/note/${draft.id}`)">
            <h3>{{ draft.title || '无标题' }}</h3>
            <p class="desc">{{ draft.content }}</p>
            <div class="meta">
              <span>更新于 {{ formatTime(draft.updatedAt) }}</span>
              <span v-if="draft.images && draft.images.length > 0">
                {{ draft.images.length }} 张图片
              </span>
            </div>
          </div>
          <div class="actions">
            <el-button type="primary" size="small" @click="handlePublish(draft.id)">发布</el-button>
            <el-button size="small" type="danger" @click="handleDelete(draft.id)">删除</el-button>
          </div>
        </div>
      </template>
      
      <div v-else class="empty">
        <el-empty description="暂无草稿">
          <el-button type="primary" @click="$router.push('/create')">去创作</el-button>
        </el-empty>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getDrafts, publishDraft, deleteDraft } from '@/api/note';
import { ElMessage, ElMessageBox } from 'element-plus';
import Layout from '@/components/Layout.vue';
import type { Note } from '@/types';
import dayjs from 'dayjs';

const router = useRouter();

const loading = ref(false);
const drafts = ref<Note[]>([]);

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm');
};

const fetchDrafts = async () => {
  loading.value = true;
  try {
    const res = await getDrafts({});
    drafts.value = res.list;
  } catch (error) {
    console.error('获取草稿失败:', error);
  } finally {
    loading.value = false;
  }
};

const handlePublish = async (id: string) => {
  try {
    await publishDraft(id);
    ElMessage.success('发布成功');
    drafts.value = drafts.value.filter(d => d.id !== id);
  } catch (error) {
    console.error('发布失败:', error);
  }
};

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇草稿吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    await deleteDraft(id);
    ElMessage.success('删除成功');
    drafts.value = drafts.value.filter(d => d.id !== id);
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
    }
  }
};

onMounted(() => {
  fetchDrafts();
});
</script>

<style lang="scss" scoped>
.drafts-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }
}

.draft-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  
  .draft-info {
    flex: 1;
    cursor: pointer;
    
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
      gap: 20px;
    }
  }
  
  .actions {
    display: flex;
    gap: 8px;
    margin-left: 20px;
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
