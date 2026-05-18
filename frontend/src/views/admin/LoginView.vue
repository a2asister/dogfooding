<template>
  <div class="admin-login">
    <div class="login-container">
      <div class="login-card card">
        <div class="login-header">
          <div class="logo">🎮</div>
          <h1>管理后台</h1>
          <p>游戏官网管理系统</p>
        </div>
        <el-form :model="loginForm" @submit.prevent="handleLogin">
          <el-form-item>
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">
              登 录
            </el-button>
          </el-form-item>
        </el-form>
        <div class="login-footer">
          <p>默认账号：admin / admin123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { adminApi } from '../../api'
import { useAdminStore } from '../../store/useAdminStore'

const router = useRouter()
const adminStore = useAdminStore()

const loading = ref(false)
const loginForm = reactive({
  username: '',
  password: ''
})

const handleLogin = async (): Promise<void> => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.error('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    const result = await adminApi.login({
      username: loginForm.username,
      password: loginForm.password
    })
    adminStore.login(result)
    ElMessage.success('登录成功')
    router.push('/admin')
  } catch {
    ElMessage.error('用户名或密码错误')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  adminStore.initFromStorage()
  if (adminStore.isLoggedIn) {
    router.push('/admin')
  }
})
</script>

<style scoped lang="scss">
.admin-login {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-purple));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-card {
  padding: 40px;

  .login-header {
    text-align: center;
    margin-bottom: 32px;

    .logo {
      font-size: 64px;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 28px;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    p {
      color: var(--text-secondary);
      font-size: 14px;
    }
  }

  .login-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    background: linear-gradient(135deg, var(--secondary-color), var(--accent-purple));
    border: none;
  }

  .login-footer {
    text-align: center;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--border-color);

    p {
      color: var(--text-secondary);
      font-size: 13px;
      margin: 0;
    }
  }
}

:deep(.el-input__wrapper) {
  background: var(--bg-dark);
  box-shadow: 0 0 0 1px var(--border-color) inset;
  color: var(--text-primary);

  &:hover, &.is-focus {
    box-shadow: 0 0 0 1px var(--secondary-color) inset;
  }
}

:deep(.el-input__inner::placeholder) {
  color: var(--text-secondary);
}

:deep(.el-input__prefix-inner) {
  color: var(--text-secondary);
}
</style>
