<template>
  <div class="bookmarks-view">
    <div class="bookmarks-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <h1 class="page-title">我的书签</h1>
      <div class="header-spacer"></div>
    </div>

    <div class="bookmarks-list" v-if="bookmarkedBooks.length > 0">
      <div 
        v-for="item in bookmarkedBooks" 
        :key="item.book.id" 
        class="bookmark-item"
        @click="openBook(item.book.id)"
      >
        <div class="bookmark-cover">
          <img :src="item.book.coverImage" :alt="item.book.title" />
          <div class="bookmark-badge">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
        </div>
        <div class="bookmark-info">
          <h3 class="book-title">{{ item.book.title }}</h3>
          <p class="book-author">{{ item.book.author }}</p>
          <p class="book-progress">
            <span>阅读进度: {{ item.progress?.currentPage || 0 }} / {{ item.book.totalPages }}</span>
          </p>
          <p class="book-date">
            <span>添加于 {{ formatDate(item.progress?.createdAt) }}</span>
          </p>
        </div>
        <button class="remove-btn" @click.stop="removeBookmark(item.book.id)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="empty-state" v-else>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
      <p>暂无书签</p>
      <p class="empty-desc">在阅读时点击书签按钮添加</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Book, ReadingProgress } from '@/types';

const router = useRouter();

const bookmarkedBooks = ref<{ book: Book; progress?: ReadingProgress }[]>([]);

function goBack(): void {
  router.push('/');
}

function openBook(bookId: string): void {
  router.push(`/reader/${bookId}`);
}

function removeBookmark(bookId: string): void {
  bookmarkedBooks.value = bookmarkedBooks.value.filter(item => item.book.id !== bookId);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '未知';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

onMounted(() => {
  bookmarkedBooks.value = [
    {
      book: {
        id: '1',
        title: '自然风光精选',
        description: '世界各地的绝美风光摄影作品集',
        coverImage: 'https://picsum.photos/300/400?random=100',
        pages: [],
        totalPages: 24,
        author: '摄影大师',
        category: '摄影',
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      progress: {
        id: 'p1',
        currentPage: 12,
        isBookmarked: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
        bookId: '1',
        userId: 'demo-user-id',
      },
    },
    {
      book: {
        id: '3',
        title: '城市夜景',
        description: '繁华都市的璀璨夜色',
        coverImage: 'https://picsum.photos/300/400?random=102',
        pages: [],
        totalPages: 32,
        author: '城市探索者',
        category: '城市',
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      progress: {
        id: 'p3',
        currentPage: 8,
        isBookmarked: true,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date().toISOString(),
        bookId: '3',
        userId: 'demo-user-id',
      },
    },
  ];
});
</script>

<style lang="scss" scoped>
.bookmarks-view {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.bookmarks-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 40px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
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

.page-title {
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.header-spacer {
  width: 45px;
}

.bookmarks-list {
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.bookmark-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(5px);
  }
}

.bookmark-cover {
  position: relative;
  width: 100px;
  height: 140px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.bookmark-badge {
  position: absolute;
  top: 0;
  right: 8px;
  width: 24px;
  height: 30px;
  color: #ffc864;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  animation: bookmarkFloat 2s ease-in-out infinite;
}

@keyframes bookmarkFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-2px) rotate(1deg);
  }
  75% {
    transform: translateY(-1px) rotate(-1deg);
  }
}

.bookmark-info {
  flex: 1;
  min-width: 0;
}

.book-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-author {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0 0 8px 0;
}

.book-progress {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  margin: 0 0 4px 0;
}

.book-date {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  margin: 0;
}

.remove-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 100, 100, 0.1);
  color: #ff6464;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(255, 100, 100, 0.2);
    transform: scale(1.1);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 40px;
  color: rgba(255, 255, 255, 0.5);
  
  svg {
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
    color: rgba(255, 200, 100, 0.3);
  }
  
  p {
    font-size: 18px;
    margin: 0 0 8px 0;
  }
  
  .empty-desc {
    font-size: 14px;
    opacity: 0.6;
  }
}
</style>
