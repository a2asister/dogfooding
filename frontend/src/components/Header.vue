<template>
  <header class="site-header">
    <div class="container header-content">
      <div class="logo">
        <router-link to="/">
          <h1>🎮 星际幻想</h1>
        </router-link>
      </div>
      <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
        <span v-if="!mobileMenuOpen">☰</span>
        <span v-else>✕</span>
      </button>
      <nav class="main-nav" :class="{ 'mobile-open': mobileMenuOpen }">
        <router-link to="/" class="nav-link" @click="mobileMenuOpen = false">首页</router-link>
        <router-link to="/intro" class="nav-link" @click="mobileMenuOpen = false">游戏介绍</router-link>
        <router-link to="/news" class="nav-link" @click="mobileMenuOpen = false">新闻资讯</router-link>
        <router-link to="/events" class="nav-link" @click="mobileMenuOpen = false">活动中心</router-link>
        <router-link to="/download" class="nav-link" @click="mobileMenuOpen = false">下载游戏</router-link>
        <router-link to="/service" class="nav-link" @click="mobileMenuOpen = false">玩家服务</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const mobileMenuOpen = ref(false)

const handleResize = () => {
  if (window.innerWidth > 992) {
    mobileMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
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

    .nav-link {
      color: var(--text-secondary);
      font-size: 15px;
      font-weight: 500;
      transition: all 0.3s ease;
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
      transition: max-height 0.3s ease;
      border-bottom: 1px solid var(--border-color);

      &.mobile-open {
        max-height: 500px;
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
