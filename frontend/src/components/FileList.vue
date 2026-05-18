<template>
  <div class="file-list">
    <div v-if="files.length === 0" class="empty-state">
      <p>暂无上传文件</p>
    </div>

    <div v-else class="file-list-header">
      <label class="select-all">
        <input
          type="checkbox"
          :checked="allSelected"
          :indeterminate="someSelected"
          @change="toggleSelectAll"
        />
        全选
      </label>
      <span class="file-count">{{ files.length }} 个文件</span>
      <button v-if="files.length > 0" class="clear-btn" type="button" @click="$emit('clearAll')">
        清空
      </button>
    </div>

    <div class="file-items">
      <div
        v-for="file in files"
        :key="file.id"
        class="file-item"
        :class="{ selected: selectedIds.has(file.id) }"
      >
        <div class="file-checkbox">
          <input
            type="checkbox"
            :checked="selectedIds.has(file.id)"
            @change="$emit('toggleSelect', file.id)"
          />
        </div>
        <div class="file-icon">{{ getFormatIcon(file.originalFormat) }}</div>
        <div class="file-info">
          <div class="file-name" :title="file.originalName">{{ file.originalName }}</div>
          <div class="file-meta">
            <span class="format-tag">{{ file.originalFormat.toUpperCase() }}</span>
            <span class="file-size">{{ formatSize(file.fileSize) }}</span>
          </div>
        </div>
        <button class="remove-btn" type="button" @click="$emit('remove', file.id)" title="移除">
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AudioFile, AudioFormat } from '../types';

const props = defineProps<{
  files: AudioFile[];
  selectedIds: Set<string>;
}>();

const emit = defineEmits<{
  toggleSelect: [fileId: string];
  remove: [fileId: string];
  clearAll: [];
}>();

const allSelected = computed(() => {
  return props.files.length > 0 && props.files.every((f) => props.selectedIds.has(f.id));
});

const someSelected = computed(() => {
  const selectedCount = props.files.filter((f) => props.selectedIds.has(f.id)).length;
  return selectedCount > 0 && selectedCount < props.files.length;
});

function toggleSelectAll(e: Event): void {
  const target = e.target as HTMLInputElement;
  if (target.checked) {
    props.files.forEach((f) => emit('toggleSelect', f.id));
  } else {
    props.files.forEach((f) => {
      if (props.selectedIds.has(f.id)) {
        emit('toggleSelect', f.id);
      }
    });
  }
}

function getFormatIcon(format: AudioFormat): string {
  const icons: Record<AudioFormat, string> = {
    flac: '🎵',
    wav: '🎶',
    mp3: '🎧'
  };
  return icons[format] || '📄';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<style scoped>
.file-list {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
}

.empty-state {
  padding: 48px;
  text-align: center;
  color: #718096;
}

.file-list-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.select-all {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a0aec0;
  cursor: pointer;
  font-size: 14px;
}

.select-all input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.file-count {
  color: #718096;
  font-size: 14px;
}

.clear-btn {
  margin-left: auto;
  background: rgba(239, 68, 68, 0.2);
  color: #fc8181;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.file-items {
  max-height: 400px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s;
}

.file-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.file-item.selected {
  background: rgba(102, 126, 234, 0.1);
  border-left: 3px solid #667eea;
}

.file-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.file-icon {
  font-size: 28px;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  color: #e2e8f0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.format-tag {
  background: rgba(102, 126, 234, 0.2);
  color: #90cdf4;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.file-size {
  color: #718096;
  font-size: 12px;
}

.remove-btn {
  background: transparent;
  color: #718096;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  opacity: 0;
}

.file-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fc8181;
}
</style>
