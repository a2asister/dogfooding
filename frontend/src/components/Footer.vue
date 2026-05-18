<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>🎮 星际幻想</h3>
          <p>沉浸式科幻MMORPG游戏</p>
          <div class="social-links">
            <a href="#">微信公众号</a>
            <a href="#">官方微博</a>
            <a href="#">玩家QQ群</a>
          </div>
        </div>
        <div class="footer-section">
          <h4>快速链接</h4>
          <router-link to="/intro">游戏介绍</router-link>
          <router-link to="/news">新闻资讯</router-link>
          <router-link to="/events">活动中心</router-link>
          <router-link to="/download">下载游戏</router-link>
        </div>
        <div class="footer-section">
          <h4>玩家服务</h4>
          <router-link to="/service">账号帮助</router-link>
          <router-link to="/service">问题反馈</router-link>
          <a href="#">客服中心</a>
        </div>
        <div class="footer-section">
          <h4>合规公示</h4>
          <router-link to="/compliance/user_agreement">用户协议</router-link>
          <router-link to="/compliance/privacy_policy">隐私政策</router-link>
          <router-link to="/compliance/minor_protection">未成年人保护</router-link>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2024 星际幻想. All rights reserved.</p>
        <p>备案号：粤ICP备XXXXXXXX号 | 网络文化经营许可证</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.site-footer {
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  padding: 48px 0 24px;
  margin-top: 80px;

  .footer-content {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
  }

  .footer-section {
    display: flex;
    flex-direction: column;
    gap: 16px;

    h3 {
      font-size: 20px;
      background: linear-gradient(135deg, var(--secondary-color), var(--accent-purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
    }

    h4 {
      font-size: 16px;
      color: var(--text-primary);
      margin: 0;
    }

    p {
      color: var(--text-secondary);
      font-size: 14px;
      margin: 0;
    }

    a {
      color: var(--text-secondary);
      font-size: 14px;
      transition: color 0.3s ease;

      &:hover {
        color: var(--secondary-color);
      }
    }
  }

  .social-links {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .footer-bottom {
    border-top: 1px solid var(--border-color);
    padding-top: 24px;
    text-align: center;

    p {
      color: var(--text-secondary);
      font-size: 13px;
      margin: 4px 0;
    }
  }
}
</style>
