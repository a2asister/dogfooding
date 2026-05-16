<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import request from '../utils/request'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    alert('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    const res: any = await request.post('/login', {
      username: username.value,
      password: password.value
    })
    
    if (res.code === 200) {
      userStore.setToken(res.data.token)
      userStore.setUser(res.data.user)
      router.push('/')
    } else {
      alert(res.message)
    }
  } catch (e) {
    alert('登录失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card card">
      <h1 class="login-title">登录</h1>
      <div class="form-group">
        <label>用户名</label>
        <input
          v-model="username"
          type="text"
          class="input"
          placeholder="请输入用户名"
        />
      </div>
      <div class="form-group">
        <label>密码</label>
        <input
          v-model="password"
          type="password"
          class="input"
          placeholder="请输入密码"
          @keyup.enter="handleLogin"
        />
      </div>
      <button
        class="btn btn-primary login-btn"
        :disabled="loading"
        @click="handleLogin"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>
      <div class="login-footer">
        没有账号？
        <router-link to="/register" class="link">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  height: 45px;
  font-size: 16px;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.link {
  color: #1890ff;
  text-decoration: none;
  margin-left: 5px;
}

.link:hover {
  text-decoration: underline;
}
</style>
