<template>
  <Layout>
    <div class="collections-page">
      <div class="page-header">
        <h1 class="title">我的合集</h1>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><FolderAdd /></el-icon>
          创建合集
        </el-button>
      </div>

      <div class="collections-grid">
        <div v-if="loading" class="loading">
          <el-skeleton :rows="6" animated />
        </div>

        <div v-else-if="collections.length > 0" class="grid-container">
          <div
            v-for="collection in collections"
            :key="collection.id"
            class="collection-card"
            @click="$router.push(`/collections/${collection.id}`)"
          >
            <div class="collection-cover">
              <div v-if="collection.cover" class="cover-img">
                <img :src="collection.cover" :alt="collection.name" />
              </div>
              <div v-else-if="collection.items && collection.items.length > 0" class="cover-grid">
                <img
                  v-for="(item, idx) in collection.items.slice(0, 4)"
                  :key="item.id"
                  :src="(item.note as any)?.images?.[0]"
                  v-if="(item.note as any)?.images?.[0]"
                />
                <div v-else class="placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </div>
              <div v-else class="cover-default">
                <el-icon><Folder /></el-icon>
              </div>
            </div>
            <div class="collection-info">
              <h3 class="collection-name">{{ collection.name }}</h3>
              <p class="collection-desc">{{ collection.description || '暂无描述' }}</p>
              <div class="collection-meta">
                <span>{{ collection.itemCount }} 个内容</span>
                <el-tag v-if="collection.isPublic" size="small">公开</el-tag>
                <el-tag v-else type="info" size="small">私密</el-tag>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-collections">
          <el-empty description="暂无合集，创建一个来收藏喜欢的内容吧~" />
        </div>
      </div>

      <div v-if="hasMore" class="load-more">
        <el-button :loading="loading" @click="loadMore">加载更多</el-button>
      </div>
    </div>

    <el-dialog v-model="showCreateDialog" title="创建合集" width="500px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="合集名称">
          <el-input v-model="createForm.name" placeholder="请输入合集名称" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="合集描述">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入合集描述（选填）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="公开状态">
          <el-switch v-model="createForm.isPublic" active-text="公开" inactive-text="私密" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="createCollection">创建</el-button>
      </template>
    </el-dialog>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getCollectionList, createCollection as apiCreateCollection } from '@/api/collection';
import { ElMessage } from 'element-plus';
import { FolderAdd, Folder, Picture } from '@element-plus/icons-vue';
import Layout from '@/components/Layout.vue';
import type { Collection } from '@/types';

const router = useRouter();
const userStore = useUserStore();

const collections = ref<Collection[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(20);
const hasMore = ref(true);
const showCreateDialog = ref(false);
const creating = ref(false);
const createForm = reactive({
  name: '',
  description: '',
  isPublic: false,
});

const fetchCollections = async (reset = false) => {
  if (!userStore.isLoggedIn) return;
  if (reset) {
    page.value = 1;
    hasMore.value = true;
    collections.value = [];
  }
  loading.value = true;
  try {
    const res = await getCollectionList({
      userId: userStore.user!.id,
      page: page.value,
      pageSize: pageSize.value,
    });
    collections.value = reset ? res.list : [...collections.value, ...res.list];
    hasMore.value = res.list.length >= pageSize.value;
    page.value++;
  } catch (error) {
    console.error('获取合集列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  fetchCollections();
};

const createCollection = async () => {
  if (!createForm.name.trim()) {
    ElMessage.warning('请输入合集名称');
    return;
  }
  creating.value = true;
  try {
    const res = await apiCreateCollection({
      name: createForm.name,
      description: createForm.description,
      isPublic: createForm.isPublic,
    });
    ElMessage.success('创建成功');
    showCreateDialog.value = false;
    createForm.name = '';
    createForm.description = '';
    createForm.isPublic = false;
    router.push(`/collections/${res.collection.id}`);
  } catch (error) {
    console.error('创建合集失败:', error);
  } finally {
    creating.value = false;
  }
};

onMounted(() => {
  fetchCollections(true);
});
</script>

<style lang="scss" scoped>
.collections-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  .title {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin: 0;
  }
}

.collections-grid {
  .loading {
    background: #fff;
    border-radius: 12px;
    padding: 30px;
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }

  .no-collections {
    background: #fff;
    border-radius: 12px;
    padding: 60px 20px;
  }
}

.collection-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  .collection-cover {
    height: 160px;
    background: #f0f0f0;
    overflow: hidden;

    .cover-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cover-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 1px;
      height: 100%;

      img,
      .placeholder {
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: #e8e8e8;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
        font-size: 24px;
      }
    }

    .cover-default {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: #fff;
      font-size: 48px;
    }
  }

  .collection-info {
    padding: 16px;

    .collection-name {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 0 0 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .collection-desc {
      color: #666;
      font-size: 13px;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 36px;
    }

    .collection-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: #999;
    }
  }
}

.load-more {
  text-align: center;
  margin-top: 30px;
}
</style>
