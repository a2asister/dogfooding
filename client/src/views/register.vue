<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '../utils/request'

const router = useRouter()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const handleRegister = async () => {
  if (!username.value || !password.value) {
    alert('请输入用户名和密码')
    return
  }

  if (password.value !== confirmPassword.value) {
    alert('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    const res: any = await request.post('/register', {
      username: username.value,
      password: password.value
    })
    
    if (res.code === 200) {
      alert('注册成功，请登录')
      router.push('/login')
    } else {
      alert(res.message)
    }
  } catch (e) {
    alert('注册失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-container">
    <div class="register-card card">
      <h1 class="register-title">注册</h1>
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
        />
      </div>
      <div class="form-group">
        <label>确认密码</label>
        <input
          v-model="confirmPassword"
          type="password"
          class="input"
          placeholder="请再次输入密码"
          @keyup.enter="handleRegister"
        />
      </div>
      <button
        class="btn btn-primary register-btn"
        :disabled="loading"
        @click="handleRegister"
      >
        {{ loading ? '注册中...' : '注册' }}
      </button>
      <div class="register-footer">
        已有账号？
        <router-link to="/login" class="link">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  width: 400px;
}

.register-title {
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

.register-btn {
  width: 100%;
  height: 45px;
  font-size: 16px;
}

.register-footer {
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
