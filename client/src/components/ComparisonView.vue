<template>
  <div class="comparison-view">
    <div class="comparison-header">
      <h3 class="section-title">对比预览</h3>
    </div>
    
    <div class="comparison-grid">
      <div class="comparison-card">
        <div class="comparison-label original">原图</div>
        <div class="comparison-image">
          <img :src="original" alt="原图" />
        </div>
        <div class="comparison-stats">
          <span class="stat-label">体积</span>
          <span class="stat-value">{{ formatSize(originalSize) }}</span>
        </div>
      </div>
      
      <div class="comparison-divider">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="14 5 21 12 14 19"/>
          <polyline points="7 5 14 12 7 19"/>
        </svg>
      </div>
      
      <div class="comparison-card">
        <div class="comparison-label compressed">处理后</div>
        <div class="comparison-image">
          <img v-if="compressed" :src="compressed" alt="处理后" />
          <div v-else class="placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>待处理</span>
          </div>
        </div>
        <div class="comparison-stats" v-if="newSize">
          <span class="stat-label">体积</span>
          <span class="stat-value success">{{ formatSize(newSize) }}</span>
        </div>
        <div class="comparison-stats placeholder" v-else>
          <span class="stat-label">体积</span>
          <span class="stat-value">-</span>
        </div>
      </div>
    </div>
    
    <div class="compression-summary" v-if="originalSize && newSize">
      <div class="summary-item">
        <span class="summary-label">节省空间</span>
        <span class="summary-value accent">{{ ((originalSize - newSize) / originalSize * 100).toFixed(1) }}%</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">减少</span>
        <span class="summary-value success">{{ formatSize(originalSize - newSize) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  original: String,
  compressed: String,
  originalSize: Number,
  newSize: Number
})

function formatSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>

<style scoped>
.comparison-view {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.comparison-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: center;
}

.comparison-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.comparison-label {
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.comparison-label.original {
  background: rgba(148, 163, 184, 0.15);
  color: var(--text-secondary);
}

.comparison-label.compressed {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
  color: var(--accent-start);
}

.comparison-image {
  aspect-ratio: 1;
  background: #f1f5f9;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comparison-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comparison-image .placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
}

.comparison-image .placeholder svg {
  width: 32px;
  height: 32px;
}

.comparison-image .placeholder span {
  font-size: 12px;
}

.comparison-stats {
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comparison-stats.placeholder .stat-value {
  color: var(--text-muted);
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
}

.stat-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-value.success {
  color: var(--success);
}

.comparison-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-start), var(--accent-end));
  color: white;
}

.comparison-divider svg {
  width: 16px;
  height: 16px;
}

.compression-summary {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.summary-label {
  font-size: 11px;
  color: var(--text-muted);
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.summary-value.accent {
  background: linear-gradient(135deg, var(--accent-start), var(--accent-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.summary-value.success {
  color: var(--success);
}
</style>
