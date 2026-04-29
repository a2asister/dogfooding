import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Checkbox, message, Typography } from 'antd'
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

const { Title, Text } = Typography

const Login: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/dashboard'
      navigate(redirect, { replace: true })
    }
  }, [isAuthenticated, navigate, searchParams])

  useEffect(() => {
    if (error) {
      message.error(error)
      clearError()
    }
  }, [error, clearError])

  const onFinish = async (values: { username: string; password: string; remember?: boolean }) => {
    const success = await login({
      username: values.username,
      password: values.password,
    })

    if (success) {
      message.success('登录成功！')
      const redirect = searchParams.get('redirect') || '/dashboard'
      navigate(redirect, { replace: true })
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{ width: 400, padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#fff', margin: 0 }}>
            Project Manager
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
            项目管理平台 - 让协作更高效
          </Text>
        </div>

        <Card style={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <Title level={4} style={{ marginBottom: 24, textAlign: 'center' }}>
            用户登录
          </Title>

          <Form
            form={form}
            name="login"
            initialValues={{ username: 'admin', password: 'admin123', remember: true }}
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#999' }} />}
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#999' }} />}
                placeholder="密码"
                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>记住我</Checkbox>
                </Form.Item>
                <a style={{ color: '#1890ff' }}>忘记密码?</a>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={isLoading}
              >
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ marginTop: 16, padding: 12, background: '#f6ffed', borderRadius: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <strong>演示账号:</strong>
              <br />
              用户名: admin / 密码: admin123
              <br />
              或: zhangsan / 123456
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Login
