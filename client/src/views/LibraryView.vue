<template>
  <div class="library-view">
    <div class="library-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <h1 class="page-title">画册库</h1>
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索画册..."
          @input="filterBooks"
        />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <button class="create-btn" @click="goCreate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
        <span>创建</span>
      </button>
    </div>

    <div class="books-grid" v-if="filteredBooks.length > 0">
      <div 
        v-for="book in filteredBooks" 
        :key="book.id" 
        class="book-card"
      >
        <div class="book-cover" @click="openBook(book.id)">
          <img :src="book.coverImage" :alt="book.title" />
          <div class="book-overlay">
            <span class="page-count">{{ book.totalPages }} 页</span>
          </div>
        </div>
        <div class="book-details">
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-author">{{ book.author }}</p>
          <p class="book-desc" v-if="book.description">{{ book.description }}</p>
          <div class="book-actions">
            <button 
              class="share-btn" 
              @click.stop="shareBook(book.id)"
              :class="{ shared: book.isShared }"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="16.49"></line>
                <line x1="15.41" y1="7.51" x2="8.59" y2="10.49"></line>
              </svg>
              {{ book.isShared ? '已分享' : '分享' }}
            </button>
            <button class="delete-btn" @click.stop="deleteBook(book.id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
      <p>暂无画册</p>
      <button class="empty-create-btn" @click="goCreate">创建第一个画册</button>
    </div>

    <div v-if="shareModalVisible" class="share-modal" @click.self="shareModalVisible = false">
      <div class="share-modal-content">
        <h3>分享画册</h3>
        <p class="share-link" v-if="shareCode">分享码: {{ shareCode }}</p>
        <p class="share-hint">将分享码发送给好友，他们可以通过分享码查看这本画册</p>
        <div class="share-modal-actions">
          <button class="copy-btn" @click="copyShareCode" v-if="shareCode">复制分享码</button>
          <button class="close-btn" @click="shareModalVisible = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Book } from '@/types';

const router = useRouter();

const searchQuery = ref('');
const books = ref<Book[]>([]);
const shareModalVisible = ref(false);
const shareCode = ref('');

const filteredBooks = computed(() => {
  if (!searchQuery.value) return books.value;
  const query = searchQuery.value.toLowerCase();
  return books.value.filter(book => 
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query) ||
    (book.category && book.category.toLowerCase().includes(query))
  );
});

function goBack(): void {
  router.push('/');
}

function goCreate(): void {
  router.push('/create');
}

function openBook(bookId: string): void {
  router.push(`/reader/${bookId}`);
}

async function fetchBooks(): Promise<void> {
  try {
    const query = `
      query {
        books {
          id
          title
          description
          coverImage
          pages
          totalPages
          author
          category
          isPublic
          isShared
          shareCode
          createdAt
          updatedAt
        }
      }
    `;

    const response = await fetch('http://localhost:4567/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    if (result.data && result.data.books) {
      books.value = result.data.books;
    }
  } catch (error) {
    console.error('获取画册失败:', error);
  }
}

async function shareBook(bookId: string): Promise<void> {
  try {
    const mutation = `
      mutation ShareBook($id: ID!) {
        shareBook(id: $id) {
          id
          shareCode
          isShared
        }
      }
    `;

    const response = await fetch('http://localhost:4567/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: mutation,
        variables: { id: bookId },
      }),
    });

    const result = await response.json();
    if (result.data && result.data.shareBook) {
      const book = books.value.find(b => b.id === bookId);
      if (book) {
        book.shareCode = result.data.shareBook.shareCode;
        book.isShared = result.data.shareBook.isShared;
        shareCode.value = result.data.shareBook.shareCode;
        shareModalVisible.value = true;
      }
    }
  } catch (error) {
    console.error('分享失败:', error);
  }
}

async function deleteBook(bookId: string): Promise<void> {
  if (!confirm('确定要删除这本画册吗？')) return;

  try {
    const mutation = `
      mutation DeleteBook($id: ID!) {
        deleteBook(id: $id)
      }
    `;

    const response = await fetch('http://localhost:4567/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: mutation,
        variables: { id: bookId },
      }),
    });

    const result = await response.json();
    if (result.data && result.data.deleteBook) {
      books.value = books.value.filter(b => b.id !== bookId);
    }
  } catch (error) {
    console.error('删除失败:', error);
  }
}

function copyShareCode(): void {
  navigator.clipboard.writeText(shareCode.value);
  alert('分享码已复制！');
}

onMounted(() => {
  fetchBooks();
});
</script>

<style lang="scss" scoped>
.library-view {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.library-header {
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

.search-box {
  flex: 1;
  max-width: 400px;
  position: relative;
  margin-left: auto;
  
  input {
    width: 100%;
    padding: 12px 45px 12px 20px;
    border: none;
    border-radius: 25px;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    font-size: 14px;
    outline: none;
    transition: all 0.3s ease;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
    
    &:focus {
      background: rgba(255, 255, 255, 0.15);
    }
  }
  
  svg {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: rgba(255, 255, 255, 0.5);
  }
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  padding: 40px;
}

.book-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    background: rgba(255, 255, 255, 0.1);
    
    .book-overlay {
      opacity: 1;
    }
  }
}

.book-cover {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.book-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  opacity: 0;
  transition: all 0.3s ease;
}

.page-count {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.book-details {
  padding: 20px;
}

.book-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-author {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0 0 8px 0;
}

.book-desc {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
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
  }
  
  p {
    font-size: 18px;
  }
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
}

.empty-create-btn {
  margin-top: 20px;
  padding: 12px 30px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
  }
}

.book-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.share-btn,
.delete-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-btn {
  background: rgba(102, 126, 234, 0.2);
  color: #fff;
  
  &:hover {
    background: rgba(102, 126, 234, 0.4);
  }
  
  &.shared {
    background: rgba(102, 126, 234, 0.4);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
}

.delete-btn {
  background: rgba(255, 100, 100, 0.2);
  color: #fff;
  
  &:hover {
    background: rgba(255, 100, 100, 0.4);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
}

.share-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.share-modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 15px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  
  h3 {
    color: #fff;
    font-size: 20px;
    margin: 0 0 20px 0;
    text-align: center;
  }
}

.share-link {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
  color: #667eea;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  margin: 0 0 15px 0;
  word-break: break-all;
}

.share-hint {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  text-align: center;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.share-modal-actions {
  display: flex;
  gap: 10px;
}

.copy-btn,
.close-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
  }
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}
</style>
