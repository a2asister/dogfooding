<template>
  <div class="favorites-panel">
    <div v-if="store.favorites.length === 0" class="empty-state">
      <div class="empty-icon">⭐</div>
      <p>还没有收藏的元素</p>
      <p class="hint">点击元素查看详情并收藏</p>
    </div>
    
    <div v-else class="favorites-list">
      <div 
        v-for="fav in store.favorites" 
        :key="fav.id" 
        class="favorite-item"
        @click="fav.element && selectElement(fav.element)"
      >
        <div class="element-symbol-small" :style="{ color: fav.element?.color || '#888', textShadow: `0 0 10px ${fav.element?.color || '#888'}` }">
          {{ fav.element?.symbol || '?' }}
        </div>
        <div class="element-info">
          <h4>{{ fav.element?.name || '未知元素' }}</h4>
          <p>原子序数: {{ fav.element?.atomicNumber || '-' }}</p>
        </div>
        <button 
          class="remove-btn" 
          @click.stop="removeFavorite(fav.elementId)"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useElementStore } from '@/stores/elementStore';

const store = useElementStore();

function selectElement(element: any) {
  store.selectElement(element);
}

async function removeFavorite(elementId: number) {
  await store.toggleFavorite(elementId);
}
</script>

<style scoped lang="scss">
.favorites-panel {
  width: 100%;
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

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(5px);
  }
}

.element-symbol-small {
  font-size: 1.8rem;
  font-weight: bold;
  font-family: 'Georgia', serif;
  min-width: 50px;
  text-align: center;
}

.element-info {
  flex: 1;

  h4 {
    font-size: 1rem;
    margin-bottom: 0.2rem;
  }

  p {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
  }
}

.remove-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 100, 100, 0.2);
  color: #ff6b6b;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 100, 100, 0.4);
    transform: scale(1.1);
  }
}
</style>
