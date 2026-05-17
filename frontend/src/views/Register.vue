<template>
  <div class="register-page">
    <div class="register-card">
      <div class="logo">
        <el-icon size="48" color="#409eff"><Picture /></el-icon>
        <h1>图文社区</h1>
      </div>
      
      <h2>注册新账号</h2>
      
      <el-form ref="formRef" :model="form" label-width="80px">
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="w-full" @click="handleRegister" :loading="loading">注册</el-button>
        </el-form-item>
      </el-form>
      
      <div class="footer-text">
        已有账号？<el-link type="primary" @click="$router.push('/login')">立即登录</el-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { register } from '@/api/auth';
import { ElMessage } from 'element-plus';
import { Picture } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const formRef = ref();
const form = reactive({
  nickname: '',
  username: '',
  phone: '',
  password: '',
});

const handleRegister = async () => {
  if (!form.nickname || !form.username || !form.password) {
    ElMessage.warning('请填写完整信息');
    return;
  }
  
  loading.value = true;
  try {
    const res = await register(form);
    userStore.setToken(res.token);
    userStore.setUser(res.user);
    ElMessage.success('注册成功');
    router.push('/');
  } catch (error) {
    console.error('注册失败:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  
  .logo {
    text-align: center;
    margin-bottom: 20px;
  }
  
  h1 {
    margin-top: 10px;
    color: #333;
    font-size: 24px;
  }
  
  h2 {
    text-align: center;
    font-size: 18px;
    color: #666;
    margin-bottom: 30px;
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
