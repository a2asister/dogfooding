<template>
  <div class="home">
    <Fireworks />
    
    <nav class="navbar">
      <h1 class="logo">🎨 贺卡工坊</h1>
      <div class="nav-actions">
        <template v-if="userStore.user">
          <span class="welcome-text">欢迎, {{ userStore.user.nickname }}</span>
          <router-link to="/portfolio" class="btn outline">作品集</router-link>
          <button class="btn outline" @click="handleLogout">退出</button>
        </template>
        <template v-else>
          <button class="btn outline" @click="showLogin = true">登录</button>
          <button class="btn primary" @click="showRegister = true">注册</button>
        </template>
      </div>
    </nav>

    <div class="hero">
      <AnimatedText :delay="0.2">
        <h2 class="title">制作精美贺卡，传递温暖祝福</h2>
      </AnimatedText>
      <AnimatedText :delay="0.5">
        <p class="subtitle">选择模板，自定义内容，一键发送给好友</p>
      </AnimatedText>
      <div class="hero-buttons">
        <router-link to="/editor" class="btn primary large">开始制作</router-link>
        <button class="btn outline large" @click="scrollToTemplates">浏览模板</button>
      </div>
    </div>

    <div class="templates-section" ref="templatesRef">
      <h2 class="section-title">热门贺卡模板</h2>
      
      <div class="category-tabs">
        <button 
          v-for="cat in categories" 
          :key="cat"
          class="tab-btn"
          :class="{ active: selectedCategory === cat }"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <div class="templates-grid">
        <div class="template-card" v-for="template in filteredTemplates" :key="template.id">
          <div class="template-preview" :style="{ background: template.background }">
            <h3>{{ template.defaultContent.title }}</h3>
            <div class="template-decorations">
              <span v-for="dec in template.decorations.slice(0, 3)" :key="dec.id" class="deco-emoji">
                {{ dec.emoji }}
              </span>
            </div>
          </div>
          <div class="template-info">
            <h3>{{ template.name }}</h3>
            <p>{{ template.description }}</p>
            <button class="use-btn" @click="useTemplate(template)">使用模板</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showLogin || showRegister" class="modal-overlay" @click="closeModal">
      <div class="modal-content auth-modal" @click.stop>
        <h2>{{ showLogin ? '登录' : '注册' }}</h2>
        <form @submit.prevent="handleAuth">
          <div class="form-group">
            <label>用户名</label>
            <input v-model="authForm.username" type="text" placeholder="请输入用户名" required />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input v-model="authForm.password" type="password" placeholder="请输入密码" required />
          </div>
          <div v-if="showRegister" class="form-group">
            <label>昵称（可选）</label>
            <input v-model="authForm.nickname" type="text" placeholder="请输入昵称" />
          </div>
          <button type="submit" class="btn primary submit-btn">
            {{ showLogin ? '登录' : '注册' }}
          </button>
          <p class="switch-auth">
            {{ showLogin ? '还没有账号？' : '已有账号？' }}
            <a @click="switchAuth">{{ showLogin ? '立即注册' : '立即登录' }}</a>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCardStore, type CardTemplate } from '@/stores/card'
import Fireworks from '@/components/Fireworks.vue'
import AnimatedText from '@/components/AnimatedText.vue'

const router = useRouter()
const userStore = useUserStore()
const cardStore = useCardStore()

const templatesRef = ref<HTMLElement | null>(null)
const showLogin = ref(false)
const showRegister = ref(false)
const selectedCategory = ref('全部')

const categories = ['全部', '节日', '生日', '爱情', '感谢']

const authForm = ref({
  username: '',
  password: '',
  nickname: ''
})

const filteredTemplates = computed(() => {
  if (selectedCategory.value === '全部') {
    return cardStore.templates
  }
  return cardStore.templates.filter(t => t.category === selectedCategory.value)
})

const scrollToTemplates = (): void => {
  templatesRef.value?.scrollIntoView({ behavior: 'smooth' })
}

const useTemplate = (template: CardTemplate): void => {
  router.push({
    path: '/editor',
    query: { templateId: template.id }
  })
}

const closeModal = (): void => {
  showLogin.value = false
  showRegister.value = false
  resetForm()
}

const switchAuth = (): void => {
  showLogin.value = !showLogin.value
  showRegister.value = !showRegister.value
  resetForm()
}

const resetForm = (): void => {
  authForm.value = { username: '', password: '', nickname: '' }
}

const handleAuth = async (): Promise<void> => {
  try {
    const url = showLogin.value ? '/api/users/login' : '/api/users/register'
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm.value)
    })
    
    if (response.ok) {
      const data = await response.json()
      if (showLogin.value) {
        userStore.setUser(data.user, data.token)
      } else {
        alert('注册成功，请登录')
        switchAuth()
        return
      }
      closeModal()
    } else {
      const error = await response.json()
      alert(error.message || '操作失败')
    }
  } catch {
    alert('网络错误，请重试')
  }
}

const handleLogout = (): void => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
  }
}

const loadTemplates = async (): Promise<void> => {
  try {
    const response = await fetch('/api/templates')
    if (response.ok) {
      const data = await response.json()
      cardStore.setTemplates(data)
    }
  } catch {
    console.error('加载模板失败')
  }
}

onMounted(() => {
  loadTemplates()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  position: relative;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
}

.logo {
  color: white;
  font-size: 1.5rem;
  margin: 0;
}

.nav-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.welcome-text {
  color: rgba(255, 255, 255, 0.8);
}

.hero {
  text-align: center;
  padding: 80px 20px 100px;
}

.title {
  font-size: 3rem;
  color: white;
  margin-bottom: 20px;
  text-shadow: 0 4px 20px rgba(102, 126, 234, 0.5);
}

.subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn.large {
  padding: 15px 40px;
  font-size: 1.1rem;
}

.templates-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 80px;
}

.section-title {
  color: white;
  font-size: 2rem;
  text-align: center;
  margin-bottom: 30px;
}

.category-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 10px 25px;
  border-radius: 25px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover,
.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.template-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.template-card:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.template-preview {
  padding: 40px 20px;
  text-align: center;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.template-preview h3 {
  color: white;
  font-size: 1.3rem;
  margin-bottom: 15px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.template-decorations {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.deco-emoji {
  font-size: 1.5rem;
}

.template-info {
  padding: 20px;
}

.template-info h3 {
  color: white;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.template-info p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.use-btn {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.use-btn:hover {
  transform: scale(1.02);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.auth-modal {
  width: 90%;
  max-width: 400px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 40px;
  border-radius: 20px;
}

.auth-modal h2 {
  color: white;
  text-align: center;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.form-group input:focus {
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.15);
}

.submit-btn {
  width: 100%;
  padding: 14px;
  margin-top: 10px;
}

.switch-auth {
  text-align: center;
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.7);
}

.switch-auth a {
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
}

.btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn.outline {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn:hover {
  transform: translateY(-2px);
}
</style>
