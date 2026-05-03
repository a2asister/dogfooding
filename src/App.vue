<template>
  <div class="app-container">
    <Sidebar
      ref="sidebarRef"
      @selectStore="handleSelectStore"
      @refresh="handleRefresh"
    />
    <div class="main-content">
      <DataManager
        :current-db="currentDb"
        :current-store="currentStore"
        @refresh="handleRefresh"
        @delete-store="handleDeleteStore"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import DataManager from './components/DataManager.vue'

const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null)
const currentDb = ref('')
const currentStore = ref('')

const handleSelectStore = (dbName: string, storeName: string) => {
  currentDb.value = dbName
  currentStore.value = storeName
}

const handleRefresh = async () => {
  if (sidebarRef.value) {
    await sidebarRef.value.loadDatabases()
  }
}

const handleDeleteStore = () => {
  currentStore.value = ''
}
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: hidden;
}
</style>