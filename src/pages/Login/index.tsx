import React, { useState } from 'react'
import { Form, Input, Button, Card, message, Checkbox } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, RocketOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import './index.css'

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const onFinish = async (values: { username: string; password: string; remember: boolean }) => {
    setLoading(true)
    try {
      const success = await login(values.username, values.password)
      if (success) {
        message.success('登录成功')
        navigate('/dashboard')
      } else {
        message.error('用户名或密码错误')
      }
    } catch {
      message.error('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay" />
      </div>
      <div className="login-content">
        <Card className="login-card" bordered={false}>
          <div className="login-header">
            <div className="login-logo">
              <RocketOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </div>
            <h1 className="login-title">机场综合运营管理系统</h1>
            <p className="login-subtitle">Airport Integrated Operation Management System</p>
          </div>

          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
            style={{ marginTop: 32 }}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="密码"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>记住我</Checkbox>
                </Form.Item>
                <a href="#" style={{ color: '#1890ff' }}>忘记密码?</a>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ width: '100%', height: 48, fontSize: 16 }}
              >
                登 录
              </Button>
            </Form.Item>
          </Form>

          <div className="login-footer">
            <p style={{ color: '#999', fontSize: 12, margin: 0 }}>
              测试账号: admin / 123456
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Login
