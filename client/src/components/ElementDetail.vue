<template>
  <div class="element-detail-overlay" @click.self="handleClose">
    <div class="element-detail" ref="modalRef">
      <div class="detail-header" :style="{ background: `linear-gradient(135deg, ${element.color || '#666'}33, transparent)` }">
        <div class="element-symbol" :style="{ color: element.color || '#fff', textShadow: `0 0 20px ${element.color || '#fff'}` }">
          {{ element.symbol || '?' }}
        </div>
        <div class="element-basic">
          <h2>{{ element.name || '未知元素' }}</h2>
          <p>原子序数: {{ element.atomicNumber || '-' }}</p>
          <p>原子质量: {{ element.atomicMass || '-' }} u</p>
        </div>
        <button class="close-btn" @click="handleClose">×</button>
      </div>
      
      <div class="detail-body">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">分类</span>
            <span class="value">{{ element.category || '未知' }}</span>
          </div>
          <div class="info-item">
            <span class="label">族</span>
            <span class="value">{{ element.group || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">周期</span>
            <span class="value">{{ element.period || '-' }}</span>
          </div>
          <div class="info-item" v-if="element.electronegativity">
            <span class="label">电负性</span>
            <span class="value">{{ element.electronegativity }}</span>
          </div>
          <div class="info-item" v-if="element.meltingPoint">
            <span class="label">熔点</span>
            <span class="value">{{ element.meltingPoint }} K</span>
          </div>
          <div class="info-item" v-if="element.boilingPoint">
            <span class="label">沸点</span>
            <span class="value">{{ element.boilingPoint }} K</span>
          </div>
        </div>

        <div class="description" v-if="element.description">
          <h4>📖 简介</h4>
          <p>{{ element.description }}</p>
        </div>

        <div class="actions">
          <button class="action-btn favorite" @click="toggleFavorite">
            {{ isFavorite ? '★ 已收藏' : '☆ 收藏' }}
          </button>
          <button class="action-btn note" @click="showNoteInput = true">
            📝 添加笔记
          </button>
        </div>

        <div class="note-input" v-if="showNoteInput">
          <textarea 
            v-model="newNote" 
            placeholder="写下你的学习笔记..."
            rows="3"
          ></textarea>
          <div class="note-actions">
            <button @click="showNoteInput = false">取消</button>
            <button class="primary" @click="addNote">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useElementStore } from '@/stores/elementStore';
import type { Element } from '@/types/element';

const props = defineProps<{
  element: Element;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useElementStore();
const modalRef = ref<HTMLDivElement>();
const showNoteInput = ref(false);
const newNote = ref('');

const isFavorite = computed(() => 
  store.favoriteElementIds.has(props.element.id)
);

function handleClose() {
  emit('close');
}

async function toggleFavorite() {
  await store.toggleFavorite(props.element.id);
}

async function addNote() {
  if (!newNote.value.trim()) return;
  await store.addNote(newNote.value.trim(), props.element.id);
  newNote.value = '';
  showNoteInput.value = false;
}

onMounted(() => {
  if (modalRef.value) {
    modalRef.value.animate([
      { transform: 'scale(0.9) translateY(20px)', opacity: 0 },
      { transform: 'scale(1) translateY(0)', opacity: 1 },
    ], {
      duration: 400,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    });
  }
});
</script>

<style scoped lang="scss">
.element-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.element-detail {
  background: linear-gradient(145deg, #1a1a2e, #16213e);
  border-radius: 20px;
  width: 90%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.detail-header {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-radius: 20px 20px 0 0;
  position: relative;

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.element-symbol {
  font-size: 4rem;
  font-weight: bold;
  margin-right: 1.5rem;
  font-family: 'Georgia', serif;
}

.element-basic {
  flex: 1;

  h2 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0.2rem 0;
  }
}

.detail-body {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.8rem 1rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  .label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .value {
    font-size: 1rem;
    font-weight: 500;
  }
}

.description {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;

  h4 {
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  p {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    font-size: 0.95rem;
  }
}

.actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.action-btn {
  flex: 1;
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &.favorite {
    background: linear-gradient(135deg, #ffd700, #ffb700);
    color: #1a1a2e;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
    }
  }

  &.note {
    background: linear-gradient(135deg, #00d4ff, #7b2cbf);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 212, 255, 0.4);
    }
  }
}

.note-input {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 10px;

  textarea {
    width: 100%;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.8rem;
    color: white;
    font-size: 0.95rem;
    resize: vertical;
    font-family: inherit;
    margin-bottom: 0.8rem;

    &:focus {
      outline: none;
      border-color: #00d4ff;
    }
  }

  .note-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.8rem;

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;

      &:first-child {
        background: rgba(255, 255, 255, 0.1);
        color: white;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }

      &.primary {
        background: linear-gradient(135deg, #00d4ff, #7b2cbf);
        color: white;

        &:hover {
          transform: translateY(-1px);
        }
      }
    }
  }
}
</style>
