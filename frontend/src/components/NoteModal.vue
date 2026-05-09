<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEdit ? '编辑灵感' : '记录灵感' }}</h2>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>灵感内容</label>
            <textarea 
              v-model="form.content" 
              class="content-input"
              placeholder="此刻的灵感..."
              rows="4"
              maxlength="500"
            ></textarea>
            <span class="char-count">{{ form.content.length }}/500</span>
          </div>
          
          <div class="form-group">
            <label>标签</label>
            <div class="tags-selector">
              <div class="selected-tags">
                <span 
                  v-for="tag in form.tags" 
                  :key="tag" 
                  class="selected-tag"
                >
                  {{ tag }}
                  <button class="remove-tag" @click="removeTag(tag)">×</button>
                </span>
              </div>
              <div class="available-tags">
                <button 
                  v-for="tag in availableTags" 
                  :key="tag" 
                  class="tag-option"
                  :class="{ 'selected': form.tags.includes(tag) }"
                  @click="toggleTag(tag)"
                >
                  {{ tag }}
                </button>
                <div class="new-tag-input">
                  <input 
                    v-model="newTag" 
                    type="text" 
                    placeholder="新建标签"
                    @keyup.enter="addNewTag"
                  />
                  <button v-if="newTag.trim()" @click="addNewTag" class="add-tag-btn">+</button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>来源溯源</label>
            <input 
              v-model="form.source" 
              type="text" 
              class="source-input"
              placeholder="原创 / 书名 / 文章..."
            />
          </div>
          
          <div class="form-group" v-if="isEdit">
            <label>创建时间</label>
            <div class="time-info">
              <span class="time-label">创建：</span>
              <span class="time-value">{{ formatFullDate(note?.createdAt) }}</span>
            </div>
            <div class="time-info">
              <span class="time-label">更新：</span>
              <span class="time-value">{{ formatFullDate(note?.updatedAt) }}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-btn" @click="$emit('close')">取消</button>
          <button class="save-btn" @click="handleSave" :disabled="!canSave">
            {{ isEdit ? '保存修改' : '保存灵感' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  note: {
    type: Object,
    default: null
  },
  existingTags: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save', 'create-tag'])

const form = ref({
  content: '',
  tags: [],
  source: '原创'
})

const newTag = ref('')

const isEdit = computed(() => !!props.note)

const availableTags = computed(() => {
  return props.existingTags.filter(tag => !form.value.tags.includes(tag))
})

const canSave = computed(() => form.value.content.trim().length > 0)

watch(() => props.note, (newNote) => {
  if (newNote) {
    form.value = {
      content: newNote.content || '',
      tags: [...(newNote.tags || [])],
      source: newNote.source || '原创'
    }
  } else {
    form.value = {
      content: '',
      tags: [],
      source: '原创'
    }
  }
}, { immediate: true })

function toggleTag(tag) {
  const index = form.value.tags.indexOf(tag)
  if (index > -1) {
    form.value.tags.splice(index, 1)
  } else {
    form.value.tags.push(tag)
  }
}

function removeTag(tag) {
  const index = form.value.tags.indexOf(tag)
  if (index > -1) {
    form.value.tags.splice(index, 1)
  }
}

function addNewTag() {
  const tag = newTag.value.trim()
  if (tag && !props.existingTags.includes(tag) && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    emit('create-tag', tag)
  }
  newTag.value = ''
}

function handleSave() {
  if (!canSave.value) return
  
  emit('save', {
    id: props.note?.id,
    ...form.value
  })
}

function formatFullDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  padding: 20px;
}

.modal-content {
  background: var(--color-card);
  border-radius: 28px 24px 26px 22px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px 16px;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--color-primary-light);
  color: var(--color-text);
}

.modal-body {
  padding: 20px 28px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
}

.content-input {
  width: 100%;
  padding: 16px;
  border-radius: 16px 14px 18px 12px;
  background: var(--color-bg-secondary);
  color: var(--color-text);
  font-size: 1rem;
  line-height: 1.6;
  resize: none;
  transition: all 0.3s;
}

.content-input:focus {
  background: var(--color-card);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.char-count {
  display: block;
  text-align: right;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 6px;
}

.tags-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 32px;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 50px;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-accent));
  color: white;
  font-size: 0.85rem;
}

.remove-tag {
  background: none;
  color: white;
  font-size: 1rem;
  padding: 0;
  line-height: 1;
  opacity: 0.8;
}

.remove-tag:hover {
  opacity: 1;
}

.available-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tag-option {
  padding: 6px 14px;
  border-radius: 50px;
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  transition: all 0.3s;
}

.tag-option:hover {
  background: var(--color-primary-light);
  color: white;
}

.tag-option.selected {
  opacity: 0.5;
  cursor: not-allowed;
}

.new-tag-input {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: var(--color-bg-secondary);
  border-radius: 50px;
}

.new-tag-input input {
  background: none;
  color: var(--color-text);
  font-size: 0.85rem;
  padding: 2px 4px;
  width: 80px;
}

.add-tag-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.source-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 14px;
  background: var(--color-bg-secondary);
  color: var(--color-text);
  font-size: 0.95rem;
  transition: all 0.3s;
}

.source-input:focus {
  background: var(--color-card);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.time-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 0.9rem;
}

.time-label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.time-value {
  color: var(--color-text);
  font-style: italic;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 28px 24px;
  border-top: 1px solid var(--color-border);
}

.cancel-btn {
  flex: 1;
  padding: 14px;
  border-radius: 16px;
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-size: 1rem;
  font-weight: 500;
}

.cancel-btn:hover {
  background: var(--color-primary-light);
  color: white;
}

.save-btn {
  flex: 1;
  padding: 14px;
  border-radius: 16px;
  background: var(--color-primary);
  color: white;
  font-size: 1rem;
  font-weight: 500;
}

.save-btn:hover:not(:disabled) {
  background: var(--color-accent);
  transform: translateY(-1px);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
