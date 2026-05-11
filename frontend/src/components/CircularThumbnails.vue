<template>
  <div class="circular-thumbnails">
    <div class="circle-container">
      <div
        v-for="(img, index) in images"
        :key="img.id"
        class="thumbnail-wrapper"
        :style="getThumbnailPosition(index)"
        :class="{ active: index === currentIndex }"
        @click="$emit('update:currentIndex', index)"
      >
        <div class="thumbnail">
          <img :src="img.url" :alt="img.title" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  images: { type: Array, required: true },
  currentIndex: { type: Number, required: true },
});

defineEmits(['update:currentIndex']);

const radius = 180;

function getThumbnailPosition(index) {
  const angle = (index / props.images.length) * 2 * Math.PI - Math.PI / 2;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  
  return {
    transform: `translate(${x}px, ${y}px)`,
  };
}
</script>

<style scoped>
.circular-thumbnails {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.circle-container {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-wrapper {
  position: absolute;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1;
}

.thumbnail-wrapper:hover {
  z-index: 10;
}

.thumbnail {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-wrapper.active .thumbnail {
  width: 70px;
  height: 70px;
  border: 3px solid #e94560;
  box-shadow: 0 0 20px rgba(233, 69, 96, 0.8),
              0 0 40px rgba(233, 69, 96, 0.6),
              0 0 60px rgba(233, 69, 96, 0.4);
  animation: glow 2s ease-in-out infinite;
  z-index: 20;
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(233, 69, 96, 0.8),
                0 0 40px rgba(233, 69, 96, 0.6),
                0 0 60px rgba(233, 69, 96, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(233, 69, 96, 1),
                0 0 60px rgba(233, 69, 96, 0.8),
                0 0 90px rgba(233, 69, 96, 0.6);
  }
}

.thumbnail-wrapper:hover:not(.active) .thumbnail {
  border-color: rgba(255, 255, 255, 0.7);
  transform: scale(1.1);
}
</style>
