<template>
  <div class="notes-panel">
    <div class="add-note-section">
      <textarea 
        v-model="newNote" 
        placeholder="添加新笔记..."
        rows="3"
      ></textarea>
      <button class="add-btn" @click="addNote" :disabled="!newNote.trim()">
        + 添加笔记
      </button>
    </div>

    <div v-if="store.notes.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <p>还没有笔记</p>
      <p class="hint">在上方输入框创建第一条笔记</p>
    </div>

    <div v-else class="notes-list">
      <div 
        v-for="note in store.notes" 
        :key="note.id" 
        class="note-item"
      >
        <div class="note-content">
          <p>{{ note.content || '' }}</p>
          <div class="note-meta" v-if="note.element">
            <span class="related-element" :style="{ color: note.element?.color || '#888' }">
              {{ note.element?.symbol || '?' }} - {{ note.element?.name || '未知' }}
            </span>
          </div>
          <div class="note-date">
            {{ note.createdAt ? formatDate(note.createdAt) : '' }}
          </div>
        </div>
        <button 
          class="delete-btn" 
          @click="deleteNote(note.id)"
        >
          🗑️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useElementStore } from '@/stores/elementStore';

const store = useElementStore();
const newNote = ref('');

async function addNote() {
  if (!newNote.value.trim()) return;
  await store.addNote(newNote.value.trim());
  newNote.value = '';
}

async function deleteNote(id: number) {
  await store.deleteNote(id);
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>

<style scoped lang="scss">
.notes-panel {
  width: 100%;
}

.add-note-section {
  margin-bottom: 1.5rem;

  textarea {
    width: 100%;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 0.8rem 1rem;
    color: white;
    font-size: 0.95rem;
    resize: vertical;
    font-family: inherit;
    margin-bottom: 0.8rem;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #00d4ff;
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
  }

  .add-btn {
    width: 100%;
    padding: 0.7rem 1rem;
    border: none;
    border-radius: 8px;
    background: linear-gradient(135deg, #00d4ff, #7b2cbf);
    color: white;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 212, 255, 0.3);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255, 255, 255, 0.5);

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  p {
    margin: 0.3rem 0;

    &.hint {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.3);
    }
  }
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.note-item {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}

.note-content {
  flex: 1;

  p {
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 0.5rem;
    word-break: break-word;
  }
}

.note-meta {
  margin-bottom: 0.5rem;
}

.related-element {
  display: inline-block;
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-weight: 500;
}

.note-date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.delete-btn {
  padding: 0.4rem;
  border: none;
  border-radius: 6px;
  background: rgba(255, 100, 100, 0.1);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 100, 100, 0.3);
    transform: scale(1.1);
  }
}
</style>
