<script setup lang="ts">
import { onMounted } from 'vue'
import { useSleepStore } from './stores/sleep'
import StarryBackground from './components/StarryBackground.vue'
import TabBar from './components/TabBar.vue'

const store = useSleepStore()

onMounted(() => {
  store.fetchToday()
  store.fetchHistory()
  store.fetchReminders()
})
</script>

<template>
  <div class="app-container">
    <StarryBackground />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <TabBar />
  </div>
</template>

<style scoped>
.app-container {
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  z-index: 1;
  padding-bottom: 80px;
}
</style>
