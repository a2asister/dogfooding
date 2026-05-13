<script setup lang="ts">
import type { TripNode } from '../types';

interface Props {
  node: TripNode;
}

defineProps<Props>();

const formatTime = (date: Date): string => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<template>
  <div class="trip-card animate-fade-in">
    <div class="card-header">
      <div class="location-icon">📍</div>
      <h3 class="location-name">{{ node.name }}</h3>
    </div>

    <div class="card-content">
      <div class="info-row" v-if="node.address">
        <span class="info-label">地址</span>
        <span class="info-value">{{ node.address }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">到达时间</span>
        <span class="info-value">{{ formatTime(node.arrivalTime) }}</span>
      </div>

      <div class="info-row note-row" v-if="node.note">
        <span class="info-label">备注</span>
        <p class="note-content">{{ node.note }}</p>
      </div>
    </div>

    <div class="card-decoration"></div>
  </div>
</template>

<style scoped>
.trip-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
}

.location-icon {
  font-size: 2rem;
  animation: bounce 2s ease infinite;
}

.location-name {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.info-label {
  min-width: 80px;
  font-weight: 600;
  color: #667eea;
  font-size: 0.9rem;
}

.info-value {
  color: #555;
  flex: 1;
}

.note-row {
  flex-direction: column;
  gap: 8px;
}

.note-content {
  margin: 0;
  color: #666;
  line-height: 1.6;
  background: rgba(102, 126, 234, 0.1);
  padding: 12px 15px;
  border-radius: 10px;
  border-left: 3px solid #667eea;
}

.card-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 0 0 0 100%;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>