<template>
  <div class="banner-carousel">
    <div class="banner-wrapper" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
      <div v-for="(banner, index) in banners" :key="index" class="banner-slide">
        <img :src="banner.image" :alt="banner.title" class="banner-image">
        <div class="banner-overlay">
          <div class="banner-content">
            <h2>{{ banner.title }}</h2>
            <router-link :to="banner.link" class="banner-btn">立即查看</router-link>
          </div>
        </div>
      </div>
    </div>
    <div class="banner-indicators">
      <span
        v-for="(_, index) in banners"
        :key="index"
        :class="{ active: index === currentIndex }"
        @click="goToSlide(index)"
      ></span>
    </div>
    <button class="banner-arrow prev" @click="prevSlide">‹</button>
    <button class="banner-arrow next" @click="nextSlide">›</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Banner } from '../types'

const props = defineProps<{
  banners: Banner[]
}>()

const currentIndex = ref(0)
let autoplayTimer: number | null = null

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % props.banners.length
}

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + props.banners.length) % props.banners.length
}

const goToSlide = (index: number) => {
  currentIndex.value = index
}

const startAutoplay = () => {
  autoplayTimer = window.setInterval(nextSlide, 5000)
}

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<style scoped lang="scss">
.banner-carousel {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;

  .banner-wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    transition: transform 0.5s ease;
  }

  .banner-slide {
    min-width: 100%;
    height: 100%;
    position: relative;
  }

  .banner-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .banner-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(26, 42, 74, 0.9), rgba(26, 42, 74, 0.3));
    display: flex;
    align-items: center;
  }

  .banner-content {
    padding-left: 10%;

    h2 {
      font-size: 48px;
      font-weight: 700;
      color: white;
      margin-bottom: 24px;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    .banner-btn {
      display: inline-block;
      background: linear-gradient(135deg, var(--secondary-color), var(--accent-purple));
      color: white;
      padding: 14px 40px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(0, 245, 255, 0.4);
      }
    }
  }

  .banner-indicators {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;

    span {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      cursor: pointer;
      transition: all 0.3s ease;

      &.active {
        background: var(--secondary-color);
        width: 32px;
        border-radius: 6px;
      }
    }
  }

  .banner-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: var(--secondary-color);
    }

    &.prev { left: 20px; }
    &.next { right: 20px; }
  }
}
</style>
