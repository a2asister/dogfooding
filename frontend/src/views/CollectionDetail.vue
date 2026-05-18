<template>
  <Layout>
    <div class="collection-detail-page">
      <div v-if="loading" class="loading">
        <el-skeleton :rows="10" animated />
      </div>

      <template v-else-if="collection">
        <div class="collection-header">
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
            <div class="collection-title">
              <h1>{{ collection.name }}</h1>
              <el-tag v-if="collection.isPublic" size="small">公开</el-tag>
              <el-tag v-else type="info" size="small">私密</el-tag>
            </div>
            <p class="collection-desc">{{ collection.description || '暂无描述' }}</p>
            <div class="collection-meta">
              <span>{{ collection.itemCount }} 个内容</span>
              <span>创建于 {{ formatTime(collection.createdAt) }}</span>
            </div>
            <div class="collection-actions" v-if="isOwner">
              <el-button @click="showEditDialog = true">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" @click="handleDelete">
                <el-icon><Delete /></el-icon>
                删除合集
              </el-button>
              <el-dropdown trigger="click" @command="handleShareCommand">
                <el-button>
                  <el-icon><Share /></el-icon>
                  分享
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="copy">
                      <el-icon><Link /></el-icon>
                      复制链接
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>

        <div class="collection-content">
          <div class="content-header">
            <h3>合集内容 ({{ notes.length }})</h3>
          </div>

          <div v-if="notesLoading" class="notes-loading">
            <el-skeleton :rows="5" animated />
          </div>

          <div v-else-if="notes.length > 0" class="notes-list">
            <div
              v-for="item in notes"
              :key="item.id"
              class="note-item"
            >
              <div class="note-content" @click="$router.push(`/note/${(item.note as any).id}`)">
                <img
                  v-if="(item.note as any).images?.[0]"
                  :src="(item.note as any).images[0]"
                  class="note-cover"
                />
                <div v-else class="note-cover default">
                  <el-icon><Picture /></el-icon>
                </div>
                <div class="note-info">
                  <h4 class="note-title">{{ (item.note as any).title }}</h4>
                  <div class="note-meta">
                    <el-avatar :size="20" :src="(item.note as any).author?.avatar">
                      {{ (item.note as any).author?.nickname?.charAt(0) }}
                    </el-avatar>
                    <span>{{ (item.note as any).author?.nickname }}</span>
                  </div>
                </div>
              </div>
              <el-button
                v-if="isOwner"
                type="danger"
                size="small"
                text
                @click="handleRemoveNote(item.id)"
              >
                移除
              </el-button>
            </div>
          </div>

          <div v-else class="no-notes">
            <el-empty description="合集还没有内容，快去添加喜欢的笔记吧~" />
          </div>
        </div>
      </template>
    </div>

    <el-dialog v-model="showEditDialog" title="编辑合集" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="合集名称">
          <el-input v-model="editForm.name" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="合集描述">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="公开状态">
          <el-switch v-model="editForm.isPublic" active-text="公开" inactive-text="私密" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getCollectionDetail, updateCollection, deleteCollection, removeNoteFromCollection } from '@/api/collection';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Folder, Picture, Edit, Delete, Share, ArrowDown, Link } from '@element-plus/icons-vue';
import Layout from '@/components/Layout.vue';
import type { Collection } from '@/types';
import dayjs from 'dayjs';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const notesLoading = ref(false);
const collection = ref<Collection | null>(null);
const notes = ref<any[]>([]);
const showEditDialog = ref(false);
const saving = ref(false);

const editForm = reactive({
  name: '',
  description: '',
  isPublic: false,
});

const isOwner = computed(() => {
  return collection.value && userStore.user && collection.value.userId === userStore.user.id;
});

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD');
};

const fetchCollection = async () => {
  loading.value = true;
  try {
    const id = route.params.id as string;
    const res = await getCollectionDetail(id);
    collection.value = res.collection;
    notes.value = res.collection.items || [];
  } catch (error) {
    console.error('获取合集详情失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleDelete = async () => {
  await ElMessageBox.confirm('确定要删除这个合集吗？删除后无法恢复。', '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  });
  try {
    await deleteCollection(collection.value!.id);
    ElMessage.success('删除成功');
    router.push('/collections');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
    }
  }
};

const handleEdit = () => {
  if (!collection.value) return;
  editForm.name = collection.value.name;
  editForm.description = collection.value.description || '';
  editForm.isPublic = collection.value.isPublic;
  showEditDialog.value = true;
};

const saveEdit = async () => {
  if (!editForm.name.trim()) {
    ElMessage.warning('请输入合集名称');
    return;
  }
  saving.value = true;
  try {
    await updateCollection(collection.value!.id, editForm);
    ElMessage.success('保存成功');
    showEditDialog.value = false;
    fetchCollection();
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    saving.value = false;
  }
};

const handleRemoveNote = async (itemId: string) => {
  await ElMessageBox.confirm('确定要从合集中移除这个笔记吗？', '提示', {
    confirmButtonText: '移除',
    cancelButtonText: '取消',
    type: 'warning',
  });
  try {
    await removeNoteFromCollection(itemId);
    notes.value = notes.value.filter(item => item.id !== itemId);
    if (collection.value) {
      collection.value.itemCount = Math.max(0, collection.value.itemCount - 1);
    }
    ElMessage.success('已移除');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除失败:', error);
    }
  }
};

const handleShareCommand = async (command: string) => {
  switch (command) {
    case 'copy':
      const url = `${window.location.origin}/collections/${collection.value!.id}`;
      try {
        await navigator.clipboard.writeText(url);
        ElMessage.success('链接已复制');
      } catch (error) {
        console.error('复制失败:', error);
      }
      break;
  }
};

onMounted(() => {
  fetchCollection();
});
</script>

<style lang="scss" scoped>
.collection-detail-page {
  max-width: 900px;
  margin: 0 auto;
}

.loading {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
}

.collection-header {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  display: flex;
  gap: 24px;

  .collection-cover {
    width: 180px;
    height: 180px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f0f0f0;

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
      font-size: 56px;
    }
  }

  .collection-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .collection-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      h1 {
        font-size: 24px;
        font-weight: 700;
        color: #333;
        margin: 0;
      }
    }

    .collection-desc {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .collection-meta {
      display: flex;
      gap: 24px;
      font-size: 14px;
      color: #999;
      margin-bottom: 20px;
    }

    .collection-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.collection-content {
  background: #fff;
  border-radius: 12px;
  padding: 20px;

  .content-header {
    margin-bottom: 20px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
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
    gap: 16px;
  }

  .note-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    border-radius: 8px;
    transition: background 0.3s;

    &:hover {
      background: #f5f5f5;
    }

    .note-content {
      flex: 1;
      display: flex;
      gap: 12px;
      cursor: pointer;

      .note-cover {
        width: 80px;
        height: 80px;
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
        background: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
        font-size: 24px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        &.default {
          background: #f0f0f0;
        }
      }

      .note-info {
        flex: 1;
        min-width: 0;

        .note-title {
          font-size: 15px;
          font-weight: 600;
          color: #333;
          margin: 0 0 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .note-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #999;
        }
      }
    }
  }
}
</style>
