<template>
  <div class="home-view">
    <div class="view-header">
      <div class="view-title-section">
        <h2 class="view-title">{{ titleText }}</h2>
        <p class="view-subtitle">
          {{ pendingCount }} 个待完成
          <span v-if="urgentCount > 0" class="urgent-count">
            · {{ urgentCount }} 个紧急
          </span>
        </p>
      </div>
      
      <div class="view-actions">
        <div class="filter-group">
          <button 
            v-for="filter in filters"
            :key="filter.value"
            class="filter-btn"
            :class="{ active: activeFilter === filter.value }"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
        
        <button class="add-task-btn" @click="showModal = true">
          <span class="plus-icon">+</span>
          添加任务
        </button>
      </div>
    </div>
    
    <div class="tasks-container">
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3 class="empty-title">暂无任务</h3>
        <p class="empty-desc">点击上方按钮添加你的第一个任务</p>
      </div>
      
      <div v-else class="tasks-list">
        <TaskCard
          v-for="(task, index) in sortedTasks"
          :key="task.id"
          :task="task"
          :index="index"
          @toggle="handleToggleTask"
          @edit="handleEditTask"
          @delete="handleDeleteTask"
        />
      </div>
    </div>
    
    <BatchActionBar
      v-if="selectedCount > 0"
      :count="selectedCount"
      @complete-all="handleBatchComplete"
      @delete-all="handleBatchDelete"
      @clear="clearSelection"
    />
    
    <TaskModal
      :visible="showModal"
      :task="editingTask"
      :folders="folders"
      :selected-list="selectedList"
      @close="closeModal"
      @submit="handleSubmitTask"
    />
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import api from '../api'
import TaskCard from '../components/TaskCard.vue'
import TaskModal from '../components/TaskModal.vue'
import BatchActionBar from '../components/BatchActionBar.vue'

export default {
  name: 'Home',
  components: { TaskCard, TaskModal, BatchActionBar },
  props: {
    folders: {
      type: Array,
      default: () => []
    },
    selectedFolder: {
      type: Object,
      default: null
    },
    selectedList: {
      type: Object,
      default: null
    },
    tasks: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update-tasks'],
  setup(props, { emit }) {
    const store = useStore()
    
    const showModal = ref(false)
    const editingTask = ref(null)
    const activeFilter = ref('all')
    
    const filters = [
      { value: 'all', label: '全部' },
      { value: 'pending', label: '待完成' },
      { value: 'completed', label: '已完成' }
    ]
    
    const titleText = computed(() => {
      if (props.selectedList) return props.selectedList.name
      if (props.selectedFolder) return props.selectedFolder.name
      return '全部任务'
    })
    
    const pendingCount = computed(() => {
      return props.tasks.filter(t => !t.isCompleted).length
    })
    
    const urgentCount = computed(() => {
      return props.tasks.filter(t => !t.isCompleted && t.priority === 'urgent').length
    })
    
    const selectedCount = computed(() => {
      return store.state.selectedTasks.length
    })
    
    const filteredTasks = computed(() => {
      let tasks = props.tasks
      
      switch (activeFilter.value) {
        case 'pending':
          tasks = tasks.filter(t => !t.isCompleted)
          break
        case 'completed':
          tasks = tasks.filter(t => t.isCompleted)
          break
      }
      
      return tasks
    })
    
    const sortedTasks = computed(() => {
      const priorityOrder = { urgent: 0, important: 1, normal: 2 }
      return [...filteredTasks.value].sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1
        }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        }
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate)
        }
        if (a.dueDate) return -1
        if (b.dueDate) return 1
        return 0
      })
    })
    
    const handleToggleTask = async (task, data) => {
      try {
        await api.updateTask(task.id, data)
        emit('update-tasks')
        if (data.isCompleted) {
          store.commit('TOGGLE_SELECTED_TASK', task.id)
        }
      } catch (error) {
        console.error('Failed to toggle task:', error)
      }
    }
    
    const handleEditTask = (task) => {
      editingTask.value = task
      showModal.value = true
    }
    
    const handleDeleteTask = async (taskId) => {
      try {
        await api.deleteTask(taskId)
        emit('update-tasks')
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
    
    const handleSubmitTask = async ({ isEdit, taskId, data }) => {
      try {
        if (isEdit && taskId) {
          await api.updateTask(taskId, data)
        } else {
          await api.createTask(data)
        }
        emit('update-tasks')
      } catch (error) {
        console.error('Failed to save task:', error)
      }
    }
    
    const closeModal = () => {
      showModal.value = false
      editingTask.value = null
    }
    
    const handleBatchComplete = async () => {
      const taskIds = store.state.selectedTasks
      for (const id of taskIds) {
        await api.updateTask(id, { isCompleted: true })
      }
      store.commit('CLEAR_SELECTED_TASKS')
      emit('update-tasks')
    }
    
    const handleBatchDelete = async () => {
      if (!confirm(`确定要删除选中的 ${selectedCount.value} 个任务吗？`)) return
      
      const taskIds = store.state.selectedTasks
      for (const id of taskIds) {
        await api.deleteTask(id)
      }
      store.commit('CLEAR_SELECTED_TASKS')
      emit('update-tasks')
    }
    
    const clearSelection = () => {
      store.commit('CLEAR_SELECTED_TASKS')
    }
    
    watch(
      () => props.tasks,
      () => {},
      { deep: true }
    )
    
    return {
      showModal,
      editingTask,
      activeFilter,
      filters,
      titleText,
      pendingCount,
      urgentCount,
      selectedCount,
      filteredTasks,
      sortedTasks,
      handleToggleTask,
      handleEditTask,
      handleDeleteTask,
      handleSubmitTask,
      closeModal,
      handleBatchComplete,
      handleBatchDelete,
      clearSelection
    }
  }
}
</script>

<style scoped>
.home-view {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  gap: 20px;
}

.view-title-section {
  flex: 1;
}

.view-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px 0;
  letter-spacing: -0.5px;
}

.view-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.urgent-count {
  color: #ef4444;
  font-weight: 500;
}

.view-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-group {
  display: flex;
  background: var(--bg-secondary);
  padding: 4px;
  border-radius: 12px;
}

.filter-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.filter-btn:hover {
  color: var(--text-primary);
}

.filter-btn.active {
  background: var(--bg-card);
  color: var(--primary-color);
  box-shadow: var(--shadow-soft);
}

.add-task-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--primary-color);
  color: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.add-task-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.plus-icon {
  font-size: 18px;
  line-height: 1;
}

.tasks-container {
  flex: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .view-actions {
    flex-wrap: wrap;
  }
  
  .filter-group {
    flex: 1;
    justify-content: space-between;
  }
}
</style>
