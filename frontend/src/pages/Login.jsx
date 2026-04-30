import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  message,
  Tabs,
  Divider
} from 'antd'
import {
  HomeOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import styled from 'styled-components'

const { Content } = Layout

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`

const LoginCard = styled(Card)`
  width: 420px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  
  .ant-card-head {
    text-align: center;
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .ant-card-head-title {
    font-size: 24px;
    font-weight: 600;
  }
  
  .ant-card-body {
    padding-top: 16px;
  }
`

const Logo = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
  .logo-icon {
    font-size: 48px;
    color: #1890ff;
  }
  
  .logo-text {
    font-size: 28px;
    font-weight: 600;
    color: #1890ff;
    margin-top: 8px;
  }
`

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const { login, register } = useAuthStore()
  
  const onLogin = async (values) => {
    setLoading(true)
    try {
      const result = await login(values.username, values.password)
      if (result.success) {
        message.success('登录成功')
        navigate('/dashboard')
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('登录失败')
    } finally {
      setLoading(false)
    }
  }
  
  const onRegister = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }
    
    setLoading(true)
    try {
      const result = await register(values.username, values.password, values.email)
      if (result.success) {
        message.success('注册成功，请登录')
        setActiveTab('login')
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('注册失败')
    } finally {
      setLoading(false)
    }
  }
  
  const loginForm = (
    <Form
      name="login"
      onFinish={onLogin}
      autoComplete="off"
      layout="vertical"
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder="用户名" 
          size="large"
        />
      </Form.Item>
      
      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="密码"
          size="large"
        />
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block size="large">
          登录
        </Button>
      </Form.Item>
    </Form>
  )
  
  const registerForm = (
    <Form
      name="register"
      onFinish={onRegister}
      autoComplete="off"
      layout="vertical"
    >
      <Form.Item
        name="username"
        rules={[
          { required: true, message: '请输入用户名' },
          { min: 3, message: '用户名至少3个字符' }
        ]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder="用户名" 
          size="large"
        />
      </Form.Item>
      
      <Form.Item
        name="email"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]}
      >
        <Input 
          prefix={<MailOutlined />} 
          placeholder="邮箱" 
          size="large"
        />
      </Form.Item>
      
      <Form.Item
        name="password"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少6个字符' }
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="密码"
          size="large"
        />
      </Form.Item>
      
      <Form.Item
        name="confirmPassword"
        rules={[{ required: true, message: '请确认密码' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="确认密码"
          size="large"
        />
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block size="large">
          注册
        </Button>
      </Form.Item>
    </Form>
  )
  
  const tabItems = [
    {
      key: 'login',
      label: '登录',
      children: loginForm
    },
    {
      key: 'register',
      label: '注册',
      children: registerForm
    }
  ]
  
  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <HomeOutlined className="logo-icon" />
          <div className="logo-text">智能家居管理系统</div>
        </Logo>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={tabItems}
          centered
        />
        
        <Divider style={{ margin: '24px 0' }} />
        
        <div style={{ textAlign: 'center', color: '#8c8c8c', fontSize: '12px' }}>
          支持灯光、家电、门窗、安防、环境传感器等全屋硬件统一管控
        </div>
      </LoginCard>
    </LoginContainer>
  )
}

export default Login