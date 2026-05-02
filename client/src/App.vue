<template>
  <div id="app">
    <header class="app-header">
      <div class="container header-content">
        <div class="logo" @click="$router.push('/')">
          <span class="logo-icon">🎫</span>
          <span class="logo-text">票务选座系统</span>
        </div>
        <nav class="nav-menu">
          <router-link to="/" class="nav-item" :class="{ active: $route.name === 'home' }">
            首页
          </router-link>
        </nav>
      </div>
    </header>
    <main class="app-main">
      <router-view />
    </main>
    <footer class="app-footer">
      <div class="container">
        <p>© 2024 票务选座系统 - 让购票更简单</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo-icon {
  font-size: 28px;
  margin-right: 10px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-item {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 0;
  position: relative;
  transition: color 0.3s ease;
  
  &:hover {
    color: white;
  }
  
  &.active {
    color: white;
    
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: white;
      border-radius: 1px;
    }
  }
}

.app-main {
  min-height: calc(100vh - 120px);
  padding: 30px 0;
}

.app-footer {
  background: #333;
  color: #999;
  padding: 20px 0;
  text-align: center;
}
</style>
