<template>
  <div class="photo-book">
    <div v-if="allPhotos.length === 0" class="empty-book">
      <div class="book-icon">📖</div>
      <p>相册是空的，快去添加宠物照片吧！</p>
    </div>
    
    <div v-else class="book-container">
      <div class="book" ref="bookRef">
        <div class="book-cover">
          <div class="cover-content">
            <div class="cover-title">🐾 宠物时光</div>
            <div class="cover-subtitle">珍藏每一刻美好</div>
          </div>
        </div>
        
        <div 
          v-for="(page, index) in pages" 
          :key="index"
          class="book-page"
          :class="{ flipped: index < currentPage }"
          :style="{ zIndex: totalPages - index, transform: `rotateY(${index < currentPage ? -180 : 0}deg)` }"
          @click="flipPage(index)"
        >
          <div class="page-front">
            <div v-if="page.leftPhoto" class="photo-container left">
              <img :src="page.leftPhoto.url" :alt="page.leftPhoto.description" />
              <div v-if="page.leftPhoto.description" class="photo-caption">{{ page.leftPhoto.description }}</div>
            </div>
            <div v-else class="empty-page">
              <span>📷</span>
            </div>
          </div>
          <div class="page-back">
            <div v-if="page.rightPhoto" class="photo-container right">
              <img :src="page.rightPhoto.url" :alt="page.rightPhoto.description" />
              <div v-if="page.rightPhoto.description" class="photo-caption">{{ page.rightPhoto.description }}</div>
            </div>
            <div v-else class="empty-page">
              <span>📷</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="book-controls">
        <button class="control-btn" @click="prevPage" :disabled="currentPage === 0">
          ◀ 上一页
        </button>
        <span class="page-indicator">{{ currentPage + 1 }} / {{ totalPages }}</span>
        <button class="control-btn" @click="nextPage" :disabled="currentPage >= totalPages - 1">
          下一页 ▶
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Pet } from '../types'

interface Props {
  pets: Pet[]
}

const props = defineProps<Props>()

const currentPage = ref(0)
const bookRef = ref<HTMLDivElement | null>(null)

const allPhotos = computed(() => {
  return props.pets.flatMap(pet => 
    (pet.photos || []).map(photo => ({
      ...photo,
      petName: pet.name,
    }))
  )
})

interface BookPage {
  leftPhoto: typeof allPhotos.value[0] | null
  rightPhoto: typeof allPhotos.value[0] | null
}

const pages = computed<BookPage[]>(() => {
  const result: BookPage[] = []
  for (let i = 0; i < allPhotos.value.length; i += 2) {
    result.push({
      leftPhoto: allPhotos.value[i] || null,
      rightPhoto: allPhotos.value[i + 1] || null,
    })
  }
  return result
})

const totalPages = computed(() => Math.max(pages.value.length, 1))

function flipPage(index: number) {
  if (index === currentPage.value && currentPage.value < totalPages.value - 1) {
    nextPage()
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
  }
}

function prevPage() {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}
</script>

<style scoped>
.photo-book {
  perspective: 1500px;
}

.empty-book {
  text-align: center;
  padding: 80px 20px;
  color: white;
}

.book-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.book-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.book {
  position: relative;
  width: 700px;
  height: 450px;
  transform-style: preserve-3d;
  margin-bottom: 30px;
}

.book-cover {
  position: absolute;
  width: 50%;
  height: 100%;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 10px 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -5px 5px 20px rgba(0, 0, 0, 0.2);
}

.cover-content {
  text-align: center;
  color: white;
}

.cover-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
}

.cover-subtitle {
  font-size: 16px;
  opacity: 0.8;
}

.book-page {
  position: absolute;
  width: 50%;
  height: 100%;
  right: 0;
  transform-origin: left center;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.page-front,
.page-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: linear-gradient(to right, #fff 0%, #f8f8f8 100%);
  border-radius: 0 10px 10px 0;
  box-shadow: inset 5px 0 15px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.page-back {
  transform: rotateY(180deg);
  background: linear-gradient(to left, #fff 0%, #f8f8f8 100%);
  border-radius: 10px 0 0 10px;
}

.photo-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.photo-container img {
  max-width: 100%;
  max-height: 80%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.photo-caption {
  margin-top: 15px;
  color: #666;
  font-size: 14px;
  text-align: center;
}

.empty-page {
  color: #ccc;
  font-size: 40px;
}

.book-controls {
  display: flex;
  align-items: center;
  gap: 30px;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px 30px;
  border-radius: 50px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.control-btn {
  padding: 10px 20px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.control-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator {
  font-weight: 600;
  color: #333;
  font-size: 16px;
}
</style>
