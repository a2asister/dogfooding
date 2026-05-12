<script setup lang="ts">
import { ref } from 'vue'
import type { CreateLogInput } from '../types'

interface Emits {
  (e: 'submit', data: CreateLogInput): void
}

const emit = defineEmits<Emits>()

const title = ref('')
const content = ref('')
const category = ref('工作')

const categories = ['工作', '生活', '学习', '其他']

const handleSubmit = () => {
  if (title.value.trim() && content.value.trim()) {
    emit('submit', {
      title: title.value,
      content: content.value,
      category: category.value
    })
    title.value = ''
    content.value = ''
  }
}
</script>

<template>
  <form class="log-form" @submit.prevent="handleSubmit">
    <h2>添加新日志</h2>
    <div class="form-group">
      <label>标题</label>
      <input v-model="title" type="text" placeholder="输入日志标题" required />
    </div>
    <div class="form-group">
      <label>内容</label>
      <textarea v-model="content" placeholder="输入日志内容" rows="4" required></textarea>
    </div>
    <div class="form-group">
      <label>分类</label>
      <select v-model="category">
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>
    <button type="submit" class="submit-btn">添加日志</button>
  </form>
</template>

<style scoped>
.log-form {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 20px;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  color: #555;
  font-size: 14px;
  font-weight: 500;
}

input, textarea, select {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #667eea;
}

textarea {
  resize: vertical;
}

select {
  cursor: pointer;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}
</style>
