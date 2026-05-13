<template>
  <div class="carousel-3d">
    <div v-if="photos.length === 0" class="empty-carousel">
      <div class="empty-icon">📷</div>
      <p>还没有照片，快去添加吧！</p>
    </div>
    
    <div v-else class="carousel-container">
      <button class="nav-btn prev" @click="prevSlide">❮</button>
      
      <div class="carousel-stage">
        <div 
          v-for="(photo, index) in displayPhotos" 
          :key="photo.id || index"
          class="photo-card"
          :style="getPhotoStyle(index)"
          @click="currentIndex = index"
        >
          <div class="photo-frame">
            <img :src="photo.url" :alt="photo.description || '宠物照片'" />
          </div>
          <div class="photo-info">
            <p v-if="photo.description">{{ photo.description }}</p>
            <span v-if="photo.date" class="photo-date">{{ photo.date }}</span>
          </div>
        </div>
      </div>
      
      <button class="nav-btn next" @click="nextSlide">❯</button>
    </div>
    
    <div v-if="photos.length > 0" class="carousel-dots">
      <span 
        v-for="(_, index) in photos" 
        :key="index"
        class="dot"
        :class="{ active: index === currentIndex }"
        @click="currentIndex = index"
      ></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import type { PetPhoto } from '../types'

interface Props {
  photos: PetPhoto[]
}

const props = defineProps<Props>()

const currentIndex = ref(0)
const rotation = ref(0)

const displayPhotos = computed(() => {
  if (props.photos.length <= 5) return props.photos
  return [...props.photos].slice(currentIndex.value, currentIndex.value + 5)
})

function getPhotoStyle(index: number) {
  const centerIndex = 2
  const offset = index - centerIndex
  const isActive = offset === 0
  
  return {
    transform: `
      translateZ(${isActive ? '0' : '-150px'})
      translateX(${offset * 140}px)
      rotateY(${-offset * 15}deg)
      scale(${isActive ? 1 : 0.85})
    `,
    zIndex: isActive ? 10 : 5 - Math.abs(offset),
    opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.3,
  }
}

function nextSlide() {
  if (props.photos.length === 0) return
  gsap.to(rotation, {
    value: rotation.value - 15,
    duration: 0.5,
    ease: 'power2.out',
  })
  currentIndex.value = (currentIndex.value + 1) % props.photos.length
}

function prevSlide() {
  if (props.photos.length === 0) return
  gsap.to(rotation, {
    value: rotation.value + 15,
    duration: 0.5,
    ease: 'power2.out',
  })
  currentIndex.value = (currentIndex.value - 1 + props.photos.length) % props.photos.length
}

let autoPlayInterval: number | null = null

onMounted(() => {
  autoPlayInterval = window.setInterval(() => {
    if (props.photos.length > 1) {
      nextSlide()
    }
  }, 4000)
})

onUnmounted(() => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval)
  }
})
</script>

<style scoped>
.carousel-3d {
  perspective: 1000px;
  padding: 40px 20px;
}

.empty-carousel {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.carousel-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.nav-btn {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  z-index: 20;
}

.nav-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.nav-btn.prev {
  margin-right: 20px;
}

.nav-btn.next {
  margin-left: 20px;
}

.carousel-stage {
  position: relative;
  width: 600px;
  height: 400px;
  transform-style: preserve-3d;
}

.photo-card {
  position: absolute;
  width: 300px;
  left: 50%;
  margin-left: -150px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  transform-style: preserve-3d;
}

.photo-frame {
  background: white;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.photo-frame img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.photo-info {
  padding: 15px;
  background: white;
  border-radius: 0 0 12px 12px;
  margin-top: -5px;
}

.photo-info p {
  color: #333;
  font-size: 14px;
  margin-bottom: 5px;
}

.photo-date {
  font-size: 12px;
  color: #888;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ddd;
  cursor: pointer;
  transition: all 0.3s;
}

.dot.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scale(1.3);
}

.dot:hover:not(.active) {
  background: #bbb;
}
</style>
