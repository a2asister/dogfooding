<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="logo">✨ 像素粒子解构工具</h1>
      <nav class="nav-menu">
        <router-link to="/" class="nav-link">编辑器</router-link>
        <router-link to="/gallery" class="nav-link">作品库</router-link>
        <router-link to="/stats" class="nav-link">统计</router-link>
      </nav>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  padding: 20px 40px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(90deg, #00d2ff, #3a7bd5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 16px;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 8px;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #fff;
  background: rgba(0, 210, 255, 0.2);
}

.app-main {
  flex: 1;
  padding: 30px;
}
</style>
