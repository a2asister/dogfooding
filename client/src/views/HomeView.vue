<template>
  <div class="home-view">
    <div class="hero-section">
      <h1 class="hero-title">拟真物理翻页画册</h1>
      <p class="hero-subtitle">沉浸式的阅读体验，真实的物理效果</p>
      
      <div class="demo-book" @click="openDemoBook">
        <div class="book-preview">
          <PhysicsBook :pages="demoPages" />
        </div>
        <div class="book-info">
          <h2>点击体验演示画册</h2>
          <p>拖动书页或点击按钮体验真实物理翻页效果</p>
        </div>
      </div>
    </div>

    <nav class="main-nav">
      <router-link to="/library" class="nav-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
        <span>画册库</span>
      </router-link>
      <router-link to="/create" class="nav-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
        <span>创建画册</span>
      </router-link>
      <router-link to="/bookmarks" class="nav-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>我的书签</span>
      </router-link>
    </nav>

    <div class="features">
      <div class="feature-card">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
          </svg>
        </div>
        <h3>物理引擎驱动</h3>
        <p>真实书页弯曲、惯性回弹、光影阴影动态变化</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <h3>智能书签系统</h3>
        <p>书签悬浮微动动画，自动保存阅读进度</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="9"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3>画册库管理</h3>
        <p>浏览、搜索、管理个人画册收藏，分享给好友</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import PhysicsBook from '@/components/PhysicsBook.vue';

const router = useRouter();

const demoPages = [
  'https://picsum.photos/400/600?random=10',
  'https://picsum.photos/400/600?random=11',
  'https://picsum.photos/400/600?random=12',
  'https://picsum.photos/400/600?random=13',
  'https://picsum.photos/400/600?random=14',
];

function openDemoBook(): void {
  router.push('/reader/demo-book');
}
</script>

<style lang="scss" scoped>
.home-view {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 40px;
}

.hero-section {
  text-align: center;
  margin-bottom: 50px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 40px;
}

.demo-book {
  max-width: 700px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 30px;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.1);
  }
}

.book-preview {
  height: 400px;
  margin-bottom: 20px;
}

.book-info h2 {
  color: #fff;
  font-size: 24px;
  margin-bottom: 10px;
}

.book-info p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.main-nav {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 50px;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 25px 40px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 15px;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-3px);
  }
  
  svg {
    width: 32px;
    height: 32px;
  }
  
  span {
    font-size: 16px;
    font-weight: 500;
  }
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-5px);
  }
}

.feature-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  
  svg {
    width: 30px;
    height: 30px;
  }
}

.feature-card h3 {
  color: #fff;
  font-size: 20px;
  margin-bottom: 10px;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  line-height: 1.6;
}
</style>
