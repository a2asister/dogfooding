<template>
  <div class="search-container">
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input 
        v-model="searchText" 
        type="text" 
        class="search-input"
        placeholder="搜索灵感..."
        @input="handleSearch"
      />
      <button v-if="searchText" class="clear-btn" @click="clearSearch">✕</button>
      <button class="filter-btn" @click="showFilters = !showFilters">
        <span class="filter-icon">⚙</span>
      </button>
    </div>
    
    <div class="filters-panel" v-if="showFilters">
      <div class="filter-section">
        <label class="filter-label">按标签筛选</label>
        <div class="tag-filters">
          <button 
            v-for="tag in tags" 
            :key="tag"
            class="tag-filter"
            :class="{ 'active': selectedTag === tag }"
            @click="toggleTagFilter(tag)"
          >
            {{ tag }}
          </button>
          <button 
            v-if="selectedTag"
            class="clear-tag-filter"
            @click="clearTagFilter"
          >
            清除
          </button>
        </div>
      </div>
      
      <div class="filter-section">
        <label class="filter-label">按时间筛选</label>
        <div class="date-filters">
          <input 
            v-model="dateRange.start" 
            type="date" 
            class="date-input"
            @change="handleDateChange"
          />
          <span class="date-separator">至</span>
          <input 
            v-model="dateRange.end" 
            type="date" 
            class="date-input"
            @change="handleDateChange"
          />
          <button 
            v-if="dateRange.start || dateRange.end"
            class="clear-date-btn"
            @click="clearDateFilter"
          >
            清除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  tags: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['search'])

const searchText = ref('')
const showFilters = ref(false)
const selectedTag = ref('')
const dateRange = ref({
  start: '',
  end: ''
})

let debounceTimer = null

function handleSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emitSearch()
  }, 300)
}

function toggleTagFilter(tag) {
  if (selectedTag.value === tag) {
    selectedTag.value = ''
  } else {
    selectedTag.value = tag
  }
  emitSearch()
}

function clearTagFilter() {
  selectedTag.value = ''
  emitSearch()
}

function handleDateChange() {
  emitSearch()
}

function clearDateFilter() {
  dateRange.value = { start: '', end: '' }
  emitSearch()
}

function clearSearch() {
  searchText.value = ''
  emitSearch()
}

function emitSearch() {
  const params = {}
  
  if (searchText.value.trim()) {
    params.keyword = searchText.value.trim()
  }
  
  if (selectedTag.value) {
    params.tag = selectedTag.value
  }
  
  if (dateRange.value.start) {
    params.startDate = dateRange.value.start
  }
  
  if (dateRange.value.end) {
    params.endDate = dateRange.value.end
  }
  
  emit('search', params)
}

watch(() => props.tags, () => {
  if (!props.tags.includes(selectedTag.value)) {
    selectedTag.value = ''
  }
})
</script>

<style scoped>
.search-container {
  margin-bottom: 24px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: var(--color-card);
  border-radius: 20px 18px 22px 16px;
  box-shadow: var(--shadow-card);
  transition: all 0.3s;
}

.search-bar:focus-within {
  box-shadow: var(--shadow-hover);
}

.search-icon {
  font-size: 1.1rem;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  background: none;
  color: var(--color-text);
  font-size: 1rem;
}

.search-input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.clear-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:hover {
  background: var(--color-danger);
  color: white;
}

.filter-btn {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: var(--color-bg-secondary);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.filter-btn:hover {
  background: var(--color-primary-light);
}

.filter-icon {
  font-size: 1rem;
}

.filters-panel {
  margin-top: 16px;
  padding: 20px;
  background: var(--color-card);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  animation: fadeIn 0.3s ease;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.tag-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tag-filter {
  padding: 6px 16px;
  border-radius: 50px;
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  transition: all 0.3s;
}

.tag-filter:hover {
  background: var(--color-primary-light);
  color: white;
}

.tag-filter.active {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-accent));
  color: white;
}

.clear-tag-filter {
  padding: 6px 12px;
  border-radius: 50px;
  background: none;
  color: var(--color-danger);
  font-size: 0.85rem;
  text-decoration: underline;
}

.clear-tag-filter:hover {
  background: var(--color-danger);
  color: white;
  text-decoration: none;
}

.date-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.date-input {
  padding: 10px 16px;
  border-radius: 12px;
  background: var(--color-bg-secondary);
  color: var(--color-text);
  font-size: 0.9rem;
}

.date-separator {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.clear-date-btn {
  padding: 6px 12px;
  border-radius: 50px;
  background: none;
  color: var(--color-danger);
  font-size: 0.85rem;
  text-decoration: underline;
}

.clear-date-btn:hover {
  background: var(--color-danger);
  color: white;
  text-decoration: none;
}

@media (max-width: 768px) {
  .date-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .date-separator {
    display: none;
  }
}
</style>
