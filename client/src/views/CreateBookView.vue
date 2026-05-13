<template>
  <div class="create-book-view">
    <div class="header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <h1 class="title">创建画册</h1>
      <div class="header-spacer"></div>
    </div>

    <div class="content">
      <form @submit.prevent="createBook" class="book-form">
        <div class="form-section">
          <h2>基本信息</h2>
          
          <div class="form-group">
            <label>画册标题 *</label>
            <input v-model="form.title" type="text" placeholder="请输入画册标题" required />
          </div>

          <div class="form-group">
            <label>作者 *</label>
            <input v-model="form.author" type="text" placeholder="请输入作者名" required />
          </div>

          <div class="form-group">
            <label>描述</label>
            <textarea v-model="form.description" placeholder="请输入画册描述" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>分类</label>
            <input v-model="form.category" type="text" placeholder="请输入分类" />
          </div>
        </div>

        <div class="form-section">
          <h2>封面图片</h2>
          <div class="upload-area" @click="triggerCoverUpload">
            <input ref="coverInput" type="file" accept="image/*" @change="handleCoverUpload" hidden />
            <div v-if="form.coverImage" class="preview-image">
              <img :src="form.coverImage" alt="封面预览" />
            </div>
            <div v-else class="upload-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p>点击上传封面图片</p>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2>画册页面 ({{ form.pages.length }} 页)</h2>
          <div class="pages-grid">
            <div v-for="(page, index) in form.pages" :key="index" class="page-item">
              <img :src="page" :alt="`第 ${index + 1} 页`" />
              <button type="button" class="remove-page-btn" @click="removePage(index)">×</button>
              <span class="page-number">{{ index + 1 }}</span>
            </div>
            <div class="add-page-btn" @click="triggerPageUpload">
              <input ref="pageInput" type="file" accept="image/*" @change="handlePageUpload" multiple hidden />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              <p>添加页面</p>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="goBack">取消</button>
          <button type="submit" class="submit-btn" :disabled="isSubmitting || form.pages.length === 0">
            {{ isSubmitting ? '创建中...' : '创建画册' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const coverInput = ref<HTMLInputElement | null>(null);
const pageInput = ref<HTMLInputElement | null>(null);
const isSubmitting = ref(false);

const form = ref({
  title: '',
  author: '',
  description: '',
  category: '',
  coverImage: '',
  pages: [] as string[],
  isPublic: false,
  userId: 'demo-user-id',
});

function goBack(): void {
  router.push('/');
}

function triggerCoverUpload(): void {
  coverInput.value?.click();
}

function triggerPageUpload(): void {
  pageInput.value?.click();
}

async function handleCoverUpload(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const url = await uploadImage(file);
    if (url) {
      form.value.coverImage = url;
    }
  }
}

async function handlePageUpload(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImage(files[i]);
      if (url) {
        form.value.pages.push(url);
      }
    }
  }
}

async function uploadImage(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('http://localhost:4567/upload/image', {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.url;
    }
    return null;
  } catch (error) {
    console.error('上传失败:', error);
    return URL.createObjectURL(file);
  }
}

function removePage(index: number): void {
  form.value.pages.splice(index, 1);
}

async function createBook(): Promise<void> {
  if (!form.value.coverImage || form.value.pages.length === 0) {
    alert('请上传封面和至少一页内容');
    return;
  }

  isSubmitting.value = true;

  try {
    const mutation = `
      mutation CreateBook($input: CreateBookInput!) {
        createBook(createBookInput: $input) {
          id
          title
        }
      }
    `;

    const response = await fetch('http://localhost:4567/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            title: form.value.title,
            author: form.value.author,
            description: form.value.description,
            category: form.value.category,
            coverImage: form.value.coverImage,
            pages: form.value.pages,
            totalPages: form.value.pages.length,
            isPublic: form.value.isPublic,
            userId: form.value.userId,
          },
        },
      }),
    });

    if (response.ok) {
      alert('画册创建成功！');
      router.push('/library');
    } else {
      alert('创建失败，请重试');
    }
  } catch (error) {
    console.error('创建失败:', error);
    alert('创建失败，请重试');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.create-book-view {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.header {
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
  border: none;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
}

.title {
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.header-spacer {
  width: 45px;
}

.content {
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;
}

.book-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 30px;
  
  h2 {
    color: #fff;
    font-size: 20px;
    margin: 0 0 20px 0;
  }
}

.form-group {
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  label {
    display: block;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  input,
  textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    font-size: 14px;
    outline: none;
    transition: all 0.3s ease;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
    
    &:focus {
      border-color: #667eea;
      background: rgba(255, 255, 255, 0.08);
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 80px;
  }
}

.upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.02);
  }
}

.upload-placeholder {
  color: rgba(255, 255, 255, 0.5);
  
  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 10px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
  }
}

.preview-image {
  img {
    max-width: 300px;
    max-height: 200px;
    border-radius: 8px;
    object-fit: cover;
  }
}

.pages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.page-item {
  position: relative;
  aspect-ratio: 2/3;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.remove-page-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 100, 100, 0.9);
  color: #fff;
  border: none;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    background: #ff4444;
  }
}

.page-number {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 12px;
}

.add-page-btn {
  aspect-ratio: 2/3;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.5);
  
  &:hover {
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.02);
  }
  
  svg {
    width: 36px;
    height: 36px;
    margin-bottom: 8px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
  }
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.cancel-btn,
.submit-btn {
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
  }
}
</style>
