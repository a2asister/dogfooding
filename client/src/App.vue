<template>
  <div id="app">
    <el-container>
      <el-header class="header">
        <h1>🎨 无损图片去水印工具</h1>
        <p class="subtitle">基于 WASM 的智能图像修复技术</p>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 20px;
}

.header h1 {
  margin: 0;
  font-size: 28px;
}

.subtitle {
  margin: 8px 0 0 0;
  opacity: 0.9;
  font-size: 14px;
}

#app {
  min-height: 100vh;
  background: #f5f7fa;
}
</style>
