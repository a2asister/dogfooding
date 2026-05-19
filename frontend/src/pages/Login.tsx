import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { authApi, type LoginParams } from '@/services'

export default function Login() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, token } = useAuthStore()

  if (token) {
    const from = (location.state as { from?: string })?.from || '/'
    return <Navigate to={from} replace />
  }

  const onFinish = async (values: LoginParams) => {
    try {
      const res = await authApi.login(values)
      login(res.data.data.token, res.data.data.user)
      message.success('登录成功')
      navigate('/')
    } catch {
      // error handled in interceptor
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <h1 className="login-title">API接口管理平台</h1>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            label="用户名/邮箱"
            rules={[{ required: true, message: '请输入用户名或邮箱' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名或邮箱" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              登录
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
            默认账号: admin / admin123456
          </div>
        </Form>
      </Card>
    </div>
  )
}
