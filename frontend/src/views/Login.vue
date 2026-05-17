<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo">
        <el-icon size="48" color="#409eff"><Picture /></el-icon>
        <h1>图文社区</h1>
      </div>
      
      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="密码登录" name="password">
          <el-form ref="passwordFormRef" :model="passwordForm" label-width="80px" @submit.prevent="handlePasswordLogin">
            <el-form-item label="用户名/手机号" prop="account">
              <el-input v-model="passwordForm.account" placeholder="请输入用户名或手机号" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="passwordForm.password" type="password" placeholder="请输入密码" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="w-full" @click="handlePasswordLogin" :loading="loading">登录</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="手机号登录" name="phone">
          <el-form ref="phoneFormRef" :model="phoneForm" label-width="80px" @submit.prevent="handlePhoneLogin">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="phoneForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="验证码" prop="code">
              <el-input v-model="phoneForm.code" placeholder="请输入验证码">
                <template #append>
                  <el-button :disabled="countdown > 0" @click="sendCode">
                    {{ countdown > 0 ? `${countdown}秒后重发` : '获取验证码' }}
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="w-full" @click="handlePhoneLogin" :loading="loading">登录</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      
      <div class="footer-text">
        还没有账号？<el-link type="primary" @click="$router.push('/register')">立即注册</el-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { login, phoneLogin } from '@/api/auth';
import { ElMessage } from 'element-plus';
import { Picture } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref('password');
const loading = ref(false);
const countdown = ref(0);

const passwordFormRef = ref();
const passwordForm = reactive({
  account: '',
  password: '',
});

const phoneFormRef = ref();
const phoneForm = reactive({
  phone: '',
  code: '',
});

const handlePasswordLogin = async () => {
  if (!passwordForm.account || !passwordForm.password) {
    ElMessage.warning('请填写完整信息');
    return;
  }
  
  loading.value = true;
  try {
    const isPhone = /^1[3-9]\d{9}$/.test(passwordForm.account);
    const res = await login({
      [isPhone ? 'phone' : 'username']: passwordForm.account,
      password: passwordForm.password,
    });
    
    userStore.setToken(res.token);
    userStore.setUser(res.user);
    ElMessage.success('登录成功');
    router.push('/');
  } catch (error) {
    console.error('登录失败:', error);
  } finally {
    loading.value = false;
  }
};

const handlePhoneLogin = async () => {
  if (!phoneForm.phone || !phoneForm.code) {
    ElMessage.warning('请填写完整信息');
    return;
  }
  
  loading.value = true;
  try {
    const res = await phoneLogin(phoneForm);
    userStore.setToken(res.token);
    userStore.setUser(res.user);
    ElMessage.success('登录成功');
    router.push('/');
  } catch (error) {
    console.error('登录失败:', error);
  } finally {
    loading.value = false;
  }
};

const sendCode = () => {
  if (!phoneForm.phone) {
    ElMessage.warning('请先输入手机号');
    return;
  }
  ElMessage.success('验证码已发送，测试验证码：123456');
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  
  .logo {
    text-align: center;
    margin-bottom: 30px;
    
    h1 {
      margin-top: 10px;
      color: #333;
      font-size: 24px;
    }
  }
  
  .login-tabs {
    margin-bottom: 20px;
  }
  
  .w-full {
    width: 100%;
  }
  
  .footer-text {
    text-align: center;
    margin-top: 20px;
    color: #666;
    font-size: 14px;
  }
}
</style>
