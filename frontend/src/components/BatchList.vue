<template>
  <div class="batch-list">
    <h3 v-if="batches.length > 0">转换任务</h3>

    <div v-if="batches.length === 0" class="empty-state">
      <p>暂无转换任务</p>
    </div>

    <div v-else class="batch-items">
      <div
        v-for="batch in batches"
        :key="batch.id"
        class="batch-item"
        :class="batch.status"
      >
        <div class="batch-header">
          <div class="batch-status">
            <span class="status-icon">{{ getStatusIcon(batch.status) }}</span>
            <span class="status-text">{{ getStatusText(batch.status) }}</span>
          </div>
          <span class="batch-time">{{ formatTime(batch.createdAt) }}</span>
        </div>

        <div class="batch-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${getProgressPercent(batch)}%` }"
            ></div>
          </div>
          <div class="progress-text">
            {{ batch.progress.completed }} / {{ batch.progress.total }} 完成
            <span v-if="batch.progress.failed > 0" class="failed-count">
              ({{ batch.progress.failed }} 失败)
            </span>
          </div>
        </div>

        <div class="batch-tasks">
          <div
            v-for="task in batch.tasks.slice(0, 3)"
            :key="task.id"
            class="task-item"
          >
            <span class="task-status-dot" :class="task.status"></span>
            <span class="task-format">{{ task.options.targetFormat.toUpperCase() }}</span>
            <span class="task-quality">{{ getQualityLabel(task.options.quality) }}</span>
            <button
              v-if="task.status === 'completed'"
              class="download-task-btn"
              type="button"
              @click="$emit('downloadTask', task.id)"
            >
              下载
            </button>
          </div>
          <div v-if="batch.tasks.length > 3" class="more-tasks">
            +{{ batch.tasks.length - 3 }} 更多任务
          </div>
        </div>

        <div v-if="batch.status === 'completed' || batch.status === 'failed'" class="batch-actions">
          <button
            v-if="batch.progress.completed > 0"
            class="download-all-btn"
            type="button"
            @click="$emit('downloadBatch', batch.id)"
          >
            📦 打包下载全部
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { qualityOptions } from '../types';
import type { BatchInfo, TaskStatus } from '../types';

defineProps<{
  batches: BatchInfo[];
}>();

defineEmits<{
  downloadTask: [taskId: string];
  downloadBatch: [batchId: string];
}>();

function getStatusIcon(status: TaskStatus): string {
  const icons: Record<TaskStatus, string> = {
    pending: '⏳',
    processing: '🔄',
    completed: '✅',
    failed: '❌'
  };
  return icons[status];
}

function getStatusText(status: TaskStatus): string {
  const texts: Record<TaskStatus, string> = {
    pending: '等待中',
    processing: '转换中',
    completed: '已完成',
    failed: '失败'
  };
  return texts[status];
}

function getProgressPercent(batch: BatchInfo): number {
  if (batch.progress.total === 0) return 0;
  return Math.round(((batch.progress.completed + batch.progress.failed) / batch.progress.total) * 100);
}

function getQualityLabel(quality: string): string {
  const opt = qualityOptions.find((q) => q.value === quality);
  return opt?.label || quality;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}
</script>

<style scoped>
.batch-list {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 24px;
}

.batch-list h3 {
  color: #e2e8f0;
  font-size: 18px;
  margin-bottom: 20px;
}

.empty-state {
  padding: 32px;
  text-align: center;
  color: #718096;
}

.batch-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.batch-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  border-left: 3px solid transparent;
  transition: all 0.3s;
}

.batch-item.processing {
  border-left-color: #ecc94b;
}

.batch-item.completed {
  border-left-color: #48bb78;
}

.batch-item.failed {
  border-left-color: #f56565;
}

.batch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.batch-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-icon {
  font-size: 18px;
}

.status-text {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 14px;
}

.batch-time {
  color: #718096;
  font-size: 13px;
}

.batch-progress {
  margin-bottom: 16px;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.batch-item.completed .progress-fill {
  background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
}

.batch-item.failed .progress-fill {
  background: linear-gradient(90deg, #f56565 0%, #e53e3e 100%);
}

.progress-text {
  color: #a0aec0;
  font-size: 13px;
}

.failed-count {
  color: #fc8181;
}

.batch-tasks {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  font-size: 13px;
}

.task-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #718096;
}

.task-status-dot.completed {
  background: #48bb78;
}

.task-status-dot.processing {
  background: #ecc94b;
  animation: pulse 1s infinite;
}

.task-status-dot.failed {
  background: #f56565;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.task-format {
  color: #90cdf4;
  font-weight: 600;
}

.task-quality {
  color: #a0aec0;
  flex: 1;
}

.download-task-btn {
  background: rgba(102, 126, 234, 0.2);
  color: #a0aec0;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.download-task-btn:hover {
  background: rgba(102, 126, 234, 0.4);
  color: #fff;
}

.more-tasks {
  color: #718096;
  font-size: 12px;
  text-align: center;
  padding: 8px;
}

.batch-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.download-all-btn {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.download-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
}
</style>
