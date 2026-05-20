import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, GithubOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api';
import { useAuthStore } from '@/store/auth';
import type { User } from '@/types';

function Login(): JSX.Element {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (values: { username: string; password: string }): Promise<void> => {
    try {
      const result = await authApi.login(values.username, values.password);
      login(result.token, result.user as User);
      message.success('登录成功');
      navigate('/dashboard');
    } catch {
      // error handled by interceptor
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card style={{ width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, marginBottom: 8, color: '#1677ff' }}>CICD 自动化平台</h1>
          <p style={{ color: '#666' }}>企业级持续集成与持续交付平台</p>
        </div>

        <Form name="login" onFinish={handleSubmit} autoComplete="off" size="large">
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', color: '#999', margin: '16px 0' }}>或</div>

          <Button
            icon={<GithubOutlined />}
            style={{ width: '100%' }}
            onClick={() => { window.location.href = authApi.getGithubLoginUrl(); }}
          >
            GitHub 账号登录
          </Button>
        </Form>

        <div style={{ marginTop: 16, textAlign: 'center', color: '#999', fontSize: 12 }}>
          <p>默认账号: admin / admin123</p>
        </div>
      </Card>
    </div>
  );
}

export default Login;
