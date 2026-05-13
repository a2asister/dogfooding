<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="floating">🐾</span>
          记录宠物每一刻美好
        </h1>
        <p class="hero-subtitle">用3D时光纪念系统珍藏与毛孩子的点滴回忆</p>
        <div class="hero-buttons">
          <router-link to="/pets" class="btn btn-primary btn-lg">开始记录</router-link>
        </div>
      </div>
      <div class="hero-visual">
        <div class="pet-avatar floating-avatar">🐱</div>
        <div class="pet-avatar floating-avatar delay-1">🐶</div>
        <div class="pet-avatar floating-avatar delay-2">🐰</div>
      </div>
    </div>

    <div class="features-section">
      <h2 class="section-title">✨ 精彩功能</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📸</div>
          <h3>3D照片轮播</h3>
          <p>平滑3D动画效果，让照片动起来</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📈</div>
          <h3>成长曲线</h3>
          <p>流体动画展示宠物成长轨迹</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📖</div>
          <h3>相册翻页</h3>
          <p>真实翻页形变效果，沉浸式体验</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🌟</div>
          <h3>节点点亮</h3>
          <p>成长重要时刻粒子特效点亮</p>
        </div>
      </div>
    </div>

    <ParticleBackground />
  </div>
</template>

<script setup lang="ts">
import ParticleBackground from '../components/ParticleBackground.vue'
</script>

<style scoped>
.home {
  position: relative;
}

.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
  padding: 60px 0;
}

.hero-title {
  font-size: 48px;
  color: white;
  margin-bottom: 20px;
  line-height: 1.3;
}

.floating {
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.hero-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
}

.btn-lg {
  padding: 15px 40px;
  font-size: 18px;
}

.hero-visual {
  position: relative;
  height: 300px;
}

.pet-avatar {
  position: absolute;
  font-size: 80px;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2));
}

.floating-avatar {
  animation: floatAvatar 4s ease-in-out infinite;
}

.floating-avatar.delay-1 {
  animation-delay: 1s;
}

.floating-avatar.delay-2 {
  animation-delay: 2s;
}

@keyframes floatAvatar {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(5deg); }
  75% { transform: translateY(-10px) rotate(-5deg); }
}

.pet-avatar:nth-child(1) {
  top: 20px;
  left: 50px;
}

.pet-avatar:nth-child(2) {
  top: 100px;
  right: 80px;
}

.pet-avatar:nth-child(3) {
  bottom: 30px;
  left: 120px;
}

.features-section {
  padding: 60px 0;
}

.section-title {
  text-align: center;
  color: white;
  font-size: 36px;
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px 20px;
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-10px);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.feature-card h3 {
  color: #333;
  margin-bottom: 10px;
}

.feature-card p {
  color: #666;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-section {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-title {
    font-size: 32px;
  }

  .hero-visual {
    height: 200px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
