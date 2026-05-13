<script setup lang="ts">
import { ref, computed } from 'vue';

interface FoodItem {
  id: number;
  name: string;
  calories: number;
  image: string;
}

const props = defineProps<{
  foods: FoodItem[];
}>();

const hoveredId = ref<number | null>(null);
const rotation = ref(0);

setInterval(() => {
  rotation.value += 0.5;
}, 30);

const getRotationStyle = computed(() => (id: number) => {
  const delay = id * 20;
  const currentRotation = (rotation.value + delay) % 360;
  const isHovered = hoveredId.value === id;
  return {
    transform: `rotateY(${currentRotation}deg) ${isHovered ? 'scale(1.2)' : ''}`,
    transition: isHovered ? 'transform 0.3s ease' : 'none',
  };
});

const emit = defineEmits<{
  select: [food: FoodItem];
}>();
</script>

<template>
  <div class="food-3d-container">
    <h2 class="section-title">🍎 食物3D展示</h2>
    <div class="foods-wrapper">
      <div
        v-for="food in foods"
        :key="food.id"
        class="food-card-3d"
        @mouseenter="hoveredId = food.id"
        @mouseleave="hoveredId = null"
        @click="emit('select', food)"
      >
        <div class="food-inner" :style="getRotationStyle(food.id)">
          <div class="food-front">
            <div class="food-emoji">🥗</div>
            <div class="food-name">{{ food.name }}</div>
            <div class="food-calories">{{ food.calories }} kcal</div>
          </div>
          <div class="food-back">
            <div class="food-emoji">🍽️</div>
            <div class="food-name">点击添加</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.food-3d-container {
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

.foods-wrapper {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
  perspective: 1000px;
}

.food-card-3d {
  width: 150px;
  height: 180px;
  cursor: pointer;
}

.food-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.food-front,
.food-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
}

.food-back {
  transform: rotateY(180deg);
  background: linear-gradient(145deg, #667eea, #764ba2);
}

.food-back .food-name {
  color: white;
}

.food-emoji {
  font-size: 48px;
  margin-bottom: 10px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.food-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.food-calories {
  font-size: 14px;
  color: #667eea;
  font-weight: 500;
}
</style>
