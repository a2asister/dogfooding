<template>
  <div class="app">
    <Toolbar />
    <DrawingCanvas />
  </div>
</template>

<script setup lang="ts">
import Toolbar from './components/Toolbar.vue'
import DrawingCanvas from './components/DrawingCanvas.vue'
</script>

<style lang="scss">
.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
