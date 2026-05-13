<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface MealItem {
  name: string;
  calories: number;
  quantity: number;
}

const props = defineProps<{
  meals: MealItem[];
  dailyGoal: number;
}>();

const animatedCalories = ref(0);
const displayCalories = ref(0);

const totalCalories = computed(() => {
  return props.meals.reduce((sum, meal) => sum + meal.calories * meal.quantity, 0);
});

const progressPercent = computed(() => {
  return Math.min((totalCalories.value / props.dailyGoal) * 100, 100);
});

watch(
  totalCalories,
  (newVal) => {
    const startVal = displayCalories.value;
    const duration = 1000;
    const startTime = Date.now();
    
    const animate = (): void => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      displayCalories.value = Math.round(startVal + (newVal - startVal) * easeProgress);
      animatedCalories.value = displayCalories.value;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  },
  { immediate: true }
);
</script>

<template>
  <div class="plate-progress-container">
    <h2 class="section-title">🍽️ 今日餐盘</h2>
    
    <div class="plate-wrapper">
      <div class="plate">
        <div class="plate-inner">
          <div class="food-fill" :style="{ height: `${progressPercent}%` }">
            <div class="food-wave"></div>
            <div class="food-wave food-wave-2"></div>
          </div>
          <div class="plate-content">
            <div class="calories-display">
              <span class="calories-number">{{ animatedCalories }}</span>
              <span class="calories-unit">kcal</span>
            </div>
            <div class="calories-goal">目标: {{ dailyGoal }} kcal</div>
          </div>
        </div>
        <div class="plate-rim"></div>
      </div>
    </div>

    <div class="meals-list">
      <div v-for="(meal, index) in meals" :key="index" class="meal-item">
        <span class="meal-name">{{ meal.name }}</span>
        <span class="meal-calories">{{ meal.calories * meal.quantity }} kcal</span>
      </div>
      <div v-if="meals.length === 0" class="empty-meals">
        餐盘空空如也，快去添加食物吧！🍴
      </div>
    </div>
  </div>
</template>

<style scoped>
.plate-progress-container {
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

.plate-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.plate {
  position: relative;
  width: 250px;
  height: 250px;
}

.plate-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffffff, #e6e6e6);
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.1),
    inset 0 2px 10px rgba(255, 255, 255, 0.8);
  overflow: hidden;
  position: relative;
}

.food-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #ffecd2 0%, #fcb69f 100%);
  transition: height 0.5s ease;
  border-radius: 0 0 50% 50%;
}

.food-wave {
  position: absolute;
  top: -10px;
  left: -25%;
  width: 150%;
  height: 20px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath fill='%23ffd4a3' d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.5'%3E%3C/path%3E%3C/svg%3E");
  background-size: 50% 100%;
  animation: wave 3s linear infinite;
}

.food-wave-2 {
  top: -5px;
  animation: wave 4s linear infinite reverse;
  opacity: 0.7;
}

@keyframes wave {
  0% {
    background-position-x: 0;
  }
  100% {
    background-position-x: 100%;
  }
}

.plate-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
}

.calories-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.calories-number {
  font-size: 48px;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
}

.calories-unit {
  font-size: 16px;
  color: #999;
  margin-top: 5px;
}

.calories-goal {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}

.plate-rim {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  border: 8px solid rgba(102, 126, 234, 0.3);
  pointer-events: none;
}

.meals-list {
  max-height: 200px;
  overflow-y: auto;
}

.meal-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 8px;
}

.meal-name {
  font-weight: 500;
}

.meal-calories {
  color: #667eea;
  font-weight: 600;
}

.empty-meals {
  text-align: center;
  color: #999;
  padding: 30px;
  font-size: 16px;
}
</style>
