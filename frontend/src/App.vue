<template>
  <div id="app">
    <div class="app-header">
      <h1>文件上传系统</h1>
      <p>支持大文件分块上传 · 实时进度展示</p>
    </div>
    <FileUpload />
  </div>
</template>

<script setup lang="ts">
import FileUpload from './components/FileUpload.vue';
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  padding: 2rem 0;
}

.app-header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  p {
    font-size: 1.1rem;
    opacity: 0.9;
  }
}
</style>
