<template>
  <div class="home-view">
    <header class="header">
      <h1>🔬 3D 交互式元素周期表</h1>
      <div class="nav-buttons">
        <button @click="showPanel = 'favorites'" :class="{ active: showPanel === 'favorites' }">
          ⭐ 收藏 ({{ store.favorites.length }})
        </button>
        <button @click="showPanel = 'notes'" :class="{ active: showPanel === 'notes' }">
          📝 笔记
        </button>
      </div>
    </header>

    <PeriodicTable3D @select-element="handleSelectElement" />

    <ElementDetail 
      v-if="store.selectedElement" 
      :element="store.selectedElement"
      @close="store.selectElement(null)"
    />

    <div class="side-panel" :class="{ visible: showPanel }">
      <div class="panel-header">
        <h3>{{ showPanel === 'favorites' ? '收藏的元素' : '学习笔记' }}</h3>
        <button class="close-btn" @click="showPanel = null">×</button>
      </div>
      <div class="panel-content">
        <FavoritesPanel v-if="showPanel === 'favorites'" />
        <NotesPanel v-else-if="showPanel === 'notes'" />
      </div>
    </div>

    <div class="legend" v-if="Object.keys(store.elementsByCategory).length > 0">
      <h4>元素分类</h4>
      <div class="legend-items">
        <div v-for="(elements, category) in store.elementsByCategory" :key="category" class="legend-item">
          <span class="color-dot" :style="{ backgroundColor: elements?.[0]?.color || '#666' }"></span>
          <span>{{ category }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useElementStore } from '@/stores/elementStore';
import PeriodicTable3D from '@/components/PeriodicTable3D.vue';
import ElementDetail from '@/components/ElementDetail.vue';
import FavoritesPanel from '@/components/FavoritesPanel.vue';
import NotesPanel from '@/components/NotesPanel.vue';

const store = useElementStore();
const showPanel = ref<'favorites' | 'notes' | null>(null);

function handleSelectElement(element: any) {
  store.selectElement(element);
}

onMounted(async () => {
  await store.fetchElements();
  await store.fetchFavorites();
  await store.fetchNotes();
  await store.fetchCategories();
});
</script>

<style scoped lang="scss">
.home-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 100;

  h1 {
    font-size: 1.5rem;
    background: linear-gradient(90deg, #00d4ff, #7b2cbf);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.nav-buttons {
  display: flex;
  gap: 1rem;

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover, &.active {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
  }
}

.side-panel {
  position: fixed;
  top: 0;
  right: -350px;
  width: 350px;
  height: 100%;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  z-index: 200;
  transition: right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;

  &.visible {
    right: 0;
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    font-size: 1.2rem;
  }

  .close-btn {
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.legend {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 12px;
  z-index: 100;

  h4 {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
}
</style>
