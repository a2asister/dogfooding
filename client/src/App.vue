<template>
  <div id="app" :class="{ 'dark-theme': isDark }">
    <div class="app-container">
      <Sidebar 
        :folders="folders"
        :selected-folder="selectedFolder"
        :selected-list="selectedList"
        @select-folder="selectFolder"
        @select-list="selectList"
        @add-folder="addFolder"
        @add-list="addList"
        @delete-folder="deleteFolder"
        @delete-list="deleteList"
      />
      <main class="main-content">
        <header class="header">
          <div class="header-left">
            <h1 class="app-title">时光极简待办</h1>
            <p class="current-date">{{ currentDateText }}</p>
          </div>
          <div class="header-right">
            <button class="theme-toggle" @click="toggleTheme">
              {{ isDark ? '☀️' : '🌙' }}
            </button>
            <router-link to="/stats" class="stats-link">数据统计</router-link>
          </div>
        </header>
        
        <router-view 
          :folders="folders"
          :selected-folder="selectedFolder"
          :selected-list="selectedList"
          :tasks="filteredTasks"
          @update-tasks="loadTasks"
        />
      </main>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import api from './api'

export default {
  name: 'App',
  components: { Sidebar },
  setup() {
    const store = useStore()
    const router = useRouter()
    const isDark = ref(false)
    const folders = ref([])
    const selectedFolder = ref(null)
    const selectedList = ref(null)
    const tasks = ref([])
    
    const currentDateText = computed(() => {
      const now = new Date()
      const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
      return now.toLocaleDateString('zh-CN', options)
    })
    
    const filteredTasks = computed(() => {
      if (selectedList.value) {
        return tasks.value.filter(t => t.listId === selectedList.value.id)
      }
      if (selectedFolder.value) {
        const listIds = store.state.lists
          .filter(l => l.folderId === selectedFolder.value.id)
          .map(l => l.id)
        return tasks.value.filter(t => listIds.includes(t.listId))
      }
      return tasks.value
    })
    
    const checkTheme = () => {
      const saved = localStorage.getItem('theme')
      if (saved) {
        isDark.value = saved === 'dark'
      } else {
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
    }
    
    const toggleTheme = () => {
      isDark.value = !isDark.value
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
      document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
    }
    
    const loadData = async () => {
      try {
        const response = await api.getAllData()
        store.commit('SET_FOLDERS', response.folders)
        store.commit('SET_LISTS', response.lists)
        folders.value = response.folders
        tasks.value = response.tasks
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    
    const loadTasks = async () => {
      try {
        const response = await api.getTasks()
        tasks.value = response
      } catch (error) {
        console.error('Failed to load tasks:', error)
      }
    }
    
    const selectFolder = (folder) => {
      selectedFolder.value = folder
      selectedList.value = null
      router.push('/')
    }
    
    const selectList = (list) => {
      selectedList.value = list
      const folder = folders.value.find(f => f.id === list.folderId)
      selectedFolder.value = folder || null
      router.push('/')
    }
    
    const addFolder = async (folderData) => {
      try {
        const response = await api.createFolder(folderData)
        folders.value.push(response)
        store.commit('ADD_FOLDER', response)
      } catch (error) {
        console.error('Failed to create folder:', error)
      }
    }
    
    const addList = async (listData) => {
      try {
        const response = await api.createList(listData)
        store.commit('ADD_LIST', response)
      } catch (error) {
        console.error('Failed to create list:', error)
      }
    }
    
    const deleteFolder = async (folderId) => {
      try {
        await api.deleteFolder(folderId)
        folders.value = folders.value.filter(f => f.id !== folderId)
        store.commit('DELETE_FOLDER', folderId)
        if (selectedFolder.value?.id === folderId) {
          selectedFolder.value = null
          selectedList.value = null
        }
        await loadTasks()
      } catch (error) {
        console.error('Failed to delete folder:', error)
      }
    }
    
    const deleteList = async (listId) => {
      try {
        await api.deleteList(listId)
        store.commit('DELETE_LIST', listId)
        if (selectedList.value?.id === listId) {
          selectedList.value = null
        }
        await loadTasks()
      } catch (error) {
        console.error('Failed to delete list:', error)
      }
    }
    
    onMounted(() => {
      checkTheme()
      loadData()
      
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          isDark.value = e.matches
          document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
        }
      })
    })
    
    watch(
      () => store.state.lists,
      () => {},
      { deep: true }
    )
    
    return {
      isDark,
      folders,
      selectedFolder,
      selectedList,
      tasks,
      filteredTasks,
      currentDateText,
      toggleTheme,
      selectFolder,
      selectList,
      addFolder,
      addList,
      deleteFolder,
      deleteList,
      loadTasks
    }
  }
}
</script>

<style scoped>
#app {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
  transition: background 0.3s ease;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 32px 48px;
  padding-left: 320px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-left .app-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.header-left .current-date {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: var(--bg-secondary);
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background: var(--bg-tertiary);
  transform: scale(1.05);
}

.stats-link {
  padding: 10px 20px;
  border-radius: 12px;
  background: var(--primary-color);
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.stats-link:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

@media (max-width: 1024px) {
  .main-content {
    padding: 24px;
    padding-left: 260px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px;
    padding-left: 20px;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
