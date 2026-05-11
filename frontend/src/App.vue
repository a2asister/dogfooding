<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="title">💬 气泡评论系统</h1>
      <p class="subtitle">优雅的评论交互体验</p>
    </header>

    <main class="main-content">
      <div class="comment-form-container">
        <div class="form-card">
          <h3 class="form-title">发表评论</h3>
          <input
            v-model="newAuthor"
            type="text"
            placeholder="你的昵称"
            class="input-field"
          />
          <textarea
            v-model="newContent"
            placeholder="写下你的评论..."
            class="textarea-field"
            rows="3"
          ></textarea>
          <button
            class="submit-btn"
            @click="submitComment"
            :disabled="!canSubmit"
          >
            发送评论 ✨
          </button>
        </div>
      </div>

      <div class="comments-section">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>❌ {{ error }}</p>
          <button class="retry-btn" @click="fetchComments">重试</button>
        </div>

        <div v-else-if="comments.length === 0" class="empty-state">
          <div class="empty-icon">💭</div>
          <p>还没有评论，快来发表第一条吧！</p>
        </div>

        <div v-else class="comments-list">
          <CommentBubble
            v-for="comment in comments"
            :key="comment.id"
            :comment="comment"
            :is-new="isNewComment(comment.id)"
            @like="handleLike"
            @delete="handleDelete"
            @submit-reply="handleSubmitReply"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import CommentBubble from './components/CommentBubble.vue';
import { useComments } from './composables/useComments';

const {
  comments,
  loading,
  error,
  fetchComments,
  addComment,
  deleteComment,
  toggleLike,
  isNewComment
} = useComments();

const newAuthor = ref('');
const newContent = ref('');

const canSubmit = computed(() => 
  newAuthor.value.trim() && newContent.value.trim()
);

async function submitComment() {
  if (!canSubmit.value) return;
  
  const author = newAuthor.value.trim();
  const content = newContent.value.trim();
  
  await addComment({
    content,
    author
  });
  
  newContent.value = '';
}

async function handleLike(id: string) {
  await toggleLike(id);
}

async function handleDelete(id: string) {
  if (confirm('确定要删除这条评论吗？')) {
    await deleteComment(id);
  }
}

async function handleSubmitReply(parentId: string, author: string, content: string) {
  await addComment({
    content,
    author,
    parentId
  });
}

onMounted(() => {
  fetchComments();
});
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  padding: 40px 20px;
}

.app-header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.main-content {
  max-width: 900px;
  margin: 0 auto;
}

.comment-form-container {
  margin-bottom: 40px;
}

.form-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.form-title {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 16px;
  font-weight: 600;
}

.input-field,
.textarea-field {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  margin-bottom: 12px;
  outline: none;
  transition: all 0.3s ease;
  font-family: inherit;
}

.input-field:focus,
.textarea-field:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.textarea-field {
  resize: vertical;
  min-height: 100px;
}

.submit-btn {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comments-section {
  min-height: 200px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: white;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p,
.error-state p,
.empty-state p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.retry-btn {
  margin-top: 16px;
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
