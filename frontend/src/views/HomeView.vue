<template>
  <div class="home-view">
    <div class="toolbar" v-if="selectMode">
      <div class="toolbar-info">
        <span class="selected-count">已选择 {{ selectedIds.length }} 条</span>
        <div class="toolbar-actions">
          <button class="toolbar-btn archive" @click="handleBatchArchive">归档</button>
          <button class="toolbar-btn delete" @click="handleBatchDelete">删除</button>
          <button class="toolbar-btn cancel" @click="exitSelectMode">取消</button>
        </div>
      </div>
    </div>
    
    <SearchBar 
      :tags="tags" 
      @search="handleSearch" 
    />
    
    <div class="notes-grid">
      <NoteCard
        v-for="note in notes"
        :key="note.id"
        :note="note"
        :select-mode="selectMode"
        :is-selected="selectedIds.includes(note.id)"
        @edit="openEditModal"
        @delete="handleDelete"
        @select="toggleSelect"
        @filter-tag="handleFilterByTag"
      />
      
      <div v-if="notes.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">✧</div>
        <p class="empty-text">还没有灵感记录</p>
        <p class="empty-hint">点击下方按钮记录你的第一条灵感</p>
      </div>
      
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    </div>
    
    <div class="fab-wrapper">
      <button 
        class="fab"
        :class="{ 'select-mode': selectMode }"
        @click="handleFabClick"
        @contextmenu.prevent="toggleSelectMode"
      >
        <span class="fab-icon">{{ selectMode ? '☐' : '+' }}</span>
      </button>
    </div>
    
    <NoteModal
      v-if="showModal"
      :note="editingNote"
      :existing-tags="tags"
      @close="closeModal"
      @save="handleSaveNote"
      @create-tag="handleCreateTag"
    />
  </div>
</template>

<script setup>import { ref, onMounted } from 'vue'
import NoteCard from '../components/NoteCard.vue'
import NoteModal from '../components/NoteModal.vue'
import SearchBar from '../components/SearchBar.vue'
import { 
  getNotes, 
  createNote, 
  updateNote, 
  deleteNote, 
  batchDeleteNotes,
  batchArchiveNotes,
  createTag 
} from '../api/notes'

const notes = ref([])
const tags = ref([])
const loading = ref(false)
const selectMode = ref(false)
const selectedIds = ref([])
const showModal = ref(false)
const editingNote = ref(null)
const searchParams = ref({})

onMounted(() => {
  loadNotes()
})

async function loadNotes() {
  loading.value = true
  try {
    const params = { ...searchParams.value, archived: 'false' }
    const response = await getNotes(params)
    notes.value = response.notes || []
    tags.value = response.tags || []
  } catch (error) {
    console.error('加载笔记失败:', error)
  } finally {
    loading.value = false
  }
}

function handleSearch(params) {
  searchParams.value = params
  loadNotes()
}

function handleFilterByTag(tag) {
  searchParams.value = { tag }
  loadNotes()
}

function handleFabClick() {
  if (selectMode.value) {
    if (selectedIds.value.length === notes.value.length) {
      selectedIds.value = []
    } else {
      selectedIds.value = notes.value.map(n => n.id)
    }
  } else {
    editingNote.value = null
    showModal.value = true
  }
}

function toggleSelectMode() {
  selectMode.value = !selectMode.value
  if (!selectMode.value) {
    selectedIds.value = []
  }
}

function exitSelectMode() {
  selectMode.value = false
  selectedIds.value = []
}

function toggleSelect(id) {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

function openEditModal(note) {
  if (selectMode.value) {
    toggleSelect(note.id)
  } else {
    editingNote.value = { ...note }
    showModal.value = true
  }
}

function closeModal() {
  showModal.value = false
  editingNote.value = null
}

async function handleSaveNote(noteData) {
  try {
    if (noteData.id) {
      await updateNote(noteData.id, noteData)
    } else {
      await createNote(noteData)
    }
    closeModal()
    loadNotes()
  } catch (error) {
    console.error('保存笔记失败:', error)
  }
}

async function handleDelete(id) {
  try {
    await deleteNote(id)
    loadNotes()
  } catch (error) {
    console.error('删除笔记失败:', error)
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) return
  
  if (!confirm(`确定要删除选中的 ${selectedIds.value.length} 条灵感吗？此操作不可恢复。`)) {
    return
  }
  
  try {
    await batchDeleteNotes(selectedIds.value)
    exitSelectMode()
    loadNotes()
  } catch (error) {
    console.error('批量删除失败:', error)
  }
}

async function handleBatchArchive() {
  if (selectedIds.value.length === 0) return
  
  try {
    await batchArchiveNotes(selectedIds.value, true)
    exitSelectMode()
    loadNotes()
  } catch (error) {
    console.error('批量归档失败:', error)
  }
}

async function handleCreateTag(tag) {
  try {
    await createTag(tag)
    if (!tags.value.includes(tag)) {
      tags.value.push(tag)
    }
  } catch (error) {
    console.error('创建标签失败:', error)
  }
}
</script>

<style scoped>
.home-view {
  position: relative;
  min-height: calc(100vh - 120px);
}

.toolbar {
  margin-bottom: 20px;
  padding: 16px 24px;
  background: var(--color-primary);
  border-radius: 16px;
  animation: slideIn 0.3s ease;
}

.toolbar-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.selected-count {
  color: white;
  font-weight: 500;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
}

.toolbar-btn {
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
}

.toolbar-btn.archive {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.toolbar-btn.archive:hover {
  background: rgba(255, 255, 255, 0.3);
}

.toolbar-btn.delete {
  background: var(--color-danger);
  color: white;
}

.toolbar-btn.delete:hover {
  opacity: 0.9;
}

.toolbar-btn.cancel {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.toolbar-btn.cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding-bottom: 100px;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: 1.2rem;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 0.95rem;
  opacity: 0.7;
}

.loading-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: var(--color-text-secondary);
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-bg-secondary);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fab-wrapper {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 50;
}

.fab {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  box-shadow: 0 4px 20px rgba(184, 163, 148, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: breathe 3s ease-in-out infinite;
  transition: all 0.3s;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(184, 163, 148, 0.6);
}

.fab-icon {
  font-size: 2rem;
  color: white;
  font-weight: 300;
}

.fab.select-mode {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
}

@media (max-width: 768px) {
  .toolbar-info {
    flex-direction: column;
    gap: 12px;
  }
  
  .notes-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .fab-wrapper {
    bottom: 24px;
    right: 24px;
  }
  
  .fab {
    width: 56px;
    height: 56px;
  }
}
</style>
