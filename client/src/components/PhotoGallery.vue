<script setup lang="ts">
import { usePhotoStore } from '@/stores/photo';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getImageUrl } from '@/api';
import type { PhotoRecord } from '@/types';

const emit = defineEmits<{
  select: [id: string];
  delete: [id: string];
}>();

const store = usePhotoStore();

const statusMap: Record<PhotoRecord['status'], { text: string; class: string }> = {
  pending: { text: '等待中', class: 'status-processing' },
  processing: { text: '处理中', class: 'status-processing' },
  completed: { text: '已完成', class: 'status-completed' },
  failed: { text: '失败', class: 'status-failed' },
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN');
}

function handleClick(photo: PhotoRecord): void {
  if (photo.status === 'completed') {
    emit('select', photo.id);
  }
}

async function handleDelete(e: Event, id: string): Promise<void> {
  e.stopPropagation();
  try {
    await ElMessageBox.confirm('确定要删除这张照片吗？', '删除确认', {
      type: 'warning',
    });
    await store.deletePhoto(id);
    emit('delete', id);
    ElMessage.success('删除成功');
  } catch {
    // user canceled
  }
}

function getPreviewUrl(photo: PhotoRecord): string {
  if (photo.processedPath) {
    return getImageUrl(photo.processedPath);
  }
  return getImageUrl(photo.originalPath);
}
</script>

<template>
  <div>
    <div v-if="store.loading" style="text-align: center; padding: 40px; color: #999">
      加载中...
    </div>
    <div v-else-if="store.photos.length === 0" class="empty-state">
      <div class="empty-state-icon">🖼️</div>
      <div class="empty-state-text">暂无照片，上传第一张老照片吧</div>
    </div>
    <div v-else class="photo-grid">
      <div
        v-for="photo in store.photos"
        :key="photo.id"
        class="photo-card"
        @click="handleClick(photo)"
      >
        <div class="photo-thumb">
          <img :src="getPreviewUrl(photo)" :alt="photo.originalName" />
          <span class="photo-status" :class="statusMap[photo.status].class">
            {{ statusMap[photo.status].text }}
          </span>
          <button
            class="delete-btn"
            @click="(e): void => void handleDelete(e, photo.id)"
            style="
              position: absolute;
              top: 10px;
              left: 10px;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: rgba(0, 0, 0, 0.5);
              color: #fff;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
            "
            title="删除"
          >
            ×
          </button>
        </div>
        <div class="photo-info">
          <div class="photo-name">{{ photo.originalName }}</div>
          <div class="photo-date">{{ formatDate(photo.createdAt) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
