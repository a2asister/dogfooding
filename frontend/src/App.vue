<template>
  <div class="app">
    <header class="header">
      <div class="container header-content">
        <h1 class="logo">🐾 宠物时光</h1>
        <nav class="nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/pets" class="nav-link">我的宠物</router-link>
          <router-link to="/album" class="nav-link">相册</router-link>
        </nav>
      </div>
    </header>
    <main class="main container">
      <router-view />
    </main>
    <footer class="footer">
      <p>❤️ 宠物成长3D时光纪念系统 © 2024</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

.logo {
  font-size: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: #555;
  font-weight: 600;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #667eea;
}

.main {
  padding: 30px 20px;
  min-height: calc(100vh - 160px);
}

.footer {
  text-align: center;
  padding: 20px;
  color: white;
  opacity: 0.8;
}
</style>
