<template>
  <div class="reader-view">
    <div class="reader-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <h1 class="book-title">{{ book?.title || '加载中...' }}</h1>
      <div class="header-spacer"></div>
    </div>

    <div class="reader-content" v-if="book && pages.length > 0">
      <PhysicsBook
        :pages="pages"
        :is-bookmarked="isBookmarked"
        @toggle-bookmark="toggleBookmark"
      />
    </div>

    <div class="loading" v-else>
      <div class="spinner"></div>
      <p>加载画册中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PhysicsBook from '@/components/PhysicsBook.vue';
import type { Book } from '@/types';

const route = useRoute();
const router = useRouter();

const bookId = computed(() => route.params.bookId as string);

const book = ref<Book | null>({
  id: bookId.value,
  title: '演示画册 - ' + bookId.value,
  description: '精美的自然风光画册',
  coverImage: 'https://picsum.photos/300/400?random=cover',
  pages: [],
  totalPages: 6,
  author: '演示作者',
  category: '自然',
  isPublic: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const isBookmarked = ref(false);

const pages = computed(() => {
  return [
    'https://picsum.photos/400/600?random=101',
    'https://picsum.photos/400/600?random=102',
    'https://picsum.photos/400/600?random=103',
    'https://picsum.photos/400/600?random=104',
    'https://picsum.photos/400/600?random=105',
    'https://picsum.photos/400/600?random=106',
  ];
});

function goBack(): void {
  router.push('/');
}

function toggleBookmark(): void {
  isBookmarked.value = !isBookmarked.value;
}
</script>

<style lang="scss" scoped>
.reader-view {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  flex-direction: column;
}

.reader-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 100;
}

.back-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
}

.book-title {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.header-spacer {
  width: 45px;
}

.reader-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }
  
  p {
    font-size: 16px;
    opacity: 0.8;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
