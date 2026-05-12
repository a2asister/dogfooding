<template>
  <div class="login-container">
    <div class="login-box">
      <h1>团队展示系统</h1>
      <p class="subtitle">请登录以继续</p>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>邮箱</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="请输入邮箱"
            required
          />
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="请输入密码"
            required
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="test-accounts">
        <p>测试账号：</p>
        <ul>
          <li>zhangsan@example.com / 123456</li>
          <li>lisi@example.com / 123456</li>
          <li>wangwu@example.com / 123456</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import gql from 'graphql-tag'

@Component
export default class Login extends Vue {
  email = ''
  password = ''
  loading = false
  error = ''

  async handleLogin() {
    this.loading = true
    this.error = ''

    try {
      const response = await (this as any).$apollo.mutate({
        mutation: gql`
          mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
              id
              name
              email
              token
            }
          }
        `,
        variables: {
          email: this.email,
          password: this.password
        }
      })

      const user = response.data.login
      localStorage.setItem('user', JSON.stringify(user))
      
      await (this as any).$apollo.mutate({
        mutation: gql`
          mutation Heartbeat($userId: String!) {
            heartbeat(userId: $userId) {
              id
              isOnline
            }
          }
        `,
        variables: { userId: user.id }
      })

      ;(this as any).$router.push('/team')
    } catch (err: any) {
      this.error = err.message || '登录失败，请检查邮箱和密码'
    } finally {
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-box {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  h1 {
    text-align: center;
    color: #1f2937;
    font-size: 28px;
    margin-bottom: 8px;
  }

  .subtitle {
    text-align: center;
    color: #6b7280;
    margin-bottom: 32px;
  }
}

.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    color: #374151;
    font-weight: 500;
    margin-bottom: 8px;
    font-size: 14px;
  }

  input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    font-size: 15px;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.test-accounts {
  margin-top: 30px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;

  p {
    color: #6b7280;
    font-size: 14px;
    margin-bottom: 10px;
  }

  ul {
    list-style: none;
    
    li {
      color: #4b5563;
      font-size: 13px;
      padding: 4px 0;
      font-family: monospace;
    }
  }
}
</style>
