<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">{{ isEdit ? '编辑任务' : '新建任务' }}</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>
      
      <form class="modal-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">任务标题</label>
          <input 
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="输入任务标题..."
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">任务描述</label>
          <textarea 
            v-model="form.description"
            class="form-textarea"
            placeholder="添加任务描述（可选）..."
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group half">
            <label class="form-label">优先级</label>
            <div class="priority-selector">
              <button 
                v-for="p in priorities" 
                :key="p.value"
                type="button"
                class="priority-option"
                :class="[p.value, { selected: form.priority === p.value }]"
                @click="form.priority = p.value"
              >
                {{ p.label }}
              </button>
            </div>
          </div>
          
          <div class="form-group half">
            <label class="form-label">所属清单</label>
            <select v-model="form.listId" class="form-select" required>
              <option value="" disabled>选择清单...</option>
              <optgroup v-for="folder in folders" :key="folder.id" :label="folder.name">
                <option 
                  v-for="list in listsByFolder(folder.id)" 
                  :key="list.id" 
                  :value="list.id"
                >
                  {{ list.name }}
                </option>
              </optgroup>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group half">
            <label class="form-label">截止日期</label>
            <input 
              v-model="form.dueDate"
              type="date"
              class="form-input"
            />
          </div>
          
          <div class="form-group half">
            <label class="form-label">重复周期</label>
            <select v-model="form.repeatPattern" class="form-select">
              <option value="">不重复</option>
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
            </select>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="handleClose">
            取消
          </button>
          <button type="submit" class="btn btn-primary">
            {{ isEdit ? '保存修改' : '创建任务' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'TaskModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    task: {
      type: Object,
      default: null
    },
    folders: {
      type: Array,
      default: () => []
    },
    selectedList: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const store = useStore()
    
    const isEdit = computed(() => !!props.task)
    
    const priorities = [
      { value: 'urgent', label: '紧急' },
      { value: 'important', label: '重要' },
      { value: 'normal', label: '普通' }
    ]
    
    const defaultForm = () => ({
      title: '',
      description: '',
      priority: 'normal',
      listId: props.selectedList?.id || '',
      dueDate: '',
      repeatPattern: ''
    })
    
    const form = ref(defaultForm())
    
    const listsByFolder = (folderId) => {
      return store.state.lists.filter(l => l.folderId === folderId)
    }
    
    watch(
      () => props.visible,
      (newVal) => {
        if (newVal) {
          if (props.task) {
            form.value = {
              title: props.task.title,
              description: props.task.description || '',
              priority: props.task.priority,
              listId: props.task.listId,
              dueDate: props.task.dueDate 
                ? new Date(props.task.dueDate).toISOString().split('T')[0] 
                : '',
              repeatPattern: props.task.repeatPattern || ''
            }
          } else {
            form.value = defaultForm()
          }
        }
      }
    )
    
    const handleClose = () => {
      emit('close')
    }
    
    const handleSubmit = () => {
      if (!form.value.title.trim() || !form.value.listId) return
      
      const data = {
        title: form.value.title.trim(),
        description: form.value.description.trim(),
        priority: form.value.priority,
        listId: form.value.listId,
        dueDate: form.value.dueDate ? new Date(form.value.dueDate).toISOString() : null,
        isRepeating: !!form.value.repeatPattern,
        repeatPattern: form.value.repeatPattern || null
      }
      
      emit('submit', {
        isEdit: isEdit.value,
        taskId: props.task?.id,
        data
      })
      
      handleClose()
    }
    
    return {
      isEdit,
      form,
      priorities,
      listsByFolder,
      handleClose,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn var(--transition-fast);
  padding: 20px;
}

.modal-container {
  width: 100%;
  max-width: 500px;
  background: var(--bg-card);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: slideIn var(--transition-normal);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--danger);
  color: white;
}

.modal-form {
  padding: 0 24px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.half {
  flex: 1;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 14px;
  border: 2px solid transparent;
  transition: all var(--transition-fast);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: var(--primary-color);
  background: var(--bg-card);
}

.form-textarea {
  resize: none;
  line-height: 1.5;
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
}

.priority-selector {
  display: flex;
  gap: 8px;
}

.priority-option {
  flex: 1;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  border: 2px solid transparent;
  transition: all var(--transition-fast);
}

.priority-option:hover {
  transform: translateY(-1px);
}

.priority-option.urgent:hover {
  background: rgba(252, 165, 165, 0.2);
}

.priority-option.important:hover {
  background: rgba(252, 211, 77, 0.3);
}

.priority-option.normal:hover {
  background: rgba(147, 197, 253, 0.2);
}

.priority-option.urgent.selected {
  background: rgba(252, 165, 165, 0.2);
  border-color: #ef4444;
  color: #ef4444;
}

.priority-option.important.selected {
  background: rgba(252, 211, 77, 0.3);
  border-color: #ca8a04;
  color: #ca8a04;
}

.priority-option.normal.selected {
  background: rgba(147, 197, 253, 0.2);
  border-color: #3b82f6;
  color: #3b82f6;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--bg-secondary);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .form-row {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
