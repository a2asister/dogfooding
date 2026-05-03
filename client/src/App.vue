<template>
  <div id="app">
    <header class="app-header">
      <nav class="nav-container">
        <h1 class="app-title">电商商品管理系统</h1>
        <div class="nav-links">
          <router-link to="/" class="nav-link">商品列表</router-link>
          <router-link to="/admin" class="nav-link">管理后台</router-link>
        </div>
      </nav>
    </header>
    <main class="app-main">
      <router-view />
    </main>
    <footer class="app-footer">
      <p>&copy; 2024 电商商品详情页及管理系统</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: rgba(255,255,255,0.15);
}

.nav-link.router-link-active {
  background: rgba(255,255,255,0.25);
}

.app-main {
  flex: 1;
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background: #f8f9fa;
  padding: 1.5rem 0;
  text-align: center;
  color: #6c757d;
  border-top: 1px solid #e9ecef;
}

.app-footer p {
  margin: 0;
}
</style>