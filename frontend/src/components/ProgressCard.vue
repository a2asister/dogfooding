<template>
  <div class="progress-card">
    <div class="progress-label">完成进度</div>
    <div class="progress-bar-container">
      <div 
        class="progress-bar" 
        :style="{ width: `${displayValue}%` }"
        :class="{ 'animate-progress': animate }"
      >
        <div class="progress-glow"></div>
      </div>
    </div>
    <div class="progress-value">{{ displayValue.toFixed(1) }}%</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps<{
  data: {
    value?: number;
  };
  config?: Record<string, unknown>;
  animate?: boolean;
}>();

const displayValue = ref(0);

const animateProgress = (target: number) => {
  const start = displayValue.value;
  const duration = 1500;
  const startTime = performance.now();
  
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    displayValue.value = start + (target - start) * easeOutCubic(progress);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
};

const easeOutCubic = (x: number): number => {
  return 1 - Math.pow(1 - x, 3);
};

onMounted(() => {
  if (props.data.value !== undefined) {
    animateProgress(props.data.value);
  }
});

watch(() => props.data.value, (newVal) => {
  if (newVal !== undefined) {
    animateProgress(newVal);
  }
});
</script>

<style scoped>
.progress-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.1) 0%, rgba(255, 107, 0, 0.05) 100%);
  border-radius: 8px;
}

.progress-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 15px;
}

.progress-bar-container {
  width: 80%;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff9500 0%, #ff6b00 100%);
  border-radius: 6px;
  position: relative;
  transition: width 0.3s ease;
}

.animate-progress {
  animation: shimmer-progress 2s infinite;
}

.progress-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer-glow 1.5s infinite;
}

@keyframes shimmer-progress {
  0%, 100% {
    box-shadow: 0 0 10px rgba(255, 149, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 149, 0, 0.8);
  }
}

@keyframes shimmer-glow {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-value {
  font-size: 24px;
  font-weight: bold;
  color: #ff9500;
  text-shadow: 0 0 10px rgba(255, 149, 0, 0.5);
}
</style>
