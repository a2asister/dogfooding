<template>
  <div class="fade-carousel">
    <div
      v-for="(img, index) in images"
      :key="img.id"
      class="slide"
      :class="{ active: index === currentIndex }"
    >
      <img :src="img.url" :alt="img.title" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  images: { type: Array, required: true },
  currentIndex: { type: Number, required: true },
});
</script>

<style scoped>
.fade-carousel {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
}

.slide.active {
  opacity: 1;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
