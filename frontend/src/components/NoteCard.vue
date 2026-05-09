<template>
  <div 
    class="note-card"
    :class="{ 
      'selected': isSelected, 
      'swiping': isSwiping,
      'slide-out': isDeleting
    }"
    @click="handleCardClick"
  >
    <div 
      class="card-content"
      :style="{ transform: `translateX(${translateX}px)` }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
    >
      <div class="card-header">
        <div 
          v-if="selectMode" 
          class="checkbox"
          :class="{ 'checked': isSelected }"
          @click.stop="toggleSelect"
        >
          <span v-if="isSelected">✓</span>
        </div>
        <div class="tags">
          <span 
            v-for="tag in note.tags" 
            :key="tag" 
            class="tag"
            @click.stop="$emit('filter-tag', tag)"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      
      <p class="content">{{ note.content }}</p>
      
      <div class="card-footer">
        <span class="source">{{ note.source }}</span>
        <span class="date">{{ formatDate(note.createdAt) }}</span>
      </div>
    </div>
    
    <div class="delete-action" @click.stop="handleDelete">
      <span class="delete-icon">🗑</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  note: {
    type: Object,
    required: true
  },
  selectMode: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete', 'select', 'filter-tag'])

const startX = ref(0)
const currentX = ref(0)
const isSwiping = ref(false)
const isDeleting = ref(false)

const translateX = computed(() => {
  if (!isSwiping.value) return 0
  const diff = currentX.value - startX.value
  if (diff < 0) return Math.max(diff, -80)
  return Math.min(diff, 0)
})

function handleCardClick() {
  if (isSwiping.value) return
  emit('edit', props.note)
}

function toggleSelect() {
  emit('select', props.note.id)
}

function onTouchStart(e) {
  startX.value = e.touches[0].clientX
  currentX.value = e.touches[0].clientX
}

function onTouchMove(e) {
  if (Math.abs(e.touches[0].clientX - startX.value) > 10) {
    isSwiping.value = true
  }
  currentX.value = e.touches[0].clientX
}

function onTouchEnd() {
  if (translateX.value < -50) {
    handleDelete()
  }
  isSwiping.value = false
}

function onMouseDown(e) {
  startX.value = e.clientX
  currentX.value = e.clientX
  
  const onMouseMove = (moveEvent) => {
    if (Math.abs(moveEvent.clientX - startX.value) > 10) {
      isSwiping.value = true
    }
    currentX.value = moveEvent.clientX
  }
  
  const onMouseUp = () => {
    if (translateX.value < -50) {
      handleDelete()
    }
    isSwiping.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function handleDelete() {
  isDeleting.value = true
  setTimeout(() => {
    emit('delete', props.note.id)
  }, 300)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 1 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}
</script>

<style scoped>
.note-card {
  position: relative;
  background: var(--color-card);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease;
}

.note-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.note-card.slide-out {
  animation: slideOut 0.3s ease forwards;
}

@keyframes slideOut {
  to {
    transform: translateX(-100%);
    opacity: 0;
    margin-bottom: -120px;
  }
}

.card-content {
  padding: 24px;
  background: var(--color-card);
  position: relative;
  z-index: 2;
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  min-height: 28px;
}

.checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid var(--color-primary-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  color: white;
  font-size: 12px;
}

.checkbox.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 14px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 500;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-accent));
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  opacity: 0.9;
}

.tag:hover {
  transform: scale(1.05);
  opacity: 1;
}

.content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--color-text);
  margin-bottom: 16px;
  text-align: center;
  word-wrap: break-word;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.source {
  opacity: 0.8;
}

.date {
  font-style: italic;
}

.delete-action {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  background: var(--color-danger);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.delete-icon {
  font-size: 1.5rem;
  color: white;
}

@media (max-width: 768px) {
  .card-content {
    padding: 20px;
  }

  .content {
    font-size: 1rem;
    line-height: 1.7;
  }
}
</style>
