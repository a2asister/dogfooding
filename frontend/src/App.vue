<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useTripStore } from './stores/trip';
import NavBar from './components/NavBar.vue';

const store = useTripStore();

onMounted(() => {
  document.body.classList.add('day-mode');
});

watch(
  () => store.isDayTime,
  (isDay) => {
    if (isDay) {
      document.body.classList.remove('night-mode');
      document.body.classList.add('day-mode');
    } else {
      document.body.classList.remove('day-mode');
      document.body.classList.add('night-mode');
    }
  }
);
</script>

<template>
  <div class="app-container">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
}
</style>