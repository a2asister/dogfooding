<template>
  <div class="cube-carousel">
    <div class="scene">
      <div class="cube" :style="cubeStyle">
        <div v-for="(img, index) in displayImages" :key="img.id" class="face" :style="getFaceStyle(index)">
          <img :src="img.url" :alt="img.title" />
        </div>
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

const rotation = ref(0);
const prevIndex = ref(0);

const displayImages = computed(() => {
  const imgs = [];
  for (let i = 0; i < 4; i++) {
    const idx = ((rotation.value / 90) % props.images.length + props.images.length) % props.images.length;
    imgs.push(props.images[(idx + i) % props.images.length]);
  }
  return imgs;
});

const cubeStyle = computed(() => ({
  transform: `rotateY(${-rotation.value}deg) translateZ(450px)`,
}));

function getFaceStyle(index) {
  const rotations = [
    { r: 0, t: 0 },
    { r: 90, t: 900 },
    { r: 180, t: 900 },
    { r: -90, t: 900 },
  ];
  return {
    transform: `rotateY(${rotations[index].r}deg) translateZ(${rotations[index].t / 2}px)`,
    width: '900px',
    height: '500px',
  };
}

watch(() => props.currentIndex, (newIndex) => {
  const diff = newIndex - prevIndex.value;
  rotation.value += diff * 90;
  prevIndex.value = newIndex;
});
</script>

<style scoped>
.cube-carousel {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scene {
  width: 900px;
  height: 500px;
  perspective: 2000px;
}

.cube {
  width: 900px;
  height: 500px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.face {
  position: absolute;
  transform-style: preserve-3d;
  backface-visibility: visible;
}

.face img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}
</style>
