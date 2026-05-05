<template>
  <div class="home-container">
    <el-row :gutter="20" class="welcome-section">
      <el-col :span="18">
        <div class="welcome-card">
          <div class="welcome-content">
            <h1 class="welcome-title">欢迎使用促销系统</h1>
            <p class="welcome-desc">
              一站式促销管理平台，涵盖活动配置、秒杀、拼团、优惠券、抽奖、积分、分销等多种营销工具
            </p>
            <div class="welcome-stats">
              <div class="stat-item">
                <span class="stat-value">7</span>
                <span class="stat-label">业务模块</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">100%</span>
                <span class="stat-label">微服务架构</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">Vue3</span>
                <span class="stat-label">前端技术栈</span>
              </div>
            </div>
          </div>
          <div class="welcome-image">
            <el-icon :size="120" style="color: #ff6b6b"><Promotion /></el-icon>
          </div>
        </div>
      </el-col>
      
      <el-col :span="6">
        <div class="quick-actions-card">
          <h3 class="quick-title">快捷入口</h3>
          <div class="quick-actions">
            <router-link to="/flash-sale" class="quick-action-item flash">
              <el-icon><Lightning /></el-icon>
              <span>秒杀</span>
            </router-link>
            <router-link to="/coupon" class="quick-action-item coupon">
              <el-icon><Ticket /></el-icon>
              <span>优惠券</span>
            </router-link>
            <router-link to="/group-buy" class="quick-action-item group">
              <el-icon><UserFilled /></el-icon>
              <span>拼团</span>
            </router-link>
            <router-link to="/lottery" class="quick-action-item lottery">
              <el-icon><Present /></el-icon>
              <span>抽奖</span>
            </router-link>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="section-title">
      <h2>业务模块</h2>
      <p>点击进入各业务模块进行管理</p>
    </div>

    <el-row :gutter="20">
      <el-col :span="8" v-for="module in modules" :key="module.name">
        <router-link :to="module.path" class="module-card">
          <div class="module-icon" :style="{ background: module.gradient }">
            <el-icon :size="36">{{ module.icon }}</el-icon>
          </div>
          <div class="module-info">
            <h3 class="module-name">{{ module.name }}</h3>
            <p class="module-desc">{{ module.desc }}</p>
          </div>
          <div class="module-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </router-link>
      </el-col>
    </el-row>

    <div class="section-title" style="margin-top: 40px">
      <h2>技术架构</h2>
      <p>系统采用微前端 + 微服务架构设计</p>
    </div>

    <el-row :gutter="20">
      <el-col :span="12">
        <div class="tech-card">
          <h3 class="tech-title">前端架构</h3>
          <div class="tech-list">
            <div class="tech-item">
              <div class="tech-badge frontend">主应用</div>
              <div class="tech-info">
                <h4>Gateway (主应用)</h4>
                <p>端口: 8000 | Qiankun 主应用</p>
              </div>
            </div>
            <div class="tech-item">
              <div class="tech-badge mfe">微前端</div>
              <div class="tech-info">
                <h4>7个独立微前端应用</h4>
                <p>端口: 4001-4007 | 独立开发部署</p>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      
      <el-col :span="12">
        <div class="tech-card">
          <h3 class="tech-title">后端架构</h3>
          <div class="tech-list">
            <div class="tech-item">
              <div class="tech-badge service">微服务</div>
              <div class="tech-info">
                <h4>8个独立微服务</h4>
                <p>端口: 3001-3008 | Express.js</p>
              </div>
            </div>
            <div class="tech-item">
              <div class="tech-badge data">数据</div>
              <div class="tech-info">
                <h4>本地 JSON 存储</h4>
                <p>独立数据文件 | 零依赖</p>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
const modules = [
  {
    name: '活动配置',
    desc: '管理各类促销活动配置',
    path: '/activity',
    icon: 'Calendar',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)'
  },
  {
    name: '秒杀专场',
    desc: '限时秒杀抢购管理',
    path: '/flash-sale',
    icon: 'Lightning',
    gradient: 'linear-gradient(135deg, #ff6b6b, #ee5a24)'
  },
  {
    name: '拼团活动',
    desc: '多人拼团优惠活动',
    path: '/group-buy',
    icon: 'UserFilled',
    gradient: 'linear-gradient(135deg, #11998e, #38ef7d)'
  },
  {
    name: '优惠券',
    desc: '优惠券发放与使用管理',
    path: '/coupon',
    icon: 'Ticket',
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)'
  },
  {
    name: '抽奖活动',
    desc: '抽奖转盘与奖品管理',
    path: '/lottery',
    icon: 'Present',
    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)'
  },
  {
    name: '积分中心',
    desc: '积分获取与兑换管理',
    path: '/points',
    icon: 'Coin',
    gradient: 'linear-gradient(135deg, #fa709a, #fee140)'
  },
  {
    name: '分销中心',
    desc: '分销商佣金与团队管理',
    path: '/distribution',
    icon: 'Share',
    gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)'
  }
]
</script>

<style scoped>
.home-container {
  padding-bottom: 40px;
}

.welcome-section {
  margin-bottom: 30px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
}

.welcome-content {
  flex: 1;
}

.welcome-title {
  font-size: 28px;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.welcome-desc {
  font-size: 14px;
  opacity: 0.9;
  margin: 0 0 24px 0;
  max-width: 500px;
  line-height: 1.7;
}

.welcome-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.welcome-image {
  opacity: 0.9;
}

.quick-actions-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  height: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.quick-title {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #333;
  font-weight: 600;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.quick-action-item:hover {
  transform: translateY(-2px);
}

.quick-action-item.flash {
  background: linear-gradient(135deg, #fff0f0, #ffe4e4);
  color: #ff6b6b;
}

.quick-action-item.coupon {
  background: linear-gradient(135deg, #fdf4ff, #fae8ff);
  color: #c026d3;
}

.quick-action-item.group {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  color: #059669;
}

.quick-action-item.lottery {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  color: #2563eb;
}

.quick-action-item .el-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.quick-action-item span {
  font-size: 14px;
  font-weight: 500;
}

.section-title {
  margin-bottom: 20px;
}

.section-title h2 {
  font-size: 20px;
  margin: 0 0 8px 0;
  color: #1a1a2e;
  font-weight: 600;
}

.section-title p {
  font-size: 14px;
  margin: 0;
  color: #666;
}

.module-card {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.module-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 16px;
}

.module-info {
  flex: 1;
}

.module-name {
  font-size: 16px;
  margin: 0 0 4px 0;
  color: #1a1a2e;
  font-weight: 600;
}

.module-desc {
  font-size: 13px;
  margin: 0;
  color: #999;
}

.module-arrow {
  color: #ccc;
  transition: color 0.3s ease;
}

.module-card:hover .module-arrow {
  color: #ff6b6b;
}

.tech-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.tech-title {
  font-size: 16px;
  margin: 0 0 20px 0;
  color: #1a1a2e;
  font-weight: 600;
}

.tech-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
}

.tech-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.tech-badge.frontend {
  background: #eff6ff;
  color: #2563eb;
}

.tech-badge.mfe {
  background: #fdf4ff;
  color: #c026d3;
}

.tech-badge.service {
  background: #ecfdf5;
  color: #059669;
}

.tech-badge.data {
  background: #fef3c7;
  color: #d97706;
}

.tech-info h4 {
  font-size: 14px;
  margin: 0 0 4px 0;
  color: #1a1a2e;
}

.tech-info p {
  font-size: 12px;
  margin: 0;
  color: #666;
}
</style>
