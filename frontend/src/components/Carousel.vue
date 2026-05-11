<template>
  <div class="carousel-container">
    <div class="carousel-main">
      <FadeCarousel
        v-if="mode === 'fade'"
        :images="images"
        :currentIndex="currentIndex"
        @update:currentIndex="$emit('update:currentIndex', $event)"
      />
      <FlipCarousel
        v-else-if="mode === 'flip'"
        :images="images"
        :currentIndex="currentIndex"
        @update:currentIndex="$emit('update:currentIndex', $event)"
      />
      <CubeCarousel
        v-else-if="mode === 'cube'"
        :images="images"
        :currentIndex="currentIndex"
        @update:currentIndex="$emit('update:currentIndex', $event)"
      />
      <StackCarousel
        v-else-if="mode === 'stack'"
        :images="images"
        :currentIndex="currentIndex"
        @update:currentIndex="$emit('update:currentIndex', $event)"
      />
    </div>

    <CircularThumbnails
      :images="images"
      :currentIndex="currentIndex"
      @update:currentIndex="$emit('update:currentIndex', $event)"
    />

    <div class="carousel-controls">
      <button class="nav-btn prev" @click="goPrev">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button class="nav-btn next" @click="goNext">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>

    <div class="image-info" v-if="images[currentIndex]">
      <h3 class="image-title">{{ images[currentIndex].title }}</h3>
      <p class="image-desc">{{ images[currentIndex].description }}</p>
      <span class="image-category">{{ images[currentIndex].category }}</span>
    </div>
  </div>
</template>

<script setup>
import FadeCarousel from './FadeCarousel.vue';
import FlipCarousel from './FlipCarousel.vue';
import CubeCarousel from './CubeCarousel.vue';
import StackCarousel from './StackCarousel.vue';
import CircularThumbnails from './CircularThumbnails.vue';

const props = defineProps({
  images: {
    type: Array,
    required: true,
  },
  mode: {
    type: String,
    default: 'fade',
  },
  currentIndex: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['update:currentIndex']);

function goPrev() {
  const newIndex = (props.currentIndex - 1 + props.images.length) % props.images.length;
  emit('update:currentIndex', newIndex);
}

function goNext() {
  const newIndex = (props.currentIndex + 1) % props.images.length;
  emit('update:currentIndex', newIndex);
}
</script>

<style scoped>
.carousel-container {
  position: relative;
  width: 900px;
  height: 600px;
}

.carousel-main {
  width: 100%;
  height: 500px;
  position: relative;
}

.carousel-controls {
  position: absolute;
  top: 220px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  pointer-events: none;
}

.nav-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  transition: all 0.3s ease;
  z-index: 20;
}

.nav-btn:hover {
  background: rgba(233, 69, 96, 0.7);
  transform: scale(1.1);
}

.nav-btn svg {
  width: 24px;
  height: 24px;
}

.image-info {
  position: absolute;
  bottom: 120px;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: #fff;
  text-align: center;
  pointer-events: none;
}

.image-title {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.image-desc {
  font-size: 1rem;
  color: #ccc;
  margin-bottom: 8px;
}

.image-category {
  display: inline-block;
  padding: 4px 12px;
  background: #e94560;
  border-radius: 20px;
  font-size: 0.85rem;
}
</style>
