<template>
  <div class="stack-carousel">
    <div class="stack-container">
      <div
        v-for="(img, index) in displayStack"
        :key="img.id + '-' + index"
        class="stack-card"
        :style="getCardStyle(index)"
        :class="{ 'fly-out': isFlyingOut && index === 0 }"
      >
        <img :src="img.url" :alt="img.title" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  images: { type: Array, required: true },
  currentIndex: { type: Number, required: true },
});

const isFlyingOut = ref(false);
const baseIndex = ref(0);

const displayStack = computed(() => {
  const stack = [];
  const count = Math.min(5, props.images.length);
  for (let i = 0; i < count; i++) {
    const idx = (baseIndex.value + i) % props.images.length;
    stack.push(props.images[idx]);
  }
  return stack;
});

function getCardStyle(index) {
  const totalCards = displayStack.value.length;
  const zIndex = totalCards - index;
  const scale = 1 - index * 0.05;
  const translateY = index * 15;
  const rotateZ = (index % 2 === 0 ? 1 : -1) * index * 2;

  return {
    zIndex,
    transform: `translateY(${translateY}px) scale(${scale}) rotateZ(${rotateZ}deg)`,
  };
}

watch(() => props.currentIndex, (newIndex) => {
  isFlyingOut.value = true;
  setTimeout(() => {
    baseIndex.value = newIndex;
    isFlyingOut.value = false;
  }, 500);
});
</script>

<style scoped>
.stack-carousel {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stack-container {
  width: 700px;
  height: 450px;
  position: relative;
}

.stack-card {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fff;
}

.stack-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stack-card.fly-out {
  animation: flyOut 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes flyOut {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-200px) translateX(100px) scale(0.5) rotate(15deg);
    opacity: 0;
  }
}
</style>
