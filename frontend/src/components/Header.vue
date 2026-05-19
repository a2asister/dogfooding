<template>
  <header class="site-header">
    <div class="container header-content">
      <div class="logo">
        <router-link to="/">
          <h1>🎮 {{ t.home.title }}</h1>
        </router-link>
      </div>
      <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
        <span v-if="!mobileMenuOpen">☰</span>
        <span v-else>✕</span>
      </button>
      <nav class="main-nav" :class="{ 'mobile-open': mobileMenuOpen }">
        <router-link to="/" class="nav-link" @click="mobileMenuOpen = false">{{ t.nav.home }}</router-link>
        <router-link to="/intro" class="nav-link" @click="mobileMenuOpen = false">{{ t.nav.intro }}</router-link>
        <router-link to="/news" class="nav-link" @click="mobileMenuOpen = false">{{ t.nav.news }}</router-link>
        <router-link to="/events" class="nav-link" @click="mobileMenuOpen = false">{{ t.nav.events }}</router-link>
        <router-link to="/download" class="nav-link" @click="mobileMenuOpen = false">{{ t.nav.download }}</router-link>
        <router-link to="/service" class="nav-link" @click="mobileMenuOpen = false">{{ t.nav.service }}</router-link>
        <button class="lang-switch" @click="toggleLocale">
          {{ locale === 'zh-CN' ? 'EN' : '中文' }}
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '../composables/useI18n'

const { t, locale, toggleLocale } = useI18n()

const mobileMenuOpen = ref(false)

const handleResize = () => {
  if (window.innerWidth > 992) {
    mobileMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  document.documentElement.lang = locale.value
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.site-header {
  background: rgba(13, 17, 23, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    position: relative;
  }

  .logo h1 {
    font-size: 24px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--secondary-color), var(--accent-purple));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    color: var(--text-primary);
    font-size: 24px;
    cursor: pointer;
    padding: 8px;
    z-index: 101;

    &:hover {
      color: var(--secondary-color);
    }
  }

  .main-nav {
    display: flex;
    gap: 32px;
    align-items: center;

    .nav-link {
      color: var(--text-secondary);
      font-size: 15px;
      font-weight: 500;
      transition: all 0.3s var(--ease-smooth);
      position: relative;

      &:hover, &.router-link-active {
        color: var(--secondary-color);
      }

      &.router-link-active::after {
        content: '';
        position: absolute;
        bottom: -24px;
        left: 0;
        width: 100%;
        height: 2px;
        background: var(--secondary-color);
      }
    }

    .lang-switch {
      padding: 6px 12px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s var(--ease-smooth);

      &:hover {
        border-color: var(--secondary-color);
        color: var(--secondary-color);
        background: rgba(0, 245, 255, 0.1);
      }
    }
  }
}

@media (max-width: 992px) {
  .site-header {
    .mobile-menu-btn {
      display: block;
    }

    .main-nav {
      position: fixed;
      top: 70px;
      left: 0;
      right: 0;
      background: rgba(13, 17, 23, 0.98);
      backdrop-filter: blur(10px);
      flex-direction: column;
      gap: 0;
      padding: 0;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s var(--ease-smooth);
      border-bottom: 1px solid var(--border-color);
      align-items: stretch;

      &.mobile-open {
        max-height: 600px;
      }

      .nav-link {
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-color);

        &.router-link-active::after {
          display: none;
        }

        &:last-child {
          border-bottom: none;
        }
      }

      .lang-switch {
        margin: 16px 20px;
        width: calc(100% - 40px);
      }
    }
  }
}

@media (max-width: 576px) {
  .site-header {
    .header-content {
      height: 60px;
    }

    .logo h1 {
      font-size: 18px;
    }

    .main-nav {
      top: 60px;
    }
  }
}
</style>
