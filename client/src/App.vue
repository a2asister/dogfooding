<template>
  <div class="app-container">
    <nav class="navbar">
      <div class="nav-brand">✨ 粒子艺术生成器</div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">创作</router-link>
        <router-link to="/gallery" class="nav-link">相册</router-link>
      </div>
    </nav>
    <main class="main-content">
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
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #ffffff;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #48dbfb, #ff9ff3);
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

.main-content {
  padding: 40px;
}
</style>
