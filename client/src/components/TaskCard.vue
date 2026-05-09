<template>
  <div 
    class="task-card-wrapper"
    ref="cardRef"
    :class="{ 
      'is-completed': task.isCompleted, 
      'is-selected': isSelected,
      'urgent': task.priority === 'urgent',
      'important': task.priority === 'important',
      'normal': task.priority === 'normal',
      'swipe-open': isSwipeOpen
    }"
    :style="{ animationDelay: `${index * 30}ms` }"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @mousedown="handleMouseDown"
  >
    <div class="task-actions-background">
      <div class="action-bg action-edit" @click.stop="handleSwipeEdit">
        <span class="action-icon">✏️</span>
        <span class="action-label">编辑</span>
      </div>
      <div class="action-bg action-delete" @click.stop="confirmDelete">
        <span class="action-icon">🗑️</span>
        <span class="action-label">删除</span>
      </div>
    </div>
    
    <div 
      class="task-card"
      ref="contentRef"
      :class="{ 
        'completion-animating': isAnimatingCompletion,
        'just-completed': justCompleted
      }"
      :style="transformStyle"
    >
      <div class="task-left">
        <button 
          class="checkbox"
          :class="{ checked: task.isCompleted }"
          @click.stop="toggleComplete"
        >
          <span v-if="task.isCompleted" class="check-icon">✓</span>
        </button>
        
        <div class="task-content">
          <h3 class="task-title">{{ task.title }}</h3>
          <p v-if="task.description" class="task-desc">{{ task.description }}</p>
          
          <div class="task-meta">
            <span 
              v-if="task.isRepeating" 
              class="meta-tag repeat-tag"
            >
              🔄 {{ repeatText }}
            </span>
            <span 
              v-if="task.dueDate" 
              class="meta-tag due-tag"
              :class="{ overdue: isOverdue }"
            >
              📅 {{ dueDateText }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="task-right">
        <span class="priority-badge" :class="task.priority">
          {{ priorityText }}
        </span>
        
        <div class="task-actions-desktop">
          <button class="action-btn edit" @click.stop="$emit('edit', task)">
            ✏️
          </button>
          <button class="action-btn delete" @click.stop="confirmDelete">
            🗑️
          </button>
        </div>
      </div>
    </div>
    
    <div class="swipe-indicator" v-if="swipeProgress > 0.05">
      <span class="swipe-hint">← 滑动操作</span>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'TaskCard',
  props: {
    task: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      default: 0
    }
  },
  emits: ['toggle', 'edit', 'delete'],
  setup(props, { emit }) {
    const store = useStore()
    
    const cardRef = ref(null)
    const contentRef = ref(null)
    
    const isAnimatingCompletion = ref(false)
    const justCompleted = ref(false)
    const previousCompleted = ref(props.task.isCompleted)
    
    const startX = ref(0)
    const startY = ref(0)
    const currentX = ref(0)
    const isDragging = ref(false)
    const isSwipeOpen = ref(false)
    const swipeProgress = ref(0)
    const isVerticalScroll = ref(null)
    
    const SWIPE_THRESHOLD = 80
    const MAX_SWIPE = 160
    const VELOCITY_THRESHOLD = 0.3
    
    const isSelected = computed(() => {
      return store.state.selectedTasks.includes(props.task.id)
    })
    
    const priorityText = computed(() => {
      const map = {
        urgent: '紧急',
        important: '重要',
        normal: '普通'
      }
      return map[props.task.priority] || '普通'
    })
    
    const repeatText = computed(() => {
      const map = {
        daily: '每天',
        weekly: '每周',
        monthly: '每月'
      }
      return map[props.task.repeatPattern] || ''
    })
    
    const dueDateText = computed(() => {
      if (!props.task.dueDate) return ''
      const date = new Date(props.task.dueDate)
      const now = new Date()
      const diff = date - now
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) return '今天'
      if (days === 1) return '明天'
      if (days === -1) return '昨天'
      if (days < 0) return `${Math.abs(days)} 天前`
      if (days <= 7) return `${days} 天后`
      
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    })
    
    const isOverdue = computed(() => {
      if (!props.task.dueDate || props.task.isCompleted) return false
      return new Date(props.task.dueDate) < new Date()
    })
    
    const transformStyle = computed(() => {
      let translateX = 0
      if (isDragging.value) {
        translateX = Math.max(-MAX_SWIPE, Math.min(currentX.value - startX.value, 0))
        swipeProgress.value = Math.min(Math.abs(translateX) / SWIPE_THRESHOLD, 1)
      } else if (isSwipeOpen.value) {
        translateX = -SWIPE_THRESHOLD
        swipeProgress.value = 1
      } else {
        swipeProgress.value = 0
      }
      
      if (translateX !== 0) {
        return {
          transform: `translateX(${translateX}px)`,
          transition: isDragging.value ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }
      }
      return {}
    })
    
    const handleTouchStart = (e) => {
      if (isAnimatingCompletion.value) return
      
      const touch = e.touches[0]
      startX.value = touch.clientX
      startY.value = touch.clientY
      currentX.value = touch.clientX
      isVerticalScroll.value = null
      
      if (isSwipeOpen.value) {
        isDragging.value = true
        startX.value = startX.value + SWIPE_THRESHOLD
      } else {
        isDragging.value = false
      }
    }
    
    const handleTouchMove = (e) => {
      if (isAnimatingCompletion.value) return
      
      const touch = e.touches[0]
      currentX.value = touch.clientX
      const deltaX = currentX.value - startX.value
      const deltaY = touch.clientY - startY.value
      
      if (isVerticalScroll.value === null) {
        isVerticalScroll.value = Math.abs(deltaY) > Math.abs(deltaX)
      }
      
      if (!isVerticalScroll.value && Math.abs(deltaX) > 5) {
        isDragging.value = true
        e.preventDefault()
      }
      
      if (isDragging.value && deltaX < 0) {
        e.preventDefault()
      }
    }
    
    const handleTouchEnd = (e) => {
      if (isAnimatingCompletion.value || !isDragging.value) {
        isDragging.value = false
        return
      }
      
      const deltaX = currentX.value - startX.value
      
      if (isSwipeOpen.value) {
        if (deltaX > 30 || Math.abs(deltaX) < 10) {
          isSwipeOpen.value = false
        }
      } else {
        if (deltaX < -SWIPE_THRESHOLD / 2) {
          isSwipeOpen.value = true
        } else {
          isSwipeOpen.value = false
        }
      }
      
      isDragging.value = false
    }
    
    const handleMouseDown = (e) => {
      if (isAnimatingCompletion.value) return
      
      startX.value = e.clientX
      startY.value = e.clientY
      currentX.value = e.clientX
      isVerticalScroll.value = null
      
      if (isSwipeOpen.value) {
        isDragging.value = true
        startX.value = startX.value + SWIPE_THRESHOLD
      } else {
        isDragging.value = false
      }
      
      const handleMouseMove = (moveEvent) => {
        currentX.value = moveEvent.clientX
        const deltaX = currentX.value - startX.value
        const deltaY = moveEvent.clientY - startY.value
        
        if (isVerticalScroll.value === null) {
          isVerticalScroll.value = Math.abs(deltaY) > Math.abs(deltaX)
        }
        
        if (!isVerticalScroll.value && Math.abs(deltaX) > 5) {
          isDragging.value = true
        }
      }
      
      const handleMouseUp = () => {
        if (isDragging.value) {
          const deltaX = currentX.value - startX.value
          
          if (isSwipeOpen.value) {
            if (deltaX > 30 || Math.abs(deltaX) < 10) {
              isSwipeOpen.value = false
            }
          } else {
            if (deltaX < -SWIPE_THRESHOLD / 2) {
              isSwipeOpen.value = true
            } else {
              isSwipeOpen.value = false
            }
          }
        }
        
        isDragging.value = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    const handleSwipeEdit = () => {
      isSwipeOpen.value = false
      setTimeout(() => {
        emit('edit', props.task)
      }, 200)
    }
    
    const triggerCompletionAnimation = (isCompleting) => {
      isAnimatingCompletion.value = true
      justCompleted.value = isCompleting
      
      setTimeout(() => {
        isAnimatingCompletion.value = false
        setTimeout(() => {
          justCompleted.value = false
        }, 500)
      }, 600)
    }
    
    const toggleComplete = () => {
      const wasCompleted = props.task.isCompleted
      const willComplete = !wasCompleted
      
      if (willComplete && !wasCompleted) {
        triggerCompletionAnimation(true)
      }
      
      emit('toggle', props.task, { isCompleted: willComplete })
    }
    
    const handleClick = () => {
      if (isDragging.value || swipeProgress.value > 0.1) {
        return
      }
      store.commit('TOGGLE_SELECTED_TASK', props.task.id)
    }
    
    const confirmDelete = () => {
      isSwipeOpen.value = false
      setTimeout(() => {
        if (confirm('确定要删除这个任务吗？')) {
          emit('delete', props.task.id)
        }
      }, 200)
    }
    
    watch(
      () => props.task.isCompleted,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          if (!newVal && oldVal) {
            triggerCompletionAnimation(false)
          }
        }
      }
    )
    
    const handleClickOutside = (e) => {
      if (cardRef.value && !cardRef.value.contains(e.target)) {
        isSwipeOpen.value = false
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    
    return {
      cardRef,
      contentRef,
      isAnimatingCompletion,
      justCompleted,
      isSelected,
      priorityText,
      repeatText,
      dueDateText,
      isOverdue,
      isDragging,
      isSwipeOpen,
      swipeProgress,
      transformStyle,
      toggleComplete,
      handleClick,
      confirmDelete,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleMouseDown,
      handleSwipeEdit
    }
  }
}
</script>

<style scoped>
.task-card-wrapper {
  position: relative;
  margin-bottom: 12px;
  border-radius: 20px;
  overflow: hidden;
  animation: fadeIn 0.3s ease forwards;
  opacity: 0;
  user-select: none;
  -webkit-user-select: none;
}

.task-card-wrapper.urgent .task-actions-background {
  background: linear-gradient(to right, rgba(102, 126, 234, 0.1), rgba(248, 113, 113, 0.9));
}

.task-card-wrapper.important .task-actions-background {
  background: linear-gradient(to right, rgba(102, 126, 234, 0.1), rgba(251, 191, 36, 0.9));
}

.task-card-wrapper.normal .task-actions-background {
  background: linear-gradient(to right, rgba(102, 126, 234, 0.1), rgba(59, 130, 246, 0.9));
}

.task-actions-background {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 160px;
  display: flex;
  border-radius: 20px;
  overflow: hidden;
}

.action-bg {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-bg:hover {
  filter: brightness(1.1);
}

.action-bg:active {
  transform: scale(0.95);
}

.action-edit {
  background: rgba(102, 126, 234, 0.8);
}

.action-delete {
  background: rgba(248, 113, 113, 0.9);
}

.action-icon {
  font-size: 20px;
}

.action-label {
  font-size: 11px;
  font-weight: 500;
  color: white;
}

.task-card {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px;
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
              box-shadow 0.3s ease,
              opacity 0.3s ease;
  cursor: pointer;
  z-index: 1;
}

.task-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-card-wrapper.urgent .task-card::before {
  background: var(--priority-urgent);
}

.task-card-wrapper.important .task-card::before {
  background: var(--priority-important);
}

.task-card-wrapper.normal .task-card::before {
  background: var(--priority-normal);
}

.task-card:hover {
  box-shadow: var(--shadow-hover);
}

.task-card:hover::before {
  opacity: 1;
}

.task-card-wrapper.is-selected .task-card {
  box-shadow: 0 0 0 2px var(--primary-color), var(--shadow-hover);
}

.task-card-wrapper.is-selected .task-card::before {
  opacity: 1;
}

.task-card-wrapper.is-completed .task-card {
  opacity: 0.65;
}

.task-card-wrapper.is-completed .task-title {
  text-decoration: line-through;
  color: var(--text-muted);
}

.task-card.just-completed {
  animation: completeBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes completeBounce {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(0.92);
    opacity: 0.8;
  }
  50% {
    transform: scale(0.97);
  }
  75% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(0.98);
    opacity: 0.65;
  }
}

.task-card.completion-animating {
  pointer-events: none;
}

.task-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.checkbox {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid var(--border-light);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.checkbox:hover {
  border-color: var(--primary-color);
}

.checkbox.checked {
  background: var(--primary-color);
  border-color: var(--primary-color);
  animation: checkPop 0.3s ease;
}

@keyframes checkPop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.check-icon {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 6px 0;
  line-height: 1.4;
  transition: color 0.2s ease;
}

.task-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 10px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.repeat-tag {
  background: rgba(102, 126, 234, 0.1);
  color: var(--primary-color);
}

.due-tag {
  background: rgba(147, 197, 253, 0.2);
  color: var(--text-secondary);
}

.due-tag.overdue {
  background: rgba(252, 165, 165, 0.2);
  color: #ef4444;
}

.task-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  margin-left: 16px;
}

.priority-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.priority-badge.urgent {
  background: rgba(252, 165, 165, 0.2);
  color: #ef4444;
}

.priority-badge.important {
  background: rgba(252, 211, 77, 0.3);
  color: #ca8a04;
}

.priority-badge.normal {
  background: rgba(147, 197, 253, 0.2);
  color: #3b82f6;
}

.task-actions-desktop {
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.2s ease;
}

.task-card-wrapper:hover .task-actions-desktop {
  opacity: 1;
  transform: translateX(0);
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background: var(--bg-tertiary);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-secondary);
  transform: scale(1.1);
}

.action-btn.edit:hover {
  background: var(--primary-light);
}

.action-btn.delete:hover {
  background: rgba(244, 63, 94, 0.1);
}

.swipe-indicator {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  z-index: 0;
  pointer-events: none;
}

.swipe-hint {
  font-size: 11px;
  color: var(--text-muted);
  opacity: 0.6;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .task-card {
    flex-direction: column;
    gap: 12px;
  }
  
  .task-right {
    flex-direction: row;
    align-items: center;
    margin-left: 0;
    width: 100%;
    justify-content: space-between;
  }
  
  .task-actions-desktop {
    opacity: 1;
    transform: none;
  }
  
  .task-actions-background {
    width: 140px;
  }
  
  .action-bg {
    padding: 0 8px;
  }
  
  .action-label {
    display: none;
  }
}
</style>
