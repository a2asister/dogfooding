<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface NutritionData {
  protein: number;
  fat: number;
  carbs: number;
}

const props = defineProps<{
  nutrition: NutritionData;
}>();

const animatedPercent = ref(0);

const total = computed(() => {
  return props.nutrition.protein + props.nutrition.fat + props.nutrition.carbs;
});

const percentages = computed(() => {
  if (total.value === 0) {
    return { protein: 0, fat: 0, carbs: 0 };
  }
  return {
    protein: (props.nutrition.protein / total.value) * 100,
    fat: (props.nutrition.fat / total.value) * 100,
    carbs: (props.nutrition.carbs / total.value) * 100,
  };
});

const getStrokeDasharray = computed(() => (percent: number) => {
  const circumference = 2 * Math.PI * 80;
  const animatedValue = (percent / 100) * (animatedPercent.value / 100);
  return `${animatedValue * circumference} ${circumference}`;
});

const getStrokeOffset = computed(() => (index: number) => {
  const circumference = 2 * Math.PI * 80;
  const keys = ['protein', 'fat', 'carbs'] as const;
  let offset = 0;
  for (let i = 0; i < index; i++) {
    offset += (percentages.value[keys[i]] / 100) * circumference;
  }
  return -offset;
});

onMounted(() => {
  const duration = 2000;
  const startTime = Date.now();
  
  const animate = (): void => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    animatedPercent.value = easeProgress * 100;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
});
</script>

<template>
  <div class="nutrition-ring-container">
    <h2 class="section-title">🥗 营养成分分布</h2>
    
    <div class="ring-wrapper">
      <svg viewBox="0 0 200 200" class="nutrition-ring">
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="#f0f0f0"
          stroke-width="20"
        />
        
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="url(#proteinGradient)"
          stroke-width="20"
          stroke-linecap="round"
          :stroke-dasharray="getStrokeDasharray(percentages.protein)"
          :stroke-dashoffset="getStrokeOffset(0)"
          transform="rotate(-90 100 100)"
        />
        
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="url(#fatGradient)"
          stroke-width="20"
          stroke-linecap="round"
          :stroke-dasharray="getStrokeDasharray(percentages.fat)"
          :stroke-dashoffset="getStrokeOffset(1)"
          transform="rotate(-90 100 100)"
        />
        
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="url(#carbsGradient)"
          stroke-width="20"
          stroke-linecap="round"
          :stroke-dasharray="getStrokeDasharray(percentages.carbs)"
          :stroke-dashoffset="getStrokeOffset(2)"
          transform="rotate(-90 100 100)"
        />
        
        <defs>
          <linearGradient id="proteinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#667eea" />
            <stop offset="100%" stop-color="#764ba2" />
          </linearGradient>
          <linearGradient id="fatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f093fb" />
            <stop offset="100%" stop-color="#f5576c" />
          </linearGradient>
          <linearGradient id="carbsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4facfe" />
            <stop offset="100%" stop-color="#00f2fe" />
          </linearGradient>
        </defs>
      </svg>
      
      <div class="ring-center">
        <div class="total-label">总计</div>
        <div class="total-value">{{ total }}g</div>
      </div>
    </div>

    <div class="nutrition-legend">
      <div class="legend-item">
        <div class="legend-color protein"></div>
        <div class="legend-info">
          <span class="legend-name">蛋白质</span>
          <span class="legend-value">{{ nutrition.protein }}g ({{ percentages.protein.toFixed(1) }}%)</span>
        </div>
      </div>
      <div class="legend-item">
        <div class="legend-color fat"></div>
        <div class="legend-info">
          <span class="legend-name">脂肪</span>
          <span class="legend-value">{{ nutrition.fat }}g ({{ percentages.fat.toFixed(1) }}%)</span>
        </div>
      </div>
      <div class="legend-item">
        <div class="legend-color carbs"></div>
        <div class="legend-info">
          <span class="legend-name">碳水化合物</span>
          <span class="legend-value">{{ nutrition.carbs }}g ({{ percentages.carbs.toFixed(1) }}%)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nutrition-ring-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.section-title {
  font-size: 24px;
  color: #667eea;
  margin-bottom: 25px;
  text-align: center;
}

.ring-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.nutrition-ring {
  width: 220px;
  height: 220px;
  transform: rotate(0deg);
}

.ring-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.total-label {
  font-size: 14px;
  color: #999;
}

.total-value {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
}

.nutrition-legend {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-color.protein {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.legend-color.fat {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.legend-color.carbs {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.legend-info {
  display: flex;
  justify-content: space-between;
  flex: 1;
}

.legend-name {
  font-weight: 500;
  color: #333;
}

.legend-value {
  color: #666;
  font-size: 14px;
}
</style>
