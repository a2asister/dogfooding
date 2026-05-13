<template>
  <div class="number-card">
    <div class="number-label">数据统计</div>
    <div class="number-value" :class="{ 'animate-value': animate }">
      {{ displayValue.toLocaleString() }}
    </div>
    <div class="number-trend" v-if="animate">
      <span class="trend-icon">📈</span>
      <span class="trend-text">实时更新中</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps<{
  data: {
    value?: number;
  };
  config?: Record<string, unknown>;
  animate?: boolean;
}>();

const displayValue = ref(0);
let animationFrame: number | null = null;
let updateInterval: ReturnType<typeof setInterval> | null = null;

const animateNumber = (target: number) => {
  const start = displayValue.value;
  const duration = 1000;
  const startTime = performance.now();
  
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    displayValue.value = Math.round(start + (target - start) * easeOutElastic(progress));
    
    if (progress < 1) {
      animationFrame = requestAnimationFrame(animate);
    }
  };
  
  animationFrame = requestAnimationFrame(animate);
};

const easeOutElastic = (x: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
};

onMounted(() => {
  if (props.data.value !== undefined) {
    animateNumber(props.data.value);
  }
  
  if (props.animate) {
    updateInterval = setInterval(() => {
      if (props.data.value !== undefined) {
        const variation = Math.floor(Math.random() * 100) - 50;
        const newValue = Math.max(0, props.data.value + variation);
        animateNumber(newValue);
      }
    }, 3000);
  }
});

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});

watch(() => props.data.value, (newVal) => {
  if (newVal !== undefined) {
    animateNumber(newVal);
  }
});
</script>

<style scoped>
.number-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 153, 255, 0.05) 100%);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.number-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.number-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
}

.number-value {
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(135deg, #00d4ff 0%, #00ff88 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
}

.animate-value {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.number-trend {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.trend-icon {
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>
