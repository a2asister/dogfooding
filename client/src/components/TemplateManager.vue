<template>
  <div class="template-manager">
    <div class="header-bar" @click="togglePanel">
      <h3>💫 特效模板</h3>
      <span class="toggle-icon">{{ isOpen ? '▼' : '▲' }}</span>
    </div>

    <div v-if="isOpen" class="panel-content">
      <div class="category-filter">
        <select v-model="selectedCategory" @change="loadTemplates">
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <button @click="refreshTemplates" class="refresh-btn">↻</button>
      </div>

      <div v-if="loading" class="loading">加载中...</div>

      <div v-else-if="templates.length === 0" class="empty">
        暂无模板，快去保存你的特效吧！
      </div>

      <div v-else class="template-list">
        <div 
          v-for="tpl in templates" 
          :key="tpl.id" 
          class="template-item"
        >
          <div class="template-info">
            <div class="template-name">{{ tpl.name }}</div>
            <div class="template-category">{{ tpl.category }}</div>
            <div class="template-date">{{ formatDate(tpl.createdAt) }}</div>
          </div>
          <div class="template-actions">
            <button @click="applyTemplate(tpl)" class="apply-btn">应用</button>
            <button @click="deleteTemplate(tpl.id)" class="delete-btn">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { EffectConfig } from '../types/dust'

interface Template {
  id: number
  name: string
  category: string
  config: EffectConfig
  createdAt: string
}

const emit = defineEmits<{
  (e: 'apply', config: EffectConfig): void
}>()

const isOpen = ref(false)
const loading = ref(false)
const templates = ref<Template[]>([])
const categories = ref<string[]>([])
const selectedCategory = ref('')

const togglePanel = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    loadCategories()
    loadTemplates()
  }
}

const loadCategories = async () => {
  try {
    const res = await fetch('/api/configs/categories/list')
    categories.value = await res.json()
  } catch (e) {
    console.error('加载分类失败:', e)
  }
}

const loadTemplates = async () => {
  loading.value = true
  try {
    const url = selectedCategory.value 
      ? `/api/configs?category=${encodeURIComponent(selectedCategory.value)}`
      : '/api/configs'
    const res = await fetch(url)
    templates.value = await res.json()
  } catch (e) {
    console.error('加载模板失败:', e)
  } finally {
    loading.value = false
  }
}

const refreshTemplates = () => {
  loadCategories()
  loadTemplates()
}

const applyTemplate = (tpl: Template) => {
  emit('apply', tpl.config)
}

const deleteTemplate = async (id: number) => {
  if (!confirm('确定删除这个模板吗？')) return
  
  try {
    await fetch(`/api/configs/${id}`, { method: 'DELETE' })
    await loadTemplates()
    await loadCategories()
  } catch (e) {
    console.error('删除失败:', e)
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.template-manager {
  position: fixed;
  left: 40px;
  bottom: 40px;
  width: 340px;
  z-index: 100;
}

.header-bar {
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(10px);
  padding: 14px 20px;
  border-radius: 12px 12px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-bar h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.toggle-icon {
  color: #888;
  font-size: 12px;
}

.panel-content {
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px;
  border-radius: 0 0 12px 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: none;
  max-height: 400px;
  overflow-y: auto;
}

.category-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.category-filter select {
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 13px;
}

.refresh-btn {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  cursor: pointer;
  font-size: 16px;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.loading, .empty {
  text-align: center;
  padding: 24px;
  color: #888;
  font-size: 13px;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.template-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s;
}

.template-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(102, 126, 234, 0.3);
}

.template-info {
  flex: 1;
}

.template-name {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 2px;
}

.template-category {
  display: inline-block;
  padding: 2px 8px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  border-radius: 4px;
  font-size: 11px;
  color: #a5b4fc;
  margin-right: 8px;
}

.template-date {
  font-size: 11px;
  color: #666;
}

.template-actions {
  display: flex;
  gap: 6px;
}

.apply-btn, .delete-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.apply-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.apply-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}
</style>
