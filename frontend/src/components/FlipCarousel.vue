<template>
  <div class="flip-carousel">
    <div class="flip-container">
      <div class="flip-card" :style="{ transform: `rotateY(${rotation}deg)` }">
        <div class="flip-face front">
          <img :src="currentImage?.url" :alt="currentImage?.title" />
        </div>
        <div class="flip-face back">
          <img :src="nextImage?.url" :alt="nextImage?.title" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  images: { type: Array, required: true },
  currentIndex: { type: Number, required: true },
});

const emit = defineEmits(['update:currentIndex']);

const rotation = ref(0);
const isAnimating = ref(false);
const displayIndex = ref(0);

const currentImage = computed(() => props.images[displayIndex.value % props.images.length]);
const nextImage = computed(() => props.images[(displayIndex.value + 1) % props.images.length]);

watch(() => props.currentIndex, (newIndex, oldIndex) => {
  if (newIndex !== displayIndex.value % props.images.length && !isAnimating.value) {
    const direction = newIndex > oldIndex ? 1 : -1;
    isAnimating.value = true;
    
    if (direction > 0) {
      rotation.value += 180;
    } else {
      rotation.value -= 180;
    }
    
    setTimeout(() => {
      displayIndex.value = newIndex;
      isAnimating.value = false;
    }, 700);
  }
});

onMounted(() => {
  displayIndex.value = props.currentIndex;
});
</script>

<style scoped>
.flip-carousel {
  width: 100%;
  height: 100%;
  perspective: 1500px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.flip-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.flip-card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.flip-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.flip-face.back {
  transform: rotateY(180deg);
}

.flip-face img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
