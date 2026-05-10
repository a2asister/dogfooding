<template>
  <div class="login-page-container">
    <el-card class="login-card" shadow="always">
      <template #header>
        <h2 class="login-title">智能表单引擎</h2>
        <p class="login-subtitle">动态表单搭建平台</p>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="用户名/邮箱" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名或邮箱"
            size="large"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

        <div style="text-align: center">
          <el-text type="primary" class="cursor-pointer" @click="goToRegister">
            没有账号？点击注册
          </el-text>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const loading = ref(false)

const formData = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  const result = await authStore.loginAction(formData)
  loading.value = false

  if (result.success) {
    ElMessage.success('登录成功')
    router.push('/')
  } else {
    ElMessage.error(result.error || '登录失败')
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>
