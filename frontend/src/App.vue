<template>
  <div class="app-container">
    <header class="header">
      <div class="header-content">
        <h1 class="logo">
          <span class="logo-icon">◆</span>
          灵感备忘录
        </h1>
        <nav class="nav">
          <router-link to="/" class="nav-link" active-class="active">灵感</router-link>
          <router-link to="/archive" class="nav-link" active-class="active">归档</router-link>
        </nav>
        <button class="theme-toggle" @click="toggleTheme">
          {{ isDark ? '☀' : '☾' }}
        </button>
      </div>
    </header>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const isDark = ref(false)

function toggleTheme() {
  isDark.value = !isDark.value
}

watch(isDark, (newVal) => {
  document.documentElement.setAttribute('data-theme', newVal ? 'dark' : 'light')
  localStorage.setItem('theme', newVal ? 'dark' : 'light')
})

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
  }
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 20px 40px;
  background: var(--color-card);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.logo {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo-icon {
  color: var(--color-primary);
  font-size: 1.2rem;
}

.nav {
  display: flex;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text-secondary);
  font-weight: 500;
  padding: 8px 0;
  position: relative;
  transition: color 0.3s;
}

.nav-link:hover {
  color: var(--color-text);
}

.nav-link.active {
  color: var(--color-primary);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-primary);
  border-radius: 2px;
}

.theme-toggle {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-button);
  background: var(--color-bg-secondary);
  color: var(--color-text);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.theme-toggle:hover {
  background: var(--color-primary-light);
  transform: scale(1.05);
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 30px 40px;
}

@media (max-width: 768px) {
  .header {
    padding: 15px 20px;
  }

  .header-content {
    flex-wrap: wrap;
    gap: 15px;
  }

  .logo {
    font-size: 1.2rem;
  }

  .nav {
    gap: 20px;
  }

  .main-content {
    padding: 20px;
  }
}
</style>
