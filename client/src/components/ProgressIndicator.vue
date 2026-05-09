<template>
  <div class="progress-section">
    <div class="progress-header">
      <span class="progress-label">{{ status }}</span>
      <span class="progress-percent">{{ progress }}%</span>
    </div>
    
    <div class="progress-bar-container">
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :style="{ width: progress + '%' }"
        >
          <div class="flow-effect"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  progress: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: '处理中...'
  }
})
</script>

<style scoped>
.progress-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.progress-percent {
  font-size: 13px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--accent-start), var(--accent-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.progress-bar-container {
  position: relative;
}

.progress-bar {
  height: 8px;
  background: rgba(99, 102, 241, 0.15);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--accent-start), var(--accent-end), var(--accent-start), var(--accent-end));
  background-size: 200% 100%;
  animation: flowGradient 2s linear infinite;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.flow-effect {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  background-size: 50% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes flowGradient {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
